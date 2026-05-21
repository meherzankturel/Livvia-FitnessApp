#!/usr/bin/env python3
"""
Audit meal macros against Edamam Nutrition Analysis API (free tier).

Why Edamam instead of raw USDA: Edamam parses free-text recipes against
a database that already includes COMPOSITE ingredients (idli batter,
chutneys, paneer dishes, etc.), not just raw USDA primitives. This gives
much better coverage for ethnic/prepared dishes than direct USDA reconstruction.

Required env vars (sign up at developer.edamam.com):
    EDAMAM_APP_ID
    EDAMAM_APP_KEY

Free-tier limits: 10 calls/min, 10,000/month. We pace at ~6s/call so we
stay well under the throttle. Each meal = 1 call. 100 meals ≈ 10-15 min.

Caching: every response is saved to tools/edamam_cache/<hash>.json so
re-running only queries meals that haven't been checked yet. Safe to
Ctrl+C and resume — you won't lose progress.

Output:
    tools/edamam_report.csv     — per-meal comparison
    tools/edamam_cache/*.json   — raw API responses (for inspection)
    Console summary             — flagged meals
"""

import csv
import hashlib
import json
import os
import re
import sys
import time
from pathlib import Path
from urllib import request, parse, error

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))
from audit_macros import parse_meals, MEAL_FILES, ROOT, classify_ingredient

CACHE_DIR = ROOT / "tools" / "edamam_cache"
CACHE_DIR.mkdir(exist_ok=True)
OUT_CSV = ROOT / "tools" / "edamam_report.csv"
API_URL = "https://api.edamam.com/api/nutrition-details"

# Throttle: 10/min free-tier. 7s spacing leaves a safety margin.
REQUEST_INTERVAL_S = 7.0
# Tolerance: meals within ±15% of Edamam's value are considered accurate
ACCEPT_PCT = 15.0


def get_credentials():
    app_id = os.environ.get("EDAMAM_APP_ID")
    app_key = os.environ.get("EDAMAM_APP_KEY")
    if not app_id or not app_key:
        print("ERROR: Set EDAMAM_APP_ID and EDAMAM_APP_KEY env vars first.", file=sys.stderr)
        print("Sign up at https://developer.edamam.com to get credentials.", file=sys.stderr)
        sys.exit(2)
    return app_id, app_key


def cache_key(meal_name: str, ingredients: list[str]) -> str:
    """Stable hash for caching — changes if name or ingredients change."""
    payload = meal_name + "||" + "||".join(ingredients)
    return hashlib.md5(payload.encode("utf-8")).hexdigest()[:16]


def to_natural_language(meal: dict) -> list[str]:
    """Convert our structured ingredients to Edamam's natural-language format."""
    out = []
    for ing in meal["ingredients"]:
        name = ing["name"].strip()
        amount = ing["amount"].strip()
        unit = ing["unit"].strip()
        # Skip ingredients with "to taste"/"as needed" — Edamam handles them poorly
        if amount.lower() in ("to taste", "as needed", "for garnish", ""):
            continue
        # Strip parentheticals from name and unit (Edamam doesn't need them)
        name_clean = re.sub(r"\([^)]*\)", "", name).strip()
        unit_clean = re.sub(r"\([^)]*\)", "", unit).strip()
        # Build natural language string
        if unit_clean:
            line = f"{amount} {unit_clean} {name_clean}"
        else:
            line = f"{amount} {name_clean}"
        out.append(line)
    return out


def call_edamam(app_id: str, app_key: str, title: str, ingredients: list[str]) -> dict | None:
    """POST to Edamam Nutrition Analysis API. Returns parsed JSON or None on error."""
    url = f"{API_URL}?app_id={parse.quote(app_id)}&app_key={parse.quote(app_key)}"
    body = json.dumps({"title": title, "ingr": ingredients}).encode("utf-8")
    req = request.Request(url, data=body, method="POST")
    req.add_header("Content-Type", "application/json")
    try:
        with request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except error.HTTPError as e:
        msg = e.read().decode("utf-8", errors="replace")[:300]
        print(f"  HTTP {e.code}: {msg}", file=sys.stderr)
        return None
    except error.URLError as e:
        print(f"  Network error: {e}", file=sys.stderr)
        return None


