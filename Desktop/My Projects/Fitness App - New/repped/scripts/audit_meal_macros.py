#!/usr/bin/env python3
"""Audit meal macros in meals.ts + indian-meals.ts against Edamam Nutrition
Analysis API. Edamam wraps USDA — same data hospitals use.

For each meal:
  1. Format recipe.ingredients as natural-language strings
  2. POST to Edamam /api/nutrition-details
  3. Compare returned calories/protein/carbs/fat with authored values
  4. Output Markdown table with deltas + status flags

Usage:
  python scripts/audit_meal_macros.py            # full audit, all 131 meals
  python scripts/audit_meal_macros.py --test     # quick sanity check (4 meals)
  python scripts/audit_meal_macros.py --only "Classic French Omelette"
"""

import argparse
import json
import os
import subprocess
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path
from urllib.error import HTTPError, URLError

ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = ROOT / ".env.local"
SHARED_DIST = ROOT / "packages/shared/dist/constants"
REPORT_FILE = ROOT / "mockups" / "macro-audit-report.md"

# ── Load API credentials ─────────────────────────────────────────────────
APP_ID = APP_KEY = None
for line in ENV_FILE.read_text().splitlines():
    if line.startswith("EDAMAM_APP_ID="):
        APP_ID = line.split("=", 1)[1].strip()
    elif line.startswith("EDAMAM_APP_KEY="):
        APP_KEY = line.split("=", 1)[1].strip()

if not APP_ID or not APP_KEY:
    print("ERROR: EDAMAM_APP_ID and EDAMAM_APP_KEY must be in .env.local")
    sys.exit(1)

EDAMAM_URL = (
    f"https://api.edamam.com/api/nutrition-details"
    f"?app_id={APP_ID}&app_key={APP_KEY}"
)

# ── Load meals via Node subprocess ───────────────────────────────────────
def load_meals() -> list[dict]:
    js = f"""
const m = require('{SHARED_DIST}/meals');
const i = require('{SHARED_DIST}/indian-meals');
const all = [...m.MEAL_TEMPLATES, ...(i.INDIAN_MEAL_TEMPLATES || [])];
console.log(JSON.stringify(all));
"""
    result = subprocess.run(
        ["node", "-e", js], capture_output=True, text=True, check=True
    )
    return json.loads(result.stdout)


# ── Format ingredient lines for Edamam ───────────────────────────────────
def format_ingredient(ing: dict) -> str | None:
    amount = (ing.get("amount") or "").strip()
    unit = (ing.get("unit") or "").strip()
    name = (ing.get("name") or "").strip()

    if not name:
        return None
    if amount.lower() in ("to taste", ""):
        return f"1 pinch of {name}"

    # "1.5 cups Greek yogurt"  vs  "3 large eggs"  vs  "1 pinch salt"
    if unit:
        return f"{amount} {unit} {name}"
    return f"{amount} {name}"


