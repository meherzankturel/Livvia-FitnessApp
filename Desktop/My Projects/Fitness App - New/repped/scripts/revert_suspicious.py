#!/usr/bin/env python3
"""Selectively revert macro corrections that made meals suspiciously low-cal.

Rule: if the Local-DB correction reduced a meal's calories by ≥20% AND the
new value is <450 cal, treat it as "Local DB missed a calorie-heavy ingredient"
and restore the meal's macros from the .bak backup."""

import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AUDIT = ROOT / "mockups" / "macro-audit-3way.json"
MEAL_FILES = [
    ROOT / "packages/shared/src/constants/meals.ts",
    ROOT / "packages/shared/src/constants/indian-meals.ts",
]


def find_block(text: str, meal_name: str) -> tuple[int, int, dict] | None:
    """Return (start, end, macros) of the macro lines for the named meal."""
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
    macros = {
        "calories": int(float(m.group(3))),
        "protein_g": int(float(m.group(5))),
        "carbs_g": int(float(m.group(7))),
        "fat_g": int(float(m.group(9))),
    }
    return (m.start(2), m.end(), macros)


def patch_macros(text: str, meal_name: str, new: dict) -> str:
    name_pat = re.escape(meal_name)
    block_re = re.compile(
        rf'(name:\s*"{name_pat}",.*?)'
        rf'(calories:\s*)(-?\d+(?:\.\d+)?)'
        rf'(,\s*protein_g:\s*)(-?\d+(?:\.\d+)?)'
        rf'(,\s*carbs_g:\s*)(-?\d+(?:\.\d+)?)'
        rf'(,\s*fat_g:\s*)(-?\d+(?:\.\d+)?)',
        re.DOTALL,
    )
    def repl(m):
        return (
            m.group(1)
            + m.group(2) + str(new["calories"])
            + m.group(4) + str(new["protein_g"])
            + m.group(6) + str(new["carbs_g"])
            + m.group(8) + str(new["fat_g"])
        )
    return block_re.sub(repl, text, count=1)


def main():
    data = json.loads(AUDIT.read_text())

    # Identify suspicious applications: cal dropped ≥20% AND result < 450
    suspicious = []
    for r in data:
        if r["status"] != "major_diff":
            continue
        old_cal = r["current"]["calories"]
        new_cal = r["local_db"]["calories"]
        if old_cal <= 0:
            continue
        dropped_pct = (old_cal - new_cal) / old_cal * 100
        if dropped_pct >= 20 and new_cal < 450:
            suspicious.append({"name": r["name"], "old": r["current"], "applied": r["local_db"]})

    if not suspicious:
        print("Nothing to revert — all corrections look reasonable.")
        return

    print(f"Reverting {len(suspicious)} suspicious corrections back to original values:\n")
    for f in MEAL_FILES:
        bak = f.with_suffix(f.suffix + ".bak")
        if not bak.exists():
            print(f"  ⚠ No .bak file for {f.name}, skipping")
            continue
        bak_text = bak.read_text()
        cur_text = f.read_text()
        file_reverted = 0
        for s in suspicious:
            bak_block = find_block(bak_text, s["name"])
            if not bak_block:
                continue
            _, _, original_macros = bak_block
            new_text = patch_macros(cur_text, s["name"], original_macros)
            if new_text != cur_text:
                cur_text = new_text
                file_reverted += 1
                print(f"  ↺ {s['name'][:42]:<42}  "
                      f"applied={s['applied']['calories']} → restored={original_macros['calories']} cal")
        if file_reverted > 0:
            f.write_text(cur_text)

    print(f"\n✓ Reverted {len(suspicious)} meals. Backups still preserved at *.bak.")


if __name__ == "__main__":
    main()
