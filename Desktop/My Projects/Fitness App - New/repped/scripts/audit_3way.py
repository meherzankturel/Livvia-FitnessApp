#!/usr/bin/env python3
"""3-way macro audit: current authored vs Edamam vs local DB (USDA values with
realistic per-unit weights). Generates an HTML review page.

Strategy:
  - Local DB is the most reliable source (we control unit weights correctly)
  - Edamam shown for cross-reference (often inflates due to slice parsing)
  - Current = what's authored in meals.ts now
  - Recommendation: if Local DB resolved ≥70% ingredients AND its delta < 15%,
    accept current. Else flag for manual review or recommend Local DB value.
"""

import json
import subprocess
from pathlib import Path
from ingredient_db import compute_meal

ROOT = Path(__file__).resolve().parent.parent
SHARED_DIST = ROOT / "packages/shared/dist/constants"
EDAMAM_JSON = ROOT / "mockups" / "macro-audit-report.json"
OUT_HTML = ROOT / "mockups" / "macro-audit-3way.html"
OUT_JSON = ROOT / "mockups" / "macro-audit-3way.json"


def load_meals() -> list[dict]:
    js = f"""
const m = require('{SHARED_DIST}/meals');
const i = require('{SHARED_DIST}/indian-meals');
const all = [...m.MEAL_TEMPLATES, ...(i.INDIAN_MEAL_TEMPLATES || [])];
console.log(JSON.stringify(all));
"""
    r = subprocess.run(["node", "-e", js], capture_output=True, text=True, check=True)
    return json.loads(r.stdout)


def load_edamam() -> dict[str, dict]:
    if not EDAMAM_JSON.exists():
        return {}
    raw = json.loads(EDAMAM_JSON.read_text())
    return {r["name"]: r["audited"] for r in raw.get("rows", [])}


def main():
    meals = load_meals()
    edamam_map = load_edamam()
    print(f"Loaded {len(meals)} meals, {len(edamam_map)} with Edamam data\n")

    results = []
    for meal in meals:
        cur = {
            "calories": meal.get("calories", 0),
            "protein_g": meal.get("protein_g", 0),
            "carbs_g": meal.get("carbs_g", 0),
            "fat_g": meal.get("fat_g", 0),
        }
        local = compute_meal(meal)
        ed = edamam_map.get(meal["name"], {})

        # Compute deltas
        local_delta_pct = ((local["calories"] - cur["calories"]) / cur["calories"] * 100) if cur["calories"] else 0
        ed_delta_pct = ((ed.get("calories", 0) - cur["calories"]) / cur["calories"] * 100) if cur["calories"] else 0

        # Recommendation logic
        # If local DB resolved ≥70% of ingredients, trust it
        # If delta vs current is < 10%, accept current
        # Else recommend local DB value
        if local["resolved_pct"] < 70:
            status = "needs_review"   # too many unresolved ingredients
            recommend = "manual"
        elif abs(local_delta_pct) <= 10:
            status = "verified"        # current is accurate
            recommend = "keep"
        elif abs(local_delta_pct) <= 20:
            status = "minor_adjust"
            recommend = "consider_local"
        else:
            status = "major_diff"
            recommend = "update_to_local"

        results.append({
            "name": meal["name"],
            "cuisine": meal.get("cuisine") or "—",
            "category": meal.get("category", "—"),
            "current": cur,
            "local_db": local,
            "edamam": ed if "calories" in ed else None,
            "local_delta_pct": round(local_delta_pct),
            "edamam_delta_pct": round(ed_delta_pct) if ed else None,
            "status": status,
            "recommend": recommend,
        })

    # Sort: needs_review first, then by |local_delta| desc
    rank = {"needs_review": 0, "major_diff": 1, "minor_adjust": 2, "verified": 3}
    results.sort(key=lambda r: (rank[r["status"]], -abs(r["local_delta_pct"])))

    # ── Generate HTML ──
    counts = {"verified": 0, "minor_adjust": 0, "major_diff": 0, "needs_review": 0}
    for r in results:
        counts[r["status"]] += 1

    html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Meal Macro Audit — 3-way</title>