# ── Call Edamam ──────────────────────────────────────────────────────────
def fetch_edamam_macros(meal: dict, max_retries: int = 3) -> dict | None:
    ingredients = meal.get("recipe", {}).get("ingredients", [])
    if not ingredients:
        return None
    ingr_lines = [format_ingredient(i) for i in ingredients]
    ingr_lines = [s for s in ingr_lines if s]
    if not ingr_lines:
        return None

    body = json.dumps({
        "title": meal["name"],
        "ingr": ingr_lines,
    }).encode()

    req = urllib.request.Request(
        EDAMAM_URL,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    for attempt in range(max_retries):
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                data = json.loads(resp.read())
            # Free tier doesn't return totalNutrients — sum from per-ingredient breakdown
            tot = {"ENERC_KCAL": 0.0, "PROCNT": 0.0, "CHOCDF": 0.0, "FAT": 0.0}
            tot_weight = 0.0
            parsed_count = 0
            for ing in data.get("ingredients", []):
                for p in (ing.get("parsed") or []):
                    parsed_count += 1
                    tot_weight += p.get("weight", 0) or 0
                    for key in tot:
                        n = (p.get("nutrients") or {}).get(key, {})
                        tot[key] += n.get("quantity", 0) or 0
            if parsed_count == 0:
                return {"error": "no ingredients parsed"}
            servings = meal.get("servings", 1) or 1
            return {
                "calories": round(tot["ENERC_KCAL"] / servings),
                "protein_g": round(tot["PROCNT"] / servings),
                "carbs_g": round(tot["CHOCDF"] / servings),
                "fat_g": round(tot["FAT"] / servings),
                "weight_g": round(tot_weight / servings),
                "parsed_count": parsed_count,
            }
        except HTTPError as e:
            err_body = e.read().decode(errors="replace")[:200] if hasattr(e, 'read') else ""
            if e.code == 429:
                wait = (attempt + 1) * 30
                print(f"  429 rate-limited, waiting {wait}s...", end=" ", flush=True)
                time.sleep(wait)
                continue
            return {"error": f"HTTP {e.code}: {err_body[:80]}"}
        except URLError as e:
            return {"error": f"network: {e.reason}"}
        except Exception as e:
            return {"error": str(e)[:80]}
    return {"error": "max retries"}


# ── Status classification ────────────────────────────────────────────────
def status_for(delta_pct: float, cuisine: str) -> str:
    abs_d = abs(delta_pct)
    if abs_d <= 10:
        return "verified"
    if cuisine == "indian" and abs_d > 15:
        return "flag_ifct"
    if abs_d > 15:
        return "recommend_update"
    return "borderline"


# ── Run audit ────────────────────────────────────────────────────────────
def run(meals: list[dict]):
    rows = []
    failed = []
    SLEEP = 6.5  # free tier: 10/min, stay under

    print(f"\nAuditing {len(meals)} meals against Edamam (USDA-backed)\n")

    for i, meal in enumerate(meals, 1):
        name = meal["name"]
        cuisine = (meal.get("cuisine") or "—")
        cur = {
            "calories": meal.get("calories", 0),
            "protein_g": meal.get("protein_g", 0),
            "carbs_g": meal.get("carbs_g", 0),
            "fat_g": meal.get("fat_g", 0),
        }
        print(f"[{i:>3}/{len(meals)}] {name[:42]:<42} {cuisine:<14}", end=" ", flush=True)

        audited = fetch_edamam_macros(meal)
        if not audited or "error" in (audited or {}):
            err = (audited or {}).get("error", "no ingredients")
            print(f"FAIL ({err})")
            failed.append({"name": name, "err": err})
            time.sleep(SLEEP)
            continue

        delta_cal = audited["calories"] - cur["calories"]
        delta_pct = (delta_cal / cur["calories"] * 100) if cur["calories"] else 0
        st = status_for(delta_pct, cuisine)

        rows.append({
            "name": name,
            "cuisine": cuisine,
            "cur": cur,
            "audited": audited,
            "delta_cal": delta_cal,
            "delta_pct": delta_pct,
            "status": st,
        })

        flag = {
            "verified": "✓",
            "borderline": "·",
            "recommend_update": "⚠",
            "flag_ifct": "🇮🇳",
        }[st]
        sign = "+" if delta_cal >= 0 else ""
        print(f"{flag} cur={cur['calories']:>4} → edamam={audited['calories']:>4}  ({sign}{delta_pct:+.0f}%)")

        if i < len(meals):
            time.sleep(SLEEP)

    # ── Generate report ──
    print(f"\nGenerating report → {REPORT_FILE}")
    REPORT_FILE.parent.mkdir(parents=True, exist_ok=True)

    counts = {"verified": 0, "borderline": 0, "recommend_update": 0, "flag_ifct": 0}
    for r in rows:
        counts[r["status"]] += 1

    lines = []
    lines.append("# Meal Macro Audit Report")
    lines.append("")
    lines.append("Source: **Edamam Nutrition Analysis API** (USDA-backed).")
    lines.append("For Indian dishes flagged with 🇮🇳, cross-check against IFCT 2017 manually.")
    lines.append("")
    lines.append("## Summary")
    lines.append("")
    lines.append(f"- ✓ Verified (≤10% delta): **{counts['verified']}**")
    lines.append(f"- · Borderline (10-15%): **{counts['borderline']}**")
    lines.append(f"- ⚠ Recommend update (>15%): **{counts['recommend_update']}**")
    lines.append(f"- 🇮🇳 Flag for IFCT cross-check (Indian, >15%): **{counts['flag_ifct']}**")
    if failed:
        lines.append(f"- ✗ Failed to audit: **{len(failed)}**")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Full results (sorted by absolute delta, worst first)")
    lines.append("")
    lines.append("| Status | Meal | Cuisine | Cur cal | Edamam cal | Δ% | Cur P/C/F | Edamam P/C/F |")
    lines.append("|---|---|---|---|---|---|---|---|")

    rows.sort(key=lambda r: -abs(r["delta_pct"]))
    for r in rows:
        st_icon = {
            "verified": "✓",
            "borderline": "·",
            "recommend_update": "⚠",
            "flag_ifct": "🇮🇳",
        }[r["status"]]
        sign = "+" if r["delta_pct"] >= 0 else ""
        cur_pcf = f"{r['cur']['protein_g']}/{r['cur']['carbs_g']}/{r['cur']['fat_g']}"
        ed_pcf = f"{r['audited']['protein_g']}/{r['audited']['carbs_g']}/{r['audited']['fat_g']}"
        lines.append(
            f"| {st_icon} | {r['name']} | {r['cuisine']} "
            f"| {r['cur']['calories']} | {r['audited']['calories']} "
            f"| {sign}{r['delta_pct']:+.0f}% | {cur_pcf} | {ed_pcf} |"
        )

    if failed:
        lines.append("")
        lines.append("## Audit failures")
        lines.append("")
        lines.append("| Meal | Error |")
        lines.append("|---|---|")
        for f in failed:
            lines.append(f"| {f['name']} | {f['err']} |")

    # JSON sidecar for the auto-apply step
    json_out = REPORT_FILE.with_suffix(".json")
    json_out.write_text(json.dumps({"rows": rows, "failed": failed, "counts": counts}, indent=2, ensure_ascii=False))

    REPORT_FILE.write_text("\n".join(lines) + "\n")
    print(f"\n✓ Done. Report at {REPORT_FILE}")
    print(f"  Summary: ✓{counts['verified']}  ·{counts['borderline']}  ⚠{counts['recommend_update']}  🇮🇳{counts['flag_ifct']}  ✗{len(failed)}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--test", action="store_true", help="audit just 4 sample meals")
    ap.add_argument("--only", help="audit one meal by exact name")
    args = ap.parse_args()

    all_meals = load_meals()
    print(f"Loaded {len(all_meals)} meals from shared package")

    if args.only:
        match = [m for m in all_meals if m["name"] == args.only]
        if not match:
            print(f"No meal named '{args.only}'")
            sys.exit(1)
        run(match)
    elif args.test:
        keys = ["Classic French Omelette", "Mujadara", "Beef Bibimbap"]
        sample = [m for m in all_meals if m["name"] in keys]
        # Add an Indian dish too
        ind = next((m for m in all_meals if m.get("cuisine") == "indian"), None)
        if ind:
            sample.append(ind)
        run(sample)
    else:
        run(all_meals)


if __name__ == "__main__":
    main()
