#!/usr/bin/env python3
"""Auto-apply Local-DB macro corrections to meals.ts + indian-meals.ts for all
meals flagged as 'major_diff' (>20% delta, ≥70% ingredient resolution) in the
3-way audit. Creates a .bak backup of each file before writing."""

import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AUDIT_JSON = ROOT / "mockups" / "macro-audit-3way.json"
MEAL_FILES = [
    ROOT / "packages/shared/src/constants/meals.ts",
    ROOT / "packages/shared/src/constants/indian-meals.ts",
]


def patch_meal_in_file(text: str, meal_name: str, new: dict) -> tuple[str, bool]:
    """Find meal by name in TS file and update its 4 macro lines.
    Returns (new_text, success)."""
    # Find the meal block: starts with `name: "<meal_name>",`
    # Then update the next occurrences of calories/protein_g/carbs_g/fat_g.
    # We rely on the convention that those 4 fields appear contiguously after `name`.
    name_pat = re.escape(meal_name)
    # Use re.DOTALL so we can match across lines
    # The block is bounded by the next `{ name:` or end of array, but we only
    # need ~30 lines after the name.
    name_re = re.compile(rf'(name:\s*"{name_pat}",.*?fat_g:\s*)(-?\d+(?:\.\d+)?)', re.DOTALL)
    # We also need to patch calories, protein_g, carbs_g — do them in one regex
    # that captures the whole block from name through fat_g
    block_re = re.compile(
        rf'(name:\s*"{name_pat}",.*?)'
        rf'(calories:\s*)(-?\d+(?:\.\d+)?)'
        rf'(,\s*protein_g:\s*)(-?\d+(?:\.\d+)?)'
        rf'(,\s*carbs_g:\s*)(-?\d+(?:\.\d+)?)'
        rf'(,\s*fat_g:\s*)(-?\d+(?:\.\d+)?)',
        re.DOTALL,
    )
    m = block_re.search(text)
    if not m:
        return text, False
    new_block = (
        f'{m.group(1)}'
        f'{m.group(2)}{new["calories"]}'
        f'{m.group(4)}{new["protein_g"]}'
        f'{m.group(6)}{new["carbs_g"]}'
        f'{m.group(8)}{new["fat_g"]}'
    )
    return text[:m.start()] + new_block + text[m.end():], True


def main():
    data = json.loads(AUDIT_JSON.read_text())
    major = [r for r in data if r["status"] == "major_diff"]
    print(f"Loaded audit. {len(major)} meals marked 'major_diff'.\n")

    if not major:
        print("Nothing to apply.")
        return

    # Backup
    for f in MEAL_FILES:
        bak = f.with_suffix(f.suffix + ".bak")
        shutil.copyfile(f, bak)
        print(f"Backed up {f.name} → {bak.name}")
    print()

    # Apply
    applied = 0
    failed = []
    for f in MEAL_FILES:
        text = f.read_text()
        before_len = len(text)
        file_applied = 0
        for r in major:
            new_text, ok = patch_meal_in_file(text, r["name"], r["local_db"])
            if ok:
                text = new_text
                file_applied += 1
                applied += 1
                old = r["current"]
                new = r["local_db"]
                print(f"  ✓ {r['name'][:42]:<42}  "
                      f"{old['calories']:>4}→{new['calories']:<4} cal · "
                      f"{old['protein_g']}/{old['carbs_g']}/{old['fat_g']} → "
                      f"{new['protein_g']}/{new['carbs_g']}/{new['fat_g']}")
        if file_applied > 0:
            f.write_text(text)
            print(f"\n→ Wrote {file_applied} updates to {f.name} (was {before_len}, now {len(text)} chars)\n")

    # Anything we couldn't find?
    for r in major:
        any_match = any(r["name"] in p.read_text() for p in MEAL_FILES)
        if not any_match:
            failed.append(r["name"])

    print(f"\n=== Result ===")
    print(f"Applied: {applied}/{len(major)}")
    if failed:
        print(f"NOT FOUND in either file: {failed}")
    print(f"\nBackups preserved at *.bak. To restore: mv *.bak *.ts")


if __name__ == "__main__":
    main()