def extract_macros(api_response: dict) -> dict | None:
    """Sum kcal/protein/carbs/fat across all ingredients Edamam parsed.
    The free Developer tier doesn't include top-level totals so we aggregate
    from the per-ingredient nutrients ourselves."""
    if not api_response:
        return None
    ingredients = api_response.get("ingredients") or []
    if not ingredients:
        return None
    total = {"calories": 0.0, "protein_g": 0.0, "carbs_g": 0.0, "fat_g": 0.0, "weight_g": 0.0, "parsed_count": 0}
    for ing in ingredients:
        for p in (ing.get("parsed") or []):
            n = p.get("nutrients") or {}
            total["calories"] += float(n.get("ENERC_KCAL", {}).get("quantity") or 0)
            total["protein_g"] += float(n.get("PROCNT", {}).get("quantity") or 0)
            total["carbs_g"] += float(n.get("CHOCDF", {}).get("quantity") or 0)
            total["fat_g"] += float(n.get("FAT", {}).get("quantity") or 0)
            total["weight_g"] += float(p.get("retainedWeight") or p.get("weight") or 0)
            total["parsed_count"] += 1
    if total["parsed_count"] == 0:
        return None
    return total


def pct_diff(a: float, b: float) -> float:
    if b == 0:
        return 0.0 if a == 0 else float("inf")
    return (a - b) / b * 100.0


