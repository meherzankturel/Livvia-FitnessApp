#!/usr/bin/env python3
"""Generate Livvia achievement badges via Gemini 2.5 Flash Image (Nano Banana).

Reads GEMINI_API_KEY from repped/.env.local.
Uses repped/mockups/badges/master-shield-legendary.png as style reference.
Writes outputs to repped/mockups/badges/<category>-<key>.png.
Skips files that already exist (resume-safe).

Usage:
  python scripts/generate_badges.py --test     # 4 badges, one per tier
  python scripts/generate_badges.py            # all 45 (skips existing)
  python scripts/generate_badges.py --only KEY # single badge by key
"""

import argparse
import os
import sys
import time
from pathlib import Path

from google import genai
from google.genai import types

SCRIPT_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = SCRIPT_DIR / ".env.local"
OUTPUT_DIR = SCRIPT_DIR / "mockups" / "badges"
MASTER = OUTPUT_DIR / "master-shield-legendary.png"
MODEL = "gemini-2.5-flash-image"
SLEEP_SECONDS = 7  # pace under free-tier 10 RPM

# ── Load API key ─────────────────────────────────────────────────────────
for line in ENV_FILE.read_text().splitlines():
    if line.startswith("GEMINI_API_KEY="):
        os.environ["GEMINI_API_KEY"] = line.split("=", 1)[1].strip()

if "GEMINI_API_KEY" not in os.environ:
    print("ERROR: GEMINI_API_KEY missing from .env.local")
    sys.exit(1)

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

# ── Tier specs ───────────────────────────────────────────────────────────
TIERS = {
    "starter":   {"metal": "polished brushed silver metal with cool subtle tones",
                  "marble": "white marble with thin pale-grey veining"},
    "pro":       {"metal": "polished warm bronze metal with subtle micro-brushed texture",
                  "marble": "cream-colored marble with subtle golden veining"},
    "elite":     {"metal": "polished rose-gold copper metal with warm pink undertones",
                  "marble": "dark charcoal marble with thin white veining"},
    "legendary": {"metal": "polished bright gold metal with warm reflective shine",
                  "marble": "bright white marble with thin gold veining"},
}

CATEGORY_ICONS = {
    "workout":     "a small dumbbell",
    "streak":      "a small flame",
    "pr":          "a small upward-trending arrow chart",
    "milestone":   "a small weight plate",
    "volume":      "a small stack of weight plates",
    "nutrition":   "a small leaf",
    "recovery":    "a small heart",
    "body":        "a small balance scale",
    "consistency": "a small sun-and-moon symbol",
    "challenge":   "a small calendar with checkmark",
    "engagement":  "a small star",
}

