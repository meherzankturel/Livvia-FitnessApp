#!/usr/bin/env python3
"""Reduce over-portioned ingredient amounts in indian-meals.ts to true
single-serve quantities. Macros are already approximately correct.

Rules:
  - Dry beans/dal/lentils/chickpeas: anything > 1/4 cup → 1/4 cup
  - Dry rice: anything > 1/3 cup → 1/3 cup
  - 1 large onion → 1/2 medium
  - 2 medium tomatoes → 1 medium
  - 1 cup cooked rice → 1/2 cup cooked
  - 2 cups water (cooking) → 1 cup (cooking liquid is proportional)
"""

import re
from pathlib import Path

FILE = Path(__file__).resolve().parent.parent / "packages/shared/src/constants/indian-meals.ts"


def patch_amount(text: str, ingredient_name_pattern: str, conditions: list[tuple[str, str, str]]) -> tuple[str, int]:
    """Find ingredient lines matching `ingredient_name_pattern` and apply
    amount/unit replacements where conditions match.

    conditions: list of (current_amount_regex, new_amount, new_unit_or_None)
    Returns (new_text, replacements_made)."""
    count = 0

    # Match: { name: "...<pattern>...", amount: "X", unit: "Y", ... }
    line_re = re.compile(
        rf'(\{{[^}}]*?name:\s*")(' + ingredient_name_pattern + r')(",\s*amount:\s*")([^"]+)(",\s*unit:\s*")([^"]*)("\s*,)',
        re.IGNORECASE,
    )

    def replace_line(m):
        nonlocal count
        prefix1, name, prefix2, cur_amt, prefix3, cur_unit, suffix = m.groups()
        for amt_pat, new_amt, new_unit in conditions:
            if re.fullmatch(amt_pat, cur_amt):
                # Determine new unit (None = keep current)
                final_unit = new_unit if new_unit is not None else cur_unit
                count += 1
                return f'{prefix1}{name}{prefix2}{new_amt}{prefix3}{final_unit}{suffix}'
        return m.group(0)

    return line_re.sub(replace_line, text), count


def main():
    text = FILE.read_text()
    original_len = len(text)
    total_changes = 0

    # Patterns: (name_regex, [(amount_regex, new_amount, new_unit), ...])
    fixes = [
        # ── Dry beans / dal / lentils / chickpeas: 1 cup → 1/4 cup, 1/2 → 1/4, 3/4 → 1/4 ──
        (r"Rajma.*", [(r"1", "1/4", None)]),
        (r"Kabuli chana.*", [(r"1", "1/4", None)]),
        (r"Kala chana.*", [(r"1", "1/4", None)]),
        (r"Green moong dal.*", [(r"1", "1/4", None)]),
        (r"Whole green moong dal.*", [(r"1", "1/4", None)]),
        (r"Toor dal", [(r"3/4", "1/4", None), (r"1/2", "1/4", None)]),
        (r"Moong dal", [(r"1/2", "1/4", None)]),
        (r"Masoor dal.*", [(r"3/4", "1/4", None), (r"1/2", "1/4", None)]),
        (r"Chana dal", [(r"1/2", "1/4", None)]),
        (r"Mixed sprouts.*", [(r"1", "1/4", None)]),
        (r"Dalia.*", [(r"1/2", "1/4", None)]),

        # ── Dry rice: 1/2 cup → 1/3 cup ──
        (r"Basmati rice", [(r"1/2", "1/3", None)]),
        (r"Brown rice", [(r"1/2", "1/3", None)]),
        (r"Rice flour", [(r"1", "1/3", None)]),
        # Cooked rice (e.g., "1 cup cooked rice" → 1/2 cup cooked)
        (r"Cooked rice", [(r"1", "1/2", None)]),
        (r"Steamed rice", [(r"1/2", "1/3", None)]),

        # ── Onions: 1 large → 1/2 medium ──
        (r"Onion.*", [(r"1", "1/2", "medium")]),

        # ── Tomatoes: 2 medium → 1 medium ──
        (r"Tomato.*", [(r"2", "1", None)]),
    ]

    for name_pat, conds in fixes:
        text, n = patch_amount(text, name_pat, conds)
        if n:
            print(f"  {n}× fix on '{name_pat[:40]}' → {conds[0][1]}")
            total_changes += n

    if text != FILE.read_text():
        FILE.write_text(text)
        print(f"\n✓ Wrote {total_changes} ingredient corrections to {FILE.name}")
        print(f"  File size: {original_len} → {len(text)} bytes")
    else:
        print("\nNo changes made.")


if __name__ == "__main__":
    main()
