#!/usr/bin/env python3
"""Re-crop transparent badges with strict alpha threshold to fix off-center silhouettes."""

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
DST = ROOT / "mockups" / "badges-transparent"

ALPHA_THRESHOLD = 40   # ignore pixels with alpha below this — kills rembg halos
PADDING_PCT = 0.04     # 4% padding around badge inside canvas

SIZES = [
    ("",     1024),
    ("@512",  512),
    ("@256",  256),
]


def tight_bbox(img: Image.Image, threshold: int) -> tuple | None:
    alpha = img.split()[-1]
    mask = alpha.point(lambda a: 255 if a > threshold else 0)
    return mask.getbbox()


def fit_square(img: Image.Image, size: int, pad_pct: float) -> Image.Image:
    w, h = img.size
    inner = int(size * (1 - 2 * pad_pct))
    scale = min(inner / w, inner / h)
    new_w, new_h = int(w * scale), int(h * scale)
    resized = img.resize((new_w, new_h), Image.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.paste(resized, ((size - new_w) // 2, (size - new_h) // 2), resized)
    return canvas


def reprocess(name: str):
    src = DST / f"{name}.png"
    if not src.exists():
        return False
    img = Image.open(src).convert("RGBA")
    bbox = tight_bbox(img, ALPHA_THRESHOLD)
    if not bbox:
        return False
    cropped = img.crop(bbox)
    for suffix, size in SIZES:
        out = DST / f"{name}{suffix}.png"
        fit_square(cropped, size, PADDING_PCT).save(out, optimize=True)
    return True


def main():
    # Get base names (no @512 / @256 suffix)
    bases = set()
    for f in DST.glob("*.png"):
        stem = f.stem
        if "@" in stem:
            stem = stem.split("@")[0]
        bases.add(stem)

    print(f"Re-cropping {len(bases)} badges with α>{ALPHA_THRESHOLD} threshold, {int(PADDING_PCT*100)}% padding")
    ok = 0
    for name in sorted(bases):
        if reprocess(name):
            print(f"  ✓ {name}")
            ok += 1
        else:
            print(f"  ✗ {name} (skipped)")
    print(f"\nDone. {ok}/{len(bases)} re-cropped.")


if __name__ == "__main__":
    main()