# ── All 45 badges ────────────────────────────────────────────────────────
BADGES = [
    # Workout (6)
    {"key": "first_rep",       "cat": "workout",     "tier": "starter",   "lt": "1",   "lb": "FIRST",    "rt": "1 REP",     "rb": "COMPLETED"},
    {"key": "iron_regular",    "cat": "workout",     "tier": "pro",       "lt": "50",  "lb": "WORKOUTS", "rt": "IRON",      "rb": "REGULAR"},
    {"key": "century_club",    "cat": "workout",     "tier": "elite",     "lt": "100", "lb": "WORKOUTS", "rt": "CENTURY",   "rb": "CLUB"},
    {"key": "year_of_iron",    "cat": "workout",     "tier": "legendary", "lt": "365", "lb": "WORKOUTS", "rt": "YEAR",      "rb": "OF IRON"},
    {"key": "perfect_week",    "cat": "workout",     "tier": "pro",       "lt": "7",   "lb": "DAYS",     "rt": "PERFECT",   "rb": "WEEK"},
    {"key": "iron_month",      "cat": "workout",     "tier": "legendary", "lt": "30",  "lb": "DAYS",     "rt": "IRON",      "rb": "MONTH"},

    # Streak (4)
    {"key": "warming_up",      "cat": "streak",      "tier": "starter",   "lt": "2",   "lb": "WEEKS",    "rt": "WARMING",   "rb": "UP"},
    {"key": "on_fire",         "cat": "streak",      "tier": "pro",       "lt": "4",   "lb": "WEEKS",    "rt": "ON",        "rb": "FIRE"},
    {"key": "unstoppable",     "cat": "streak",      "tier": "elite",     "lt": "8",   "lb": "WEEKS",    "rt": "UN",        "rb": "STOPPABLE"},
    {"key": "force_of_nature", "cat": "streak",      "tier": "legendary", "lt": "16",  "lb": "WEEKS",    "rt": "FORCE OF",  "rb": "NATURE"},

    # PRs (4)
    {"key": "new_heights",     "cat": "pr",          "tier": "starter",   "lt": "1",   "lb": "PR",       "rt": "NEW",       "rb": "HEIGHTS"},
    {"key": "record_breaker",  "cat": "pr",          "tier": "pro",       "lt": "5",   "lb": "PRs",      "rt": "RECORD",    "rb": "BREAKER"},
    {"key": "pr_machine",      "cat": "pr",          "tier": "elite",     "lt": "20",  "lb": "PRs",      "rt": "PR",        "rb": "MACHINE"},
    {"key": "limitless",       "cat": "pr",          "tier": "legendary", "lt": "50",  "lb": "PRs",      "rt": "LIMIT",     "rb": "LESS"},

    # Strength Milestones (4)
    {"key": "plate_milestone", "cat": "milestone",   "tier": "starter",   "lt": "60",  "lb": "KG",       "rt": "PLATE",     "rb": "MILESTONE"},
    {"key": "two_plates",      "cat": "milestone",   "tier": "pro",       "lt": "100", "lb": "KG",       "rt": "TWO",       "rb": "PLATES"},
    {"key": "bw_bench",        "cat": "milestone",   "tier": "elite",     "lt": "BW",  "lb": "BENCH",    "rt": "BODY",      "rb": "WEIGHT"},
    {"key": "three_plates",    "cat": "milestone",   "tier": "legendary", "lt": "140", "lb": "KG",       "rt": "THREE",     "rb": "PLATES"},

    # Volume (4)
    {"key": "ton_club",        "cat": "volume",      "tier": "starter",   "lt": "1K",  "lb": "KG",       "rt": "TON",       "rb": "CLUB"},
    {"key": "heavy_week",      "cat": "volume",      "tier": "pro",       "lt": "5K",  "lb": "KG",       "rt": "HEAVY",     "rb": "WEEK"},
    {"key": "mountain_mover",  "cat": "volume",      "tier": "elite",     "lt": "25K", "lb": "KG",       "rt": "MOUNTAIN",  "rb": "MOVER"},
    {"key": "iron_empire",     "cat": "volume",      "tier": "legendary", "lt": "100K","lb": "KG",       "rt": "IRON",      "rb": "EMPIRE"},

    # Nutrition (5)
    {"key": "first_bite",      "cat": "nutrition",   "tier": "starter",   "lt": "1",   "lb": "MEAL",     "rt": "FIRST",     "rb": "BITE"},
    {"key": "clean_week",      "cat": "nutrition",   "tier": "pro",       "lt": "7",   "lb": "DAYS",     "rt": "CLEAN",     "rb": "WEEK"},
    {"key": "macro_master",    "cat": "nutrition",   "tier": "pro",       "lt": "7",   "lb": "DAYS",     "rt": "MACRO",     "rb": "MASTER"},
    {"key": "clean_month",     "cat": "nutrition",   "tier": "elite",     "lt": "30",  "lb": "DAYS",     "rt": "CLEAN",     "rb": "MONTH"},
    {"key": "pristine",        "cat": "nutrition",   "tier": "legendary", "lt": "90",  "lb": "DAYS",     "rt": "PRIS",      "rb": "TINE"},

    # Recovery (4)
    {"key": "self_aware",      "cat": "recovery",    "tier": "starter",   "lt": "1",   "lb": "CHECK",    "rt": "SELF",      "rb": "AWARE"},
    {"key": "mind_body",       "cat": "recovery",    "tier": "pro",       "lt": "7",   "lb": "DAYS",     "rt": "MIND",      "rb": "AND BODY"},
    {"key": "deload_pro",      "cat": "recovery",    "tier": "pro",       "lt": "1",   "lb": "WEEK",     "rt": "DELOAD",    "rb": "PRO"},
    {"key": "rest_warrior",    "cat": "recovery",    "tier": "elite",     "lt": "30",  "lb": "DAYS",     "rt": "REST DAY",  "rb": "WARRIOR"},

    # Body Metrics (4)
    {"key": "scale_check",     "cat": "body",        "tier": "starter",   "lt": "1",   "lb": "WEIGH",    "rt": "SCALE",     "rb": "CHECK"},
    {"key": "measure_up",      "cat": "body",        "tier": "starter",   "lt": "1",   "lb": "LOG",      "rt": "MEASURE",   "rb": "UP"},
    {"key": "mirror_mirror",   "cat": "body",        "tier": "starter",   "lt": "1",   "lb": "PHOTO",    "rt": "MIRROR",    "rb": "MIRROR"},
    {"key": "goal_hit",        "cat": "body",        "tier": "elite",     "lt": "GOAL","lb": "REACHED",  "rt": "GOAL",      "rb": "HIT"},

    # Consistency (4)
    {"key": "early_bird",      "cat": "consistency", "tier": "starter",   "lt": "AM",  "lb": "DAWN",     "rt": "EARLY",     "rb": "BIRD"},
    {"key": "night_owl",       "cat": "consistency", "tier": "starter",   "lt": "PM",  "lb": "DUSK",     "rt": "NIGHT",     "rb": "OWL"},
    {"key": "weekend_warrior", "cat": "consistency", "tier": "pro",       "lt": "4",   "lb": "WEEKS",    "rt": "WEEKEND",   "rb": "WARRIOR"},
    {"key": "road_warrior",    "cat": "consistency", "tier": "pro",       "lt": "3",   "lb": "SLOTS",    "rt": "ROAD",      "rb": "WARRIOR"},

    # Challenges (4)
    {"key": "monthly_grind",   "cat": "challenge",   "tier": "pro",       "lt": "15",  "lb": "WORKOUTS", "rt": "MONTHLY",   "rb": "GRIND"},
    {"key": "volume_month",    "cat": "challenge",   "tier": "elite",     "lt": "10K", "lb": "KG",       "rt": "VOLUME",    "rb": "MONTH"},
    {"key": "thirty_day",      "cat": "challenge",   "tier": "legendary", "lt": "30",  "lb": "DAYS",     "rt": "30-DAY",    "rb": "STREAK"},
    {"key": "goal_crusher",    "cat": "challenge",   "tier": "pro",       "lt": "4",   "lb": "WEEKS",    "rt": "GOAL",      "rb": "CRUSHER"},

    # Engagement (5)
    {"key": "welcome_aboard",  "cat": "engagement",  "tier": "starter",   "lt": "GO",  "lb": "READY",    "rt": "WELCOME",   "rb": "ABOARD"},
    {"key": "profile_pro",     "cat": "engagement",  "tier": "starter",   "lt": "ID",  "lb": "PROFILE",  "rt": "PROFILE",   "rb": "PRO"},
    {"key": "first_share",     "cat": "engagement",  "tier": "starter",   "lt": "1",   "lb": "SHARE",    "rt": "FIRST",     "rb": "SHARE"},
    {"key": "explorer",        "cat": "engagement",  "tier": "pro",       "lt": "3",   "lb": "TYPES",    "rt": "EX",        "rb": "PLORER"},
    {"key": "course_complete", "cat": "engagement",  "tier": "pro",       "lt": "1",   "lb": "PROGRAM",  "rt": "COURSE",    "rb": "COMPLETE"},
]


