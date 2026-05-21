#!/usr/bin/env python3
"""Pre-fetch Pexels image URLs for any meal in meals.ts / indian-meals.ts not
already in apps/mobile/src/lib/dish-image-urls.json. Writes back the merged map."""

import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MEAL_FILES = [
    ROOT / "packages/shared/src/constants/meals.ts",
    ROOT / "packages/shared/src/constants/indian-meals.ts",
]
ENV_FILE = ROOT / "apps/mobile/.env"
JSON_FILE = ROOT / "apps/mobile/src/lib/dish-image-urls.json"

# ── Load Pexels API key from apps/mobile/.env ────────────────────────────
pexels_key = ""
for line in ENV_FILE.read_text().splitlines():
    line = line.strip()
    if line.startswith("EXPO_PUBLIC_PEXELS_API_KEY="):
        pexels_key = line.split("=", 1)[1].strip().strip('"').strip("'")
        break

if not pexels_key:
    print("ERROR: EXPO_PUBLIC_PEXELS_API_KEY not found in apps/mobile/.env")
    raise SystemExit(1)


# ── Extract meal names from the .ts files ────────────────────────────────
def extract_names() -> list[str]:
    names: list[str] = []
    name_re = re.compile(r'^\s*name:\s*"([^"]+)"', re.MULTILINE)
    for f in MEAL_FILES:
        if not f.exists():
            continue
        for m in name_re.finditer(f.read_text()):
            names.append(m.group(1))
    # Dedup while preserving order
    seen = set()
    out = []
    for n in names:
        if n not in seen:
            seen.add(n)
            out.append(n)
    return out


# ── Pexels search ────────────────────────────────────────────────────────
def fetch_pexels(query: str) -> str | None:
    # Clean: drop parentheticals, "+" joins → spaces
    q = re.sub(r"\(.*?\)", "", query).replace("+", " ").strip()
    url = (
        "https://api.pexels.com/v1/search?"
        + urllib.parse.urlencode({"query": q, "per_page": 1, "orientation": "landscape"})
    )
    req = urllib.request.Request(url, headers={"Authorization": pexels_key})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())
    except Exception as e:
        print(f"  ERROR: {e}")
        return None
    photos = data.get("photos", [])
    if not photos:
        return None
    src = photos[0].get("src", {})
    # Match the existing JSON's URL style: ?auto=compress&cs=tinysrgb&h=650&w=940
    return src.get("large") or src.get("original")


# ── Main ─────────────────────────────────────────────────────────────────
def main():
    existing = json.loads(JSON_FILE.read_text())
    names = extract_names()
    missing = [n for n in names if n not in existing]
    print(f"Total meals: {len(names)}  ·  in map: {len(existing)}  ·  missing: {len(missing)}\n")

    if not missing:
        print("Nothing to fetch.")
        return

    added = 0
    failed = []
    for i, name in enumerate(missing, 1):
        print(f"[{i:>2}/{len(missing)}] {name}", end=" ... ", flush=True)
        url = fetch_pexels(name)
        if url:
            existing[name] = url
            added += 1
            print("OK")
        else:
            failed.append(name)
            print("NO MATCH")
        # Throttle to be polite to free Pexels tier (200/hr)
        if i < len(missing):
            time.sleep(0.4)

    # Write back, preserving sort order: prepend new entries, keep map sorted by name for cleanliness
    out = dict(sorted(existing.items(), key=lambda kv: kv[0].lower()))
    JSON_FILE.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n")
    print(f"\nDone. Added {added}, total map size: {len(existing)}.")
    if failed:
        print(f"No match for: {failed}")


if __name__ == "__main__":
    main()
