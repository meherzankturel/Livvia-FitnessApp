#!/usr/bin/env python3
"""Revert Indian meal macro corrections where the Local-DB increased calories
significantly — these likely reflect multi-portion ingredient amounts, not
single-serve reality. User can audit ingredient quantities separately."""

import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MEAL_FILES = [
    ROOT / "packages/shared/src/constants/meals.ts",
    ROOT / "packages/shared/src/constants/indian-meals.ts",
]

# Meals to revert — these are the ones we applied UP corrections to that
# likely represent multi-portion recipes mis-tagged as 1 serving.
TO_REVERT = [
    "Rajma Chawal",
    "Dal Palak + Multigrain Roti",
    "Dal Tadka + Brown Rice + Cucumber Raita",
    "Chole + Multigrain Roti",
    "Mujadara",
    "Masala Omelette with Multigrain Toast",
]


def find_block(text: str, meal_name: str):
    name_pat = re.escape(meal_name)
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
        return None
    return {
        "calories": int(float(m.group(3))),
        "protein_g": int(float(m.group(5))),
        "carbs_g": int(float(m.group(7))),
        "fat_g": int(float(m.group(9))),
    }


def patch_macros(text, meal_name, new):
    name_pat = re.escape(meal_name)
    block_re = re.compile(
        rf'(name:\s*"{name_pat}",.*?)'
        rf'(calories:\s*)(-?\d+(?:\.\d+)?)'
        rf'(,\s*protein_g:\s*)(-?\d+(?:\.\d+)?)'
        rf'(,\s*carbs_g:\s*)(-?\d+(?:\.\d+)?)'
        rf'(,\s*fat_g:\s*)(-?\d+(?:\.\d+)?)',
        re.DOTALL,
    )
    return block_re.sub(
        lambda m: (m.group(1) + m.group(2) + str(new["calories"])
                   + m.group(4) + str(new["protein_g"])
                   + m.group(6) + str(new["carbs_g"])
                   + m.group(8) + str(new["fat_g"])),
        text, count=1
    )


def main():
    print(f"Reverting {len(TO_REVERT)} over-portioned Indian recipes:\n")
    for f in MEAL_FILES:
        bak = f.with_suffix(f.suffix + ".bak")
        if not bak.exists():
            continue
        bak_text = bak.read_text()
        cur_text = f.read_text()
        for name in TO_REVERT:
            original = find_block(bak_text, name)
            if not original:
                continue
            current = find_block(cur_text, name)
            if not current or current == original:
                continue
            cur_text = patch_macros(cur_text, name, original)
            print(f"  ↺ {name[:42]:<42}  {current['calories']:>4}→{original['calories']:<4} cal "
                  f"(P/C/F: {current['protein_g']}/{current['carbs_g']}/{current['fat_g']} → "
                  f"{original['protein_g']}/{original['carbs_g']}/{original['fat_g']})")
        f.write_text(cur_text)


if __name__ == "__main__":
    main()