def build_prompt(b):
    t = TIERS[b["tier"]]
    icon = CATEGORY_ICONS[b["cat"]]
    return f"""Use the attached reference image as the EXACT style, composition, and lighting template.

Generate a premium fitness achievement badge with IDENTICAL composition: a 3-faced extruded cube with a shield silhouette resting on a dark cylindrical pedestal, viewed from a slight angle so three faces are visible — a top triangular face, a left face, and a right face. Keep the same dark navy background, same upper-left volumetric spotlight, same dramatic rim lighting, same atmospheric haze, same photorealistic studio product-render aesthetic, same camera angle, same scale.

CHANGE ONLY THE FOLLOWING:

1) Metal material: {t['metal']}.

2) Top triangular face: an inset panel of {t['marble']}, with {icon} embossed in raised metal relief, centered on the marble panel.

3) Left face: large embossed metal numeral or text "{b['lt']}" centered, with smaller engraved capital text "{b['lb']}" beneath it.

4) Right face: engraved capital text reading "{b['rt']}" on the upper line and "{b['rb']}" on the lower line, both in deep crisp relief.

All text must be sharp, legible, deeply engraved, with no garbled or duplicated letters. Match the reference image's exact angle, pedestal, lighting, and atmospheric depth. Cinematic studio product photography, octane render aesthetic, 8k, photorealistic, sharp focus on badge, centered composition, square 1:1 aspect ratio."""


def generate_badge(b, master_bytes, max_retries=3):
    prompt = build_prompt(b)
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=MODEL,
                contents=[
                    types.Part.from_bytes(data=master_bytes, mime_type="image/png"),
                    prompt,
                ],
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


def run(badges):
    master_bytes = MASTER.read_bytes()
    print(f"Master: {len(master_bytes)/1024:.0f} KB")
    print(f"Output dir: {OUTPUT_DIR}")
    print(f"Generating {len(badges)} badges...\n")

    ok, fail = 0, []
    for i, b in enumerate(badges, 1):
        out = OUTPUT_DIR / f"{b['cat']}-{b['key']}.png"
        prefix = f"[{i:>2}/{len(badges)}] {b['cat']}-{b['key']:<18}"

        if out.exists():
            print(f"{prefix} EXISTS, skipping")
            ok += 1
            continue

        print(f"{prefix} ({b['tier']}) generating...", end=" ", flush=True)
        data, err = generate_badge(b, master_bytes)
        if data:
            out.write_bytes(data)
            print(f"OK ({len(data)/1024:.0f} KB)")
            ok += 1
        else:
            print(f"FAIL: {err}")
            fail.append(b["key"])

        if i < len(badges):
            time.sleep(SLEEP_SECONDS)

    print(f"\nDone. {ok}/{len(badges)} succeeded.")
    if fail:
        print(f"Failed: {fail}")
        sys.exit(1)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--test", action="store_true", help="generate 4 test badges, one per tier")
    ap.add_argument("--only", help="generate a single badge by key")
    args = ap.parse_args()

    if args.only:
        matches = [b for b in BADGES if b["key"] == args.only]
        if not matches:
            print(f"No badge with key '{args.only}'")
            sys.exit(1)
        run(matches)
    elif args.test:
        # one per tier, varied categories
        keys = ["warming_up", "iron_regular", "century_club", "force_of_nature"]
        run([b for b in BADGES if b["key"] in keys])
    else:
        run(BADGES)


if __name__ == "__main__":
    main()
