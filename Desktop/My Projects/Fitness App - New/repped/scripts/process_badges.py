#!/usr/bin/env python3
"""Strip dark backgrounds from generated badges and produce app-ready sized variants.

Output:
  mockups/badges-transparent/<name>.png     1024x1024 PNG with alpha
  mockups/badges-transparent/<name>@512.png  512x512
  mockups/badges-transparent/<name>@256.png  256x256
"""

from pathlib import Path
from rembg import remove, new_session
from PIL import Image
import io

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "mockups" / "badges"
DST = ROOT / "mockups" / "badges-transparent"
DST.mkdir(parents=True, exist_ok=True)

# isnet-general-use is best quality for object isolation
session = new_session("isnet-general-use")

SIZES = [
    ("",     1024),
    ("@512",  512),
    ("@256",  256),
]


def trim_transparent(img: Image.Image) -> Image.Image:
    """Crop image to bounding box of non-transparent pixels."""
    bbox = img.getbbox()
    if bbox:
        return img.crop(bbox)
    return img


def fit_square(img: Image.Image, size: int) -> Image.Image:
    """Resize preserving aspect ratio, then paste onto transparent square canvas."""
    w, h = img.size
    scale = min(size / w, size / h)
    new_w, new_h = int(w * scale), int(h * scale)
    img = img.resize((new_w, new_h), Image.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.paste(img, ((size - new_w) // 2, (size - new_h) // 2), img)
    return canvas


def process(src_path: Path):
    name = src_path.stem
    out_main = DST / f"{name}.png"
    if out_main.exists():
        return "skip"

    with src_path.open("rb") as f:
        raw = f.read()
    cut = remove(raw, session=session)
    img = Image.open(io.BytesIO(cut)).convert("RGBA")
    trimmed = trim_transparent(img)

    for suffix, size in SIZES:
        out = DST / f"{name}{suffix}.png"
        fit_square(trimmed, size).save(out, optimize=True)

    return "ok"


def main():
    files = sorted(SRC.glob("*.png"))
    print(f"Processing {len(files)} badges → {DST}")
    ok, skipped = 0, 0
    for i, f in enumerate(files, 1):
        result = process(f)
        marker = "✓" if result == "ok" else "·"
        print(f"  [{i:>2}/{len(files)}] {marker} {f.name}")
        if result == "ok":
            ok += 1
        else:
            skipped += 1
    print(f"\nDone. {ok} processed, {skipped} skipped.")
    total = sum(f.stat().st_size for f in DST.glob("*.png"))
    print(f"Output total: {total / 1024 / 1024:.1f} MB")


if __name__ == "__main__":
    main()