def main():
    app_id, app_key = get_credentials()

    # Parse all meals
    all_meals = []
    for fp in MEAL_FILES:
        if not fp.exists():
            continue
        all_meals.extend(parse_meals(fp))
    print(f"Loaded {len(all_meals)} meals\n", file=sys.stderr)

    rows = []
    last_request_at = 0.0
    queried = 0
    cached_hits = 0

    for idx, meal in enumerate(all_meals, 1):
        listed = meal["listed"]
        servings = meal.get("servings", 1) or 1
        ingredients = to_natural_language(meal)

        if not ingredients:
            rows.append({
                "name": meal["name"],
                "source": meal["source"],
                "servings": servings,
                "status": "SKIPPED",
                "reason": "no parseable ingredients",
                **{f"listed_{k}": v for k, v in listed.items()},
                "edamam_kcal_total": "",
                "edamam_kcal_per_serving": "",
                "kcal_diff_pct": "",
                "edamam_P_per_serving": "",
                "edamam_C_per_serving": "",
                "edamam_F_per_serving": "",
            })
            continue

        # Cache hit?
        ck = cache_key(meal["name"], ingredients)
        cache_path = CACHE_DIR / f"{ck}.json"
        if cache_path.exists():
            try:
                response = json.loads(cache_path.read_text())
                cached_hits += 1
            except json.JSONDecodeError:
                response = None
        else:
            response = None

        # Fetch if not cached
        if response is None:
            # Throttle
            elapsed = time.time() - last_request_at
            if elapsed < REQUEST_INTERVAL_S:
                wait = REQUEST_INTERVAL_S - elapsed
                time.sleep(wait)
            print(f"[{idx}/{len(all_meals)}] querying: {meal['name'][:60]}", file=sys.stderr)
            response = call_edamam(app_id, app_key, meal["name"], ingredients)
            last_request_at = time.time()
            queried += 1
            if response is not None:
                cache_path.write_text(json.dumps(response, indent=2))

        macros = extract_macros(response) if response else None
        if not macros:
            rows.append({
                "name": meal["name"],
                "source": meal["source"],
                "servings": servings,
                "status": "API_FAIL",
                "reason": "Edamam returned no data",
                **{f"listed_{k}": v for k, v in listed.items()},
                "edamam_kcal_total": "",
                "edamam_kcal_per_serving": "",
                "kcal_diff_pct": "",
                "edamam_P_per_serving": "",
                "edamam_C_per_serving": "",
                "edamam_F_per_serving": "",
            })
            continue

        # Compute per-serving
        kcal_ps = macros["calories"] / servings
        p_ps = macros["protein_g"] / servings
        c_ps = macros["carbs_g"] / servings
        f_ps = macros["fat_g"] / servings

        d_kcal = pct_diff(kcal_ps, listed["calories"])
        d_p = pct_diff(p_ps, listed["protein_g"])
        d_c = pct_diff(c_ps, listed["carbs_g"])
        d_f = pct_diff(f_ps, listed["fat_g"])

        worst = max(abs(d_kcal), abs(d_p), abs(d_c), abs(d_f))
        status = "OK" if worst <= ACCEPT_PCT else "VARIANCE"

        rows.append({
            "name": meal["name"],
            "source": meal["source"],
            "servings": servings,
            "status": status,
            "reason": "",
            "listed_calories": listed["calories"],
            "listed_protein_g": listed["protein_g"],
            "listed_carbs_g": listed["carbs_g"],
            "listed_fat_g": listed["fat_g"],
            "edamam_kcal_total": round(macros["calories"], 1),
            "edamam_kcal_per_serving": round(kcal_ps, 1),
            "kcal_diff_pct": round(d_kcal, 1),
            "edamam_P_per_serving": round(p_ps, 1),
            "p_diff_pct": round(d_p, 1),
            "edamam_C_per_serving": round(c_ps, 1),
            "c_diff_pct": round(d_c, 1),
            "edamam_F_per_serving": round(f_ps, 1),
            "f_diff_pct": round(d_f, 1),
        })

    # Write CSV
    if rows:
        # Normalize keys across rows
        all_keys = set()
        for r in rows:
            all_keys.update(r.keys())
        ordered = [
            "name", "source", "servings", "status", "reason",
            "listed_calories", "edamam_kcal_total", "edamam_kcal_per_serving", "kcal_diff_pct",
            "listed_protein_g", "edamam_P_per_serving", "p_diff_pct",
            "listed_carbs_g", "edamam_C_per_serving", "c_diff_pct",
            "listed_fat_g", "edamam_F_per_serving", "f_diff_pct",
        ]
        with open(OUT_CSV, "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=ordered, extrasaction="ignore")
            w.writeheader()
            w.writerows(rows)

    # Summary
    total = len(rows)
    ok = sum(1 for r in rows if r["status"] == "OK")
    variance = sum(1 for r in rows if r["status"] == "VARIANCE")
    skipped = sum(1 for r in rows if r["status"] in ("SKIPPED", "API_FAIL"))
    print()
    print("═══════════════════════════════════════════════════════════")
    print(f"  EDAMAM AUDIT — {total} meals processed")
    print(f"  API queries this run: {queried}   Cache hits: {cached_hits}")
    print("═══════════════════════════════════════════════════════════")
    print(f"  ✓ OK         ({ok:>3}): within ±{ACCEPT_PCT:.0f}% of Edamam's values")
    print(f"  ⚠ VARIANCE   ({variance:>3}): listed macros disagree with Edamam by >{ACCEPT_PCT:.0f}%")
    print(f"  ? SKIPPED    ({skipped:>3}): no ingredients parseable or API failed")
    print("═══════════════════════════════════════════════════════════")
    print(f"  Full report: {OUT_CSV.relative_to(ROOT)}")
    print(f"  Cached responses: {CACHE_DIR.relative_to(ROOT)}/")
    print()

    if variance:
        flagged = [r for r in rows if r["status"] == "VARIANCE"]
        flagged.sort(key=lambda r: -abs(float(r["kcal_diff_pct"])))
        print(f"Top {min(15, len(flagged))} variance meals (worst first):")
        print(f"  {'Meal':<45} {'listed':>7} {'edamam':>7} {'Δ%':>7}")
        for r in flagged[:15]:
            print(f"  {r['name'][:45]:<45} {r['listed_calories']:>7} {r['edamam_kcal_per_serving']:>7} {r['kcal_diff_pct']:>+6}%")

    return 0


if __name__ == "__main__":
    sys.exit(main())
