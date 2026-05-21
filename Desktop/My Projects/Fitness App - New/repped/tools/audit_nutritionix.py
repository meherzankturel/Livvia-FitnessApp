#!/usr/bin/env python3
"""
Audit meal macros against Nutritionix Natural Language API (free tier).

Nutritionix accepts Gmail signups (unlike Edamam which requires business email)
and offers 200 free requests/day on the Personal plan — plenty for 100 meals.

Required env vars (sign up at developer.nutritionix.com):
    NUTRITIONIX_APP_ID
    NUTRITIONIX_APP_KEY

How it works:
  1. For each meal, build a natural-language ingredient list
     (e.g. "1 cup rice and 2 large eggs and 1 tbsp olive oil")
  2. POST to /v2/natural/nutrients — returns parsed foods with nutrition
  3. Sum the per-food nutrition → recipe total
  4. Divide by servings → per-serving values
  5. Compare to listed macros

Caching: every API response is saved to tools/nutritionix_cache/<hash>.json
so re-runs only query meals that haven't been checked. Safe to Ctrl+C.

Throttle: 2 req/sec free-tier limit. Script paces at 700ms/call for safety.
~100 meals → 70-120 seconds total.

Output:
    tools/nutritionix_report.csv     — per-meal comparison
    tools/nutritionix_cache/*.json   — raw API responses
    Console summary                  — flagged meals
"""

import csv
import hashlib
import json
import os
import re
import sys
import time
from pathlib import Path
from urllib import request, error

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))
from audit_macros import parse_meals, MEAL_FILES, ROOT

CACHE_DIR = ROOT / "tools" / "nutritionix_cache"
CACHE_DIR.mkdir(exist_ok=True)
OUT_CSV = ROOT / "tools" / "nutritionix_report.csv"
API_URL = "https://trackapi.nutritionix.com/v2/natural/nutrients"

# 2 req/sec free tier limit. 700ms spacing leaves safety margin.
REQUEST_INTERVAL_S = 0.7
ACCEPT_PCT = 15.0


def get_credentials():
    app_id = os.environ.get("NUTRITIONIX_APP_ID")
    app_key = os.environ.get("NUTRITIONIX_APP_KEY")
    if not app_id or not app_key:
        print("ERROR: Set NUTRITIONIX_APP_ID and NUTRITIONIX_APP_KEY env vars first.", file=sys.stderr)
        print("Sign up at https://developer.nutritionix.com/signup to get credentials.", file=sys.stderr)
        sys.exit(2)
    return app_id, app_key


def cache_key(meal_name: str, query: str) -> str:
    payload = meal_name + "||" + query
    return hashlib.md5(payload.encode("utf-8")).hexdigest()[:16]


def build_query(meal: dict) -> str:
    """Convert structured ingredients to a natural-language sentence for Nutritionix."""
    parts = []
    for ing in meal["ingredients"]:
        name = ing["name"].strip()
        amount = ing["amount"].strip()
        unit = ing["unit"].strip()
        if amount.lower() in ("to taste", "as needed", "for garnish", ""):
            continue
        # Strip parentheticals
        name_clean = re.sub(r"\([^)]*\)", "", name).strip()
        unit_clean = re.sub(r"\([^)]*\)", "", unit).strip()
        if unit_clean:
            parts.append(f"{amount} {unit_clean} {name_clean}")
        else:
            parts.append(f"{amount} {name_clean}")
    return " and ".join(parts)


