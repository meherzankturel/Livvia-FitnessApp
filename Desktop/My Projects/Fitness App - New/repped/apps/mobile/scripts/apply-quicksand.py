#!/usr/bin/env python3
"""
Inject Quicksand fontFamily next to every fontWeight in app/ and src/.

Rules:
- fontWeight: "700" | "800" | "900"  -> fontFamily: "Quicksand_700Bold"
- fontWeight: "600"                  -> fontFamily: "Quicksand_600SemiBold"
- fontWeight: "500"                  -> fontFamily: "Quicksand_500Medium"
- fontWeight: "400" | "300"          -> fontFamily: "Quicksand_400Regular"

Skip rules (to preserve existing intentional fontFamily values like Georgia/serif):
- If the line already contains a fontFamily clause, skip it.
- If the line is within a style block (object literal) that already declares fontFamily
  on a nearby line (within +/- 6 lines, same indent or deeper), skip it.

The script is idempotent and safe to re-run.
"""
import re
import sys
from pathlib import Path

WEIGHT_MAP = {
    "300": "Quicksand_400Regular",
    "400": "Quicksand_400Regular",
    "500": "Quicksand_500Medium",
    "600": "Quicksand_600SemiBold",
    "700": "Quicksand_700Bold",
    "800": "Quicksand_700Bold",
    "900": "Quicksand_700Bold",
}

FW_RE = re.compile(r'fontWeight:\s*"(\d+)"')

def has_fontfamily_nearby(lines, idx, window=6):
    """Return True if any line within +/- window has fontFamily and shares the style block."""
    start = max(0, idx - window)
    end = min(len(lines), idx + window + 1)
    for j in range(start, end):
        if j == idx:
            continue
        if "fontFamily:" in lines[j]:
            return True
    return False

def process_file(path: Path) -> int:
    text = path.read_text()
    lines = text.split("\n")
    changed = 0
    for i, line in enumerate(lines):
        match = FW_RE.search(line)
        if not match:
            continue
        # Skip if this line already has fontFamily
        if "fontFamily:" in line:
            continue
        # Skip if a nearby line in the same style block declares fontFamily
        if has_fontfamily_nearby(lines, i):
            continue
        weight = match.group(1)
        family = WEIGHT_MAP.get(weight)
        if not family:
            continue
        # Inject fontFamily: "..." before fontWeight: "..."
        replacement = f'fontFamily: "{family}", fontWeight: "{weight}"'
        original = match.group(0)
        lines[i] = line.replace(original, replacement, 1)
        changed += 1
    if changed > 0:
        path.write_text("\n".join(lines))
    return changed

def main():
    root = Path(__file__).resolve().parent.parent
    targets = []
    for sub in ("app", "src"):
        for p in (root / sub).rglob("*.tsx"):
            targets.append(p)
        for p in (root / sub).rglob("*.ts"):
            targets.append(p)
    total = 0
    files_touched = 0
    for path in targets:
        n = process_file(path)
        if n > 0:
            files_touched += 1
            print(f"  {path.relative_to(root)}: +{n}")
        total += n
    print(f"\nDone. Injected fontFamily in {total} places across {files_touched} files.")

if __name__ == "__main__":
    main()
