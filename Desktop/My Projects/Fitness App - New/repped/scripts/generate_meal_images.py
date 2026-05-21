#!/usr/bin/env python3
"""Generate AI meal images via Gemini 2.5 Flash Image (Nano Banana).

For each meal in meals.ts / indian-meals.ts that's NOT already in
apps/mobile/src/lib/dish-image-urls.json, generates an image and saves it as
JPEG to apps/mobile/assets/meals/<slug>.jpg.

Resume-safe: skips meals whose JPEG already exists on disk.

Usage:
  python scripts/generate_meal_images.py          # all missing
  python scripts/generate_meal_images.py --test   # 1 sample
  python scripts/generate_meal_images.py --only "Croque Monsieur"
"""

import argparse
import io
import json
import os
import re
import sys
import time
from pathlib import Path

from google import genai
from google.genai import types
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = ROOT / ".env.local"
MEAL_FILES = [
    ROOT / "packages/shared/src/constants/meals.ts",
    ROOT / "packages/shared/src/constants/indian-meals.ts",
]
JSON_FILE = ROOT / "apps/mobile/src/lib/dish-image-urls.json"
OUT_DIR = ROOT / "apps/mobile/assets/meals"
MODEL = "gemini-2.5-flash-image"
SLEEP_SECONDS = 7

# ── Load API key from .env.local ─────────────────────────────────────────
for line in ENV_FILE.read_text().splitlines():
    if line.startswith("GEMINI_API_KEY="):
        os.environ["GEMINI_API_KEY"] = line.split("=", 1)[1].strip()
        break
if "GEMINI_API_KEY" not in os.environ:
    print("ERROR: GEMINI_API_KEY missing from .env.local")
    sys.exit(1)

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])


def slugify(name: str) -> str:
    s = name.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s


def extract_meal_metadata() -> list[dict]:
    """Pull name + description + cuisine + category for richer prompts."""
    out = []
    pattern = re.compile(
        r'\{\s*'
        r'name:\s*"([^"]+)",\s*'
        r'description:\s*\n?\s*"([^"]+)"',
        re.DOTALL,
    )
    cuisine_re = re.compile(r'cuisine:\s*"([^"]+)"')
    category_re = re.compile(r'category:\s*"([^"]+)"')

    for f in MEAL_FILES:
        if not f.exists():
            continue
        text = f.read_text()
        # Scan each top-level meal block
        # Approach: split on "{\n    name:" boundaries, parse each
        blocks = re.split(r'(?=\{\s*\n\s*name:\s*")', text)
        for block in blocks:
            m_name = re.search(r'name:\s*"([^"]+)"', block)
            if not m_name:
                continue
            m_desc = re.search(r'description:\s*"([^"]+)"', block) \
                or re.search(r'description:\s*\n\s*"([^"]+)"', block)
            m_cui = cuisine_re.search(block)
            m_cat = category_re.search(block)
            out.append({
                "name": m_name.group(1),
                "description": m_desc.group(1) if m_desc else "",
                "cuisine": m_cui.group(1) if m_cui else "",
                "category": m_cat.group(1) if m_cat else "",
            })
    # Dedupe by name (preserve first occurrence)
    seen = set()
    dedup = []
    for m in out:
        if m["name"] not in seen:
            seen.add(m["name"])
            dedup.append(m)
    return dedup


def build_prompt(meal: dict) -> str:
    cuisine = meal["cuisine"] or "international"
    category = meal["category"] or "meal"
    return f"""Overhead food photography of {meal['name']}, a {cuisine} {category}.

{meal['description']}

Style requirements:
- Plated authentically on a single ceramic plate or bowl appropriate to the cuisine.
- Warm, natural daylight from the upper left.
- Shallow depth of field with the food in sharp focus.
- Neutral background: light wooden table or matte tablecloth — no busy props.
- Single dish only, no extra plates or hands in frame.
- Photorealistic, magazine-quality food photography style.
- Square 1:1 framing, centered.
- Authentic cultural presentation — DO NOT default to generic styling.

Avoid: cartoon style, illustration, surreal elements, hands, faces, text overlays, multiple dishes."""


def generate_image(meal: dict, max_retries: int = 3):
    prompt = build_prompt(meal)
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=MODEL,
                contents=[prompt],
            )
            for part in response.candidates[0].content.parts:
                if part.inline_data is not None and part.inline_data.data:
                    return part.inline_data.data, None
            return None, "no image in response"
        except Exception as e:
            err = str(e)
            if "429" in err or "RESOURCE_EXHAUSTED" in err or "quota" in err.lower():
                wait = (attempt + 1) * 30
                print(f"  rate-limited, waiting {wait}s...", end=" ", flush=True)
                time.sleep(wait)
                continue
            return None, err
    return None, "max retries exceeded"


def save_jpeg(raw_bytes: bytes, out_path: Path, size: int = 512, quality: int = 85):
    """Center-crop to square, resize, save as JPEG."""
    img = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
    w, h = img.size
    # Center-crop to square
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    img = img.crop((left, top, left + side, top + side))
    img = img.resize((size, size), Image.LANCZOS)
    img.save(out_path, "JPEG", quality=quality, optimize=True)


def run(meals: list[dict]):
    print(f"Generating {len(meals)} images → {OUT_DIR}\n")
    ok = 0
    failed = []
    for i, meal in enumerate(meals, 1):
        slug = slugify(meal["name"])
        out_path = OUT_DIR / f"{slug}.jpg"
        prefix = f"[{i:>2}/{len(meals)}] {meal['name'][:40]:<40}"

        if out_path.exists():
            print(f"{prefix} EXISTS, skipping")
            ok += 1
            continue

        print(f"{prefix} generating...", end=" ", flush=True)
        data, err = generate_image(meal)
        if data:
            save_jpeg(data, out_path)
            size_kb = out_path.stat().st_size / 1024
            print(f"OK ({size_kb:.0f} KB)")
            ok += 1
        else:
            print(f"FAIL: {err}")
            failed.append(meal["name"])

        if i < len(meals):
            time.sleep(SLEEP_SECONDS)

    print(f"\nDone. {ok}/{len(meals)} succeeded.")
    if failed:
        print(f"Failed: {failed}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--test", action="store_true", help="generate 1 sample image")
    ap.add_argument("--only", help="generate one meal by name")
    ap.add_argument("--all", action="store_true", help="regenerate ALL meals (even ones in the JSON map)")
    args = ap.parse_args()

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    all_meals = extract_meal_metadata()
    existing_in_json = set(json.loads(JSON_FILE.read_text()).keys())

    if args.only:
        match = [m for m in all_meals if m["name"] == args.only]
        if not match:
            print(f"No meal named '{args.only}'")
            sys.exit(1)
        run(match)
        return

    if args.all:
        run(all_meals)
        return

    # Default: only meals not already in the static JSON map
    missing = [m for m in all_meals if m["name"] not in existing_in_json]
    print(f"Total meals: {len(all_meals)} · in JSON map: {len(existing_in_json)} · missing: {len(missing)}\n")

    if args.test and missing:
        run(missing[:1])
    elif args.test:
        # No missing — pick the first meal so the user can preview style
        run(all_meals[:1])
    else:
        run(missing)


if __name__ == "__main__":
    main()