<style>
  body{{margin:0;padding:0;background:#0f0d0a;color:#f5f1e8;font-family:-apple-system,sans-serif}}
  .head{{padding:32px 32px 8px}}
  .head h1{{font-size:24px;font-weight:800;margin:0 0 6px;letter-spacing:-0.4px}}
  .head p{{color:#9b958a;font-size:13px;max-width:920px;line-height:1.55;margin:0 0 16px}}
  .summary{{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px}}
  .pill{{background:#1a1714;border-radius:99px;padding:6px 14px;font-size:12px;font-weight:700}}
  .pill.verified{{background:rgba(52,211,153,0.16);color:#4ade80}}
  .pill.minor_adjust{{background:rgba(234,179,8,0.16);color:#facc15}}
  .pill.major_diff{{background:rgba(239,68,68,0.16);color:#fca5a5}}
  .pill.needs_review{{background:rgba(168,168,173,0.16);color:#d4d4d8}}
  .legend{{font-size:12px;color:#9b958a;margin:6px 0 0;line-height:1.5}}
  .table{{padding:8px 32px 64px}}
  .row{{display:grid;grid-template-columns:24px 220px 110px 100px 1fr;gap:14px;align-items:center;padding:10px 14px;border-radius:10px;margin-bottom:4px;font-size:13px;background:#1a1714}}
  .row.verified{{background:rgba(52,211,153,0.06)}}
  .row.minor_adjust{{background:rgba(234,179,8,0.07)}}
  .row.major_diff{{background:rgba(239,68,68,0.08);border-left:3px solid #ef4444}}
  .row.needs_review{{background:rgba(168,168,173,0.06)}}
  .row .nm{{font-weight:700;letter-spacing:-0.1px}}
  .row .cui{{font-size:10px;color:#9b958a;text-transform:uppercase;letter-spacing:0.1em;font-weight:700}}
  .row .vals{{display:flex;gap:6px;align-items:center;font-size:11px}}
  .row .vals .b{{padding:3px 7px;border-radius:6px;background:#252220;color:#cfc8b8;font-variant-numeric:tabular-nums;font-weight:600}}
  .row .vals .b.cur{{background:#2b2722;color:#f5f1e8}}
  .row .vals .b.local{{background:rgba(52,211,153,0.18);color:#86efac}}
  .row .vals .b.edamam{{background:rgba(239,68,68,0.18);color:#fca5a5}}
  .row .vals .lbl{{font-size:9px;color:#807a72;font-weight:700;letter-spacing:0.08em}}
  .row .unr{{font-size:10px;color:#fcd34d}}
  .row .recommend{{font-size:11px;font-weight:700;letter-spacing:-0.1px}}
  .row .recommend.keep{{color:#86efac}}
  .row .recommend.consider_local{{color:#facc15}}
  .row .recommend.update_to_local{{color:#fca5a5}}
  .row .recommend.manual{{color:#d4d4d8}}
  .icon{{text-align:center;font-size:14px}}
  details{{margin:8px 0;background:#1a1714;border-radius:10px;padding:10px 14px}}
  details summary{{cursor:pointer;font-weight:700;font-size:13px;color:#d4d4d8;letter-spacing:-0.1px}}
  details ul{{margin:8px 0 0;padding-left:20px;font-size:11px;color:#9b958a;line-height:1.6}}
</style>
</head>
<body>
<div class="head">
  <h1>Meal Macro Audit — 3-Way Cross-Check</h1>
  <p>For each of {len(results)} meals, comparing <b>current authored value</b> against <b>Local DB</b> (computed from USDA per-ingredient values with corrected unit weights) and <b>Edamam</b> (API; over-estimates "slices"/"pieces" by 2-3×, so values are advisory only).</p>
  <div class="summary">
    <div class="pill verified">✓ Verified ≤10% delta · {counts['verified']}</div>
    <div class="pill minor_adjust">~ Minor 10-20% · {counts['minor_adjust']}</div>
    <div class="pill major_diff">⚠ Major &gt;20% · {counts['major_diff']}</div>
    <div class="pill needs_review">? Needs review · {counts['needs_review']}</div>
  </div>
  <div class="legend">
    <b>Recommendation column:</b> keep = current is accurate (≤10% from Local DB)
    · consider_local = small adjustment (Local DB suggests 10-20% change)
    · update_to_local = strong recommendation (&gt;20% diff)
    · manual = too many unresolved ingredients in Local DB — needs human review
  </div>
</div>

<div class="table">
"""

    for r in results:
        unresolved_count = len(r["local_db"]["unresolved"])
        unr_text = f' · {unresolved_count} unresolved' if unresolved_count else ""

        cur_str = f"{r['current']['calories']} cal"
        local_str = f"{r['local_db']['calories']} cal" if r['local_db']['resolved_pct'] >= 30 else "—"
        ed_str = f"{r['edamam']['calories']} cal" if r['edamam'] else "—"

        local_delta = f"{r['local_delta_pct']:+d}%" if r['local_db']['resolved_pct'] >= 30 else "—"

        rec_text = {
            "keep": "✓ keep current",
            "consider_local": "~ minor adjust",
            "update_to_local": "⚠ update to Local DB",
            "manual": "? needs manual",
        }[r["recommend"]]

        html += f"""  <div class="row {r['status']}">
    <div class="icon">{'✓' if r['status']=='verified' else '~' if r['status']=='minor_adjust' else '⚠' if r['status']=='major_diff' else '?'}</div>
    <div>
      <div class="nm">{r['name']}</div>
      <div class="cui">{r['cuisine']} · {r['category']} · {r['local_db']['resolved_pct']}% resolved{unr_text}</div>
    </div>
    <div class="vals">
      <div><span class="lbl">CUR</span><span class="b cur">{cur_str}</span></div>
    </div>
    <div class="vals">
      <div><span class="lbl">LOCAL</span><span class="b local">{local_str} ({local_delta})</span></div>
    </div>
    <div class="vals">
      <div><span class="lbl">EDAMAM</span><span class="b edamam">{ed_str}</span></div>
      <div class="recommend {r['recommend']}">{rec_text}</div>
    </div>
  </div>
"""
        if r["local_db"]["unresolved"]:
            unr_list = "".join(f"<li>{u}</li>" for u in r["local_db"]["unresolved"][:8])
            extra = f"<li><i>+{unresolved_count - 8} more…</i></li>" if unresolved_count > 8 else ""
            html += f'  <details><summary>Unresolved ingredients in {r["name"]}</summary><ul>{unr_list}{extra}</ul></details>\n'

    html += "</div></body></html>"

    OUT_HTML.write_text(html)
    OUT_JSON.write_text(json.dumps(results, indent=2, ensure_ascii=False))
    print(f"✓ Wrote {OUT_HTML}")
    print(f"✓ Wrote {OUT_JSON}")
    print(f"\nSummary:")
    print(f"  ✓ Verified (≤10% delta): {counts['verified']}")
    print(f"  ~ Minor adjust (10-20%): {counts['minor_adjust']}")
    print(f"  ⚠ Major diff (>20%): {counts['major_diff']}")
    print(f"  ? Needs manual review: {counts['needs_review']}")


if __name__ == "__main__":
    main()