def call_nutritionix(app_id: str, app_key: str, query: str) -> dict | None:
    body = json.dumps({"query": query}).encode("utf-8")
    req = request.Request(API_URL, data=body, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("x-app-id", app_id)
    req.add_header("x-app-key", app_key)
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


def sum_foods(api_response: dict) -> dict | None:
    """Sum nutrition across all foods Nutritionix parsed from the query."""
    if not api_response or "foods" not in api_response:
        return None
    foods = api_response["foods"]
    if not foods:
        return None
    total = {"calories": 0.0, "protein_g": 0.0, "carbs_g": 0.0, "fat_g": 0.0, "parsed_count": len(foods)}
    for food in foods:
        total["calories"] += float(food.get("nf_calories") or 0)
        total["protein_g"] += float(food.get("nf_protein") or 0)
        total["carbs_g"] += float(food.get("nf_total_carbohydrate") or 0)
        total["fat_g"] += float(food.get("nf_total_fat") or 0)
    return total


def pct_diff(a: float, b: float) -> float:
    if b == 0:
        return 0.0 if a == 0 else float("inf")
    return (a - b) / b * 100.0


def main():
    app_id, app_key = get_credentials()

    all_meals = []
    for fp in MEAL_FILES:
        if not fp.exists():
            continue
        all_meals.extend(parse_meals(fp))
    print(f"Loaded {len(all_meals)} meals\n", file=sys.stderr)

    rows = []
    last_at = 0.0
    queried = 0
    cached = 0

    for idx, meal in enumerate(all_meals, 1):
        listed = meal["listed"]
        servings = meal.get("servings", 1) or 1
        query = build_query(meal)

        if not query:
            rows.append({
                "name": meal["name"], "source": meal["source"], "servings": servings,
                "status": "SKIPPED", "reason": "no parseable ingredients",
                "listed_calories": listed["calories"],
                "nutritionix_kcal_total": "", "nutritionix_kcal_per_serving": "", "kcal_diff_pct": "",
                "listed_protein_g": listed["protein_g"], "nutritionix_P_per_serving": "", "p_diff_pct": "",
                "listed_carbs_g": listed["carbs_g"], "nutritionix_C_per_serving": "", "c_diff_pct": "",
                "listed_fat_g": listed["fat_g"], "nutritionix_F_per_serving": "", "f_diff_pct": "",
            })
            continue

        ck = cache_key(meal["name"], query)
        cache_path = CACHE_DIR / f"{ck}.json"
        response = None
        if cache_path.exists():
            try:
                response = json.loads(cache_path.read_text())
                cached += 1
            except json.JSONDecodeError:
                response = None

        if response is None:
            elapsed = time.time() - last_at
            if elapsed < REQUEST_INTERVAL_S:
                time.sleep(REQUEST_INTERVAL_S - elapsed)
            print(f"[{idx}/{len(all_meals)}] querying: {meal['name'][:60]}", file=sys.stderr)
            response = call_nutritionix(app_id, app_key, query)
            last_at = time.time()
            queried += 1
            if response is not None:
                cache_path.write_text(json.dumps(response, indent=2))

        totals = sum_foods(response) if response else None
        if not totals:
            rows.append({
                "name": meal["name"], "source": meal["source"], "servings": servings,
                "status": "API_FAIL", "reason": "Nutritionix returned no data",
                "listed_calories": listed["calories"],
                "nutritionix_kcal_total": "", "nutritionix_kcal_per_serving": "", "kcal_diff_pct": "",
                "listed_protein_g": listed["protein_g"], "nutritionix_P_per_serving": "", "p_diff_pct": "",
                "listed_carbs_g": listed["carbs_g"], "nutritionix_C_per_serving": "", "c_diff_pct": "",
                "listed_fat_g": listed["fat_g"], "nutritionix_F_per_serving": "", "f_diff_pct": "",
            })
            continue

        kcal_ps = totals["calories"] / servings
        p_ps = totals["protein_g"] / servings
        c_ps = totals["carbs_g"] / servings
        f_ps = totals["fat_g"] / servings

        d_kcal = pct_diff(kcal_ps, listed["calories"])
        d_p = pct_diff(p_ps, listed["protein_g"])
        d_c = pct_diff(c_ps, listed["carbs_g"])
        d_f = pct_diff(f_ps, listed["fat_g"])

        worst = max(abs(d_kcal), abs(d_p), abs(d_c), abs(d_f))
        status = "OK" if worst <= ACCEPT_PCT else "VARIANCE"

        rows.append({
            "name": meal["name"], "source": meal["source"], "servings": servings,
            "status": status, "reason": "",
            "listed_calories": listed["calories"],
            "nutritionix_kcal_total": round(totals["calories"], 1),
            "nutritionix_kcal_per_serving": round(kcal_ps, 1),
            "kcal_diff_pct": round(d_kcal, 1),
            "listed_protein_g": listed["protein_g"],
            "nutritionix_P_per_serving": round(p_ps, 1),
            "p_diff_pct": round(d_p, 1),
            "listed_carbs_g": listed["carbs_g"],
            "nutritionix_C_per_serving": round(c_ps, 1),
            "c_diff_pct": round(d_c, 1),
            "listed_fat_g": listed["fat_g"],
            "nutritionix_F_per_serving": round(f_ps, 1),
            "f_diff_pct": round(d_f, 1),
        })

    # CSV
    if rows:
        ordered = [
            "name", "source", "servings", "status", "reason",
            "listed_calories", "nutritionix_kcal_total", "nutritionix_kcal_per_serving", "kcal_diff_pct",
            "listed_protein_g", "nutritionix_P_per_serving", "p_diff_pct",
            "listed_carbs_g", "nutritionix_C_per_serving", "c_diff_pct",
            "listed_fat_g", "nutritionix_F_per_serving", "f_diff_pct",
        ]
        with open(OUT_CSV, "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=ordered, extrasaction="ignore")
            w.writeheader()
            w.writerows(rows)

    total = len(rows)
    ok = sum(1 for r in rows if r["status"] == "OK")
    variance = sum(1 for r in rows if r["status"] == "VARIANCE")
    skipped = sum(1 for r in rows if r["status"] in ("SKIPPED", "API_FAIL"))
    print()
    print("═══════════════════════════════════════════════════════════")
    print(f"  NUTRITIONIX AUDIT — {total} meals processed")
    print(f"  API queries this run: {queried}   Cache hits: {cached}")
    print("═══════════════════════════════════════════════════════════")
    print(f"  ✓ OK         ({ok:>3}): within ±{ACCEPT_PCT:.0f}% of Nutritionix")
    print(f"  ⚠ VARIANCE   ({variance:>3}): >{ACCEPT_PCT:.0f}% disagreement with Nutritionix")
    print(f"  ? SKIPPED    ({skipped:>3}): no ingredients parseable or API failed")
    print("═══════════════════════════════════════════════════════════")
    print(f"  Full report: {OUT_CSV.relative_to(ROOT)}")
    print()

    if variance:
        flagged = [r for r in rows if r["status"] == "VARIANCE"]
        flagged.sort(key=lambda r: -abs(float(r["kcal_diff_pct"])))
        print(f"Top {min(15, len(flagged))} variance meals (worst first):")
        print(f"  {'Meal':<45} {'listed':>7} {'edamam':>7} {'Δ%':>7}")
        for r in flagged[:15]:
            print(f"  {r['name'][:45]:<45} {r['listed_calories']:>7} {r['nutritionix_kcal_per_serving']:>7} {r['kcal_diff_pct']:>+6}%")

    return 0


if __name__ == "__main__":
    sys.exit(main())
