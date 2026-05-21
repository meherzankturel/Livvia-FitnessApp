#!/usr/bin/env python3
"""
Annotate every meal in indian-meals.ts and meals.ts with a `servings` field.

Strategy: reconstruct each recipe's total calories using the USDA reference
table from audit_macros.py. Compare against the listed (per-serving) calories.
The ratio `computed_total / listed` is the implied serving count for that recipe.

  - Ratio rounded to nearest int, clamped to [1, 4].
  - Recipes where reconstruction has too little ingredient coverage (<60%)
    default to servings: 1 (safest assumption for fitness-app single-portion items).

After this runs, the audit script can divide computed totals by servings,
making variance numbers meaningful for the first time.

Writes the servings field into each meal block, in-place, immediately after
the existing `fat_g:` line. Idempotent — re-running updates the value.
"""

import json
import re
import sys
from pathlib import Path

# Import the reference data & helpers from audit_macros without copy/paste.
SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))
from audit_macros import (
    parse_meals,
    reconstruct_macros,
    MEAL_FILES,
    ROOT,
)

CLAMP_MIN = 1
CLAMP_MAX = 4
COVERAGE_THRESHOLD = 0.60  # below this, default servings to 1


def infer_servings(meal: dict) -> tuple[int, str]:
    """Return (servings, reason)."""
    recon = reconstruct_macros(meal)
    listed_kcal = meal["listed"]["calories"]
    coverage = recon["resolved_count"] / max(1, recon["total_count"])
    if coverage < COVERAGE_THRESHOLD:
        return (1, f"low coverage ({coverage:.0%}); default 1")
    if listed_kcal <= 0:
        return (1, "listed kcal is 0; default 1")
    ratio = recon["computed"]["calories"] / listed_kcal
    rounded = max(CLAMP_MIN, min(CLAMP_MAX, round(ratio)))
    return (rounded, f"computed/listed ratio = {ratio:.2f} → {rounded}")


def annotate_file(ts_path: Path, servings_map: dict[str, int]):
    """Insert `servings: N,` after `fat_g:` for each meal in the file."""
    text = ts_path.read_text(encoding="utf-8")
    updated = 0
    # Match meal blocks via name + fat_g line. Use the meal name to look up servings.
    # We'll do a per-name regex pass: find the name, then find the next fat_g: line
    # within the same block, and insert servings after it (if not already present).
    for name, servings in servings_map.items():
        # Escape regex-special chars in name
        name_esc = re.escape(name)
        # Pattern: name line, then any content up to `fat_g: N,`, capturing it.
        # We'll only modify blocks that don't already have `servings:` between
        # the name and the next `fat_g:` line.
        block_pattern = re.compile(
            r'(name:\s*"' + name_esc + r'"\s*,)'   # 1: name line
            r'(.*?)'                                # 2: middle (description, calories, etc.)
            r'(fat_g:\s*\d+(?:\.\d+)?\s*,)',        # 3: fat_g line
            re.DOTALL,
        )
        def repl(m):
            nonlocal updated
            middle = m.group(2)
            if re.search(r'\bservings\s*:', middle + m.group(3)):
                return m.group(0)  # already annotated, skip
            updated += 1
            return f'{m.group(1)}{middle}{m.group(3)}\n    servings: {servings},'
        text = block_pattern.sub(repl, text, count=1)

    ts_path.write_text(text, encoding="utf-8")
    return updated


def main():
    all_meals = []
    for fp in MEAL_FILES:
        meals = parse_meals(fp)
        for m in meals:
            m["__source_path"] = fp
        all_meals.extend(meals)

    print(f"Inferring servings for {len(all_meals)} meals...\n", file=sys.stderr)

    servings_per_file: dict[Path, dict[str, int]] = {}
    summary = []
    for meal in all_meals:
        servings, reason = infer_servings(meal)
        fp = meal["__source_path"]
        servings_per_file.setdefault(fp, {})[meal["name"]] = servings
        summary.append((meal["name"], servings, reason))

    # Apply to files
    total_updated = 0
    for fp, smap in servings_per_file.items():
        n = annotate_file(fp, smap)
        print(f"Updated {n}/{len(smap)} meals in {fp.name}", file=sys.stderr)
        total_updated += n

    # Distribution summary
    dist = {}
    for _, s, _ in summary:
        dist[s] = dist.get(s, 0) + 1

    print(f"\nServings distribution:")
    for s in sorted(dist):
        bar = "█" * (dist[s] // 2)
        print(f"  {s} serving{'s' if s != 1 else ' '} : {dist[s]:>3}  {bar}")

    # Save mapping for transparency
    out = ROOT / "tools" / "servings_inferred.json"
    with open(out, "w") as f:
        json.dump({m[0]: {"servings": m[1], "reason": m[2]} for m in summary},
                  f, indent=2)
    print(f"\nDetailed inference: {out.relative_to(ROOT)}", file=sys.stderr)
    print(f"Annotated {total_updated} meals total.", file=sys.stderr)


if __name__ == "__main__":
    main()
