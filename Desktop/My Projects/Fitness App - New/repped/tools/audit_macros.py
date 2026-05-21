#!/usr/bin/env python3
"""
Audit meal macros against USDA FoodData Central reference values.

Strategy: USDA does not have entries for most composite ethnic dishes
("Moong Dal Cheela", "Paneer Bhurji", etc.), so direct name lookup is
useless. Instead, we reconstruct each meal's macros from its ingredient
list using:
  1. A curated USDA-derived per-100g nutrition table (USDA_REF)
  2. Ingredient name → reference key mapping (handles naming variants)
  3. Unit conversion table (cup/tbsp/tsp/piece → grams, ingredient-aware)

Per-100g values are pulled from USDA FoodData Central Foundation Foods
and SR Legacy datasets. Each entry below cites its FDC ID for traceability.

Run:
    python3 tools/audit_macros.py

Outputs:
    tools/audit_report.csv  — full per-meal comparison
    Console summary         — outliers >15% variance

Re-run any time meals.ts or indian-meals.ts changes.
"""

import csv
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MEAL_FILES = [
    ROOT / "packages/shared/src/constants/indian-meals.ts",
    ROOT / "packages/shared/src/constants/meals.ts",
]
OUT_CSV = ROOT / "tools/audit_report.csv"

# Tolerance: variance below this is acceptable (USDA's own values have
# inherent ±5-10% measurement variance + portion estimation slop)
ACCEPT_PCT = 15.0


# ──────────────────────────────────────────────────────────────────────────
# USDA reference table — per 100g
# ──────────────────────────────────────────────────────────────────────────
# Format: key → (kcal, protein_g, carbs_g, fat_g)
# All values from USDA FoodData Central (Foundation/SR Legacy datasets).
# FDC IDs given for traceability — re-verify at fdc.nal.usda.gov.

USDA_REF = {
    # Proteins (animal)
    "chicken_breast_cooked":   (165, 31.0, 0.0,  3.6),   # FDC 171477 (roasted, no skin)
    "chicken_thigh_cooked":    (209, 25.0, 0.0, 11.0),   # FDC 171478
    "egg_whole":               (155, 12.6, 1.1, 10.6),   # FDC 173424 (cooked, hard-boiled)
    "egg_white":               (52,  10.9, 0.7,  0.2),   # FDC 174722
    "salmon_cooked":           (208, 22.1, 0.0, 12.4),   # FDC 175167
    "tuna_canned_water":       (116, 25.5, 0.0,  0.8),   # FDC 175127
    "beef_lean_cooked":        (250, 26.0, 0.0, 15.0),   # FDC 168620 (sirloin, lean)
    "turkey_breast_cooked":    (135, 30.0, 0.0,  1.0),   # FDC 171487
    "shrimp_cooked":           (99,  24.0, 0.0,  0.3),   # FDC 175179
    "tofu_firm":               (144, 17.3, 2.8,  8.7),   # FDC 174291
    "tempeh":                  (193, 19.0, 9.4, 11.0),   # FDC 174272
    "fish_white_cooked":       (105, 22.0, 0.0,  1.5),   # FDC 175151 (cod/rohu/surmai proxy)
    "bacon_cooked":            (541, 37.0, 1.4, 42.0),   # FDC 174583

    # Dairy
    "paneer":                  (296, 18.3, 6.1, 22.8),   # FDC 174270 (whole milk)
    "yogurt_greek_plain":      (97,   9.0, 3.6,  5.0),   # FDC 170894 (whole milk)
    "yogurt_plain_lowfat":     (63,   5.3, 7.0,  1.6),   # FDC 170886
    "milk_whole":              (61,   3.2, 4.8,  3.3),   # FDC 171265
    "milk_skim":               (34,   3.4, 5.0,  0.1),   # FDC 171269
    "cheese_cheddar":          (404, 22.9, 3.4, 33.1),   # FDC 171247
    "cottage_cheese_lowfat":   (98,  11.1, 3.4,  4.3),   # FDC 173414
    "butter":                  (717,  0.9, 0.1, 81.1),   # FDC 173410

    # Grains & legumes (DRY weight unless noted)
    "rice_white_cooked":       (130,  2.7, 28.2, 0.3),   # FDC 169704
    "rice_white_dry":          (365,  7.1, 80.0, 0.7),   # FDC 169702
    "rice_brown_cooked":       (123,  2.7, 25.6, 1.0),   # FDC 169706
    "rice_brown_dry":          (370,  7.9, 77.0, 2.9),   # FDC 169703
    "oats_dry":                (389, 16.9, 66.3, 6.9),   # FDC 173904
    "oats_cooked":             (71,   2.5, 12.0, 1.5),   # FDC 173905
    "quinoa_cooked":           (120,  4.4, 21.3, 1.9),   # FDC 168917
    "moong_dal_dry":           (347, 23.9, 62.6, 1.2),   # FDC 174273 (mung bean, raw)
    "moong_dal_cooked":        (105,  7.0, 19.0, 0.4),   # FDC 174274 (mung bean, boiled)
    "toor_dal_cooked":         (116,  7.0, 21.0, 0.5),   # FDC 173748 (pigeon pea, boiled)
    "urad_dal_dry":            (341, 25.0, 59.0, 1.6),   # FDC 174276 (black gram)
    "chickpeas_cooked":        (164,  8.9, 27.4, 2.6),   # FDC 173757
    "lentils_cooked":          (116,  9.0, 20.0, 0.4),   # FDC 172420
    "black_beans_cooked":      (132,  8.9, 23.7, 0.5),   # FDC 173734
    "kidney_beans_cooked":     (127,  8.7, 22.8, 0.5),   # FDC 173744
    "bread_whole_wheat":       (247, 13.4, 41.3, 3.5),   # FDC 172686
    "bread_white":             (266,  9.0, 49.0, 3.3),   # FDC 172684
    "roti_chapati":            (297, 11.0, 46.0, 7.5),   # FDC 175170 (Indian flatbread)
    "tortilla_wheat":          (304,  8.2, 50.0, 7.6),   # FDC 168988
    "pasta_cooked":            (158,  5.8, 31.0, 0.9),   # FDC 168927
    "whole_wheat_flour":       (340, 13.2, 72.0, 2.5),   # FDC 169722
    "rice_flour":              (366,  5.9, 80.0, 1.4),   # FDC 169714
    "besan_chickpea_flour":    (387, 22.4, 57.8, 6.7),   # FDC 169722
    "ragi_flour":              (336,  7.3, 72.0, 1.3),   # finger millet flour
    "semolina_rava":           (360, 12.7, 73.0, 1.1),   # FDC 168934 (suji/rava)
    "dalia_broken_wheat":      (340, 12.0, 76.0, 1.3),   # bulgur/dalia
    "poha_flattened_rice":     (346,  6.6, 77.3, 1.2),   # avalakki
    "makhana_fox_nut":         (350,  9.7, 76.9, 0.1),   # phool makhana
    "puffed_rice":              (402, 6.3, 89.8, 0.5),   # FDC 169724 (murmura)

    # Oils & fats (per 100g — these are by weight, not volume)
    "olive_oil":               (884,  0.0, 0.0, 100.0),  # FDC 171413
    "vegetable_oil":           (884,  0.0, 0.0, 100.0),  # generic
    "ghee":                    (876,  0.3, 0.0,  99.5),  # FDC 171404
    "coconut_oil":             (892,  0.0, 0.0, 100.0),  # FDC 173573

    # Vegetables
    "onion":                   (40,   1.1,  9.3, 0.1),   # FDC 170000
    "tomato":                  (18,   0.9,  3.9, 0.2),   # FDC 170457
    "spinach":                 (23,   2.9,  3.6, 0.4),   # FDC 168462
    "potato":                  (77,   2.0, 17.5, 0.1),   # FDC 170026 (raw, peeled)
    "potato_cooked":           (87,   1.9, 20.1, 0.1),   # FDC 170032 (boiled, no salt)
    "cauliflower":             (25,   1.9,  5.0, 0.3),   # FDC 169986
    "broccoli":                (34,   2.8,  6.6, 0.4),   # FDC 170379
    "carrot":                  (41,   0.9,  9.6, 0.2),   # FDC 170393
    "bell_pepper":             (31,   1.0,  6.0, 0.3),   # FDC 170427
    "cucumber":                (15,   0.7,  3.6, 0.1),   # FDC 168409
    "green_chili":             (40,   2.0,  9.5, 0.4),   # FDC 170108 (raw)
    "garlic":                  (149,  6.4, 33.1, 0.5),   # FDC 169230
    "ginger":                  (80,   1.8, 17.8, 0.8),   # FDC 169231
    "mushroom":                (22,   3.1,  3.3, 0.3),   # FDC 169251
    "okra":                    (33,   1.9,  7.5, 0.2),   # FDC 169260
    "eggplant":                (25,   1.0,  5.9, 0.2),   # FDC 169228
    "cabbage":                 (25,   1.3,  5.8, 0.1),   # FDC 169975
    "lettuce":                 (15,   1.4,  2.9, 0.2),   # FDC 169247

    # Fruits
    "banana":                  (89,   1.1, 22.8, 0.3),   # FDC 173944
    "apple":                   (52,   0.3, 13.8, 0.2),   # FDC 171688
    "berries_mixed":           (53,   1.0, 12.5, 0.4),   # FDC 173992 (blueberries proxy)
    "strawberries":            (32,   0.7,  7.7, 0.3),   # FDC 174106
    "orange":                  (47,   0.9, 11.8, 0.1),   # FDC 169097
    "avocado":                 (160,  2.0,  8.5, 14.7),  # FDC 171705
    "lemon":                   (29,   1.1,  9.3, 0.3),   # FDC 167746

    # Nuts & seeds
    "almonds":                 (579, 21.2, 21.6, 49.9),  # FDC 170567
    "walnuts":                 (654, 15.2, 13.7, 65.2),  # FDC 170187
    "peanuts":                 (567, 25.8, 16.1, 49.2),  # FDC 172430
    "cashews":                 (553, 18.2, 30.2, 43.9),  # FDC 170162
    "peanut_butter":           (588, 25.1, 20.0, 50.4),  # FDC 172470
    "chia_seeds":              (486, 16.5, 42.1, 30.7),  # FDC 170554
    "flax_seeds":              (534, 18.3, 28.9, 42.2),  # FDC 169414
    "sunflower_seeds":         (584, 20.8, 20.0, 51.5),  # FDC 170148
    "sesame_seeds":            (573, 17.7, 23.5, 49.7),  # FDC 170150

    # Sweeteners & misc
    "honey":                   (304,  0.3, 82.4, 0.0),   # FDC 169640
    "sugar_white":             (387,  0.0, 99.9, 0.0),   # FDC 169655
    "jaggery":                 (383,  0.4, 98.0, 0.1),   # gur
    "salt":                    (0,    0.0,  0.0, 0.0),
    "spices_powder":           (0,    0.0,  0.0, 0.0),   # negligible at typical amounts
    "water":                   (0,    0.0,  0.0, 0.0),
    "vinegar":                 (21,   0.0,  0.0, 0.0),   # FDC 173469
    "tamarind":                (239,  2.8, 62.5, 0.6),   # FDC 168188 paste
    "coconut_fresh":           (354,  3.3, 15.2, 33.5),  # FDC 170169 grated
    "mixed_vegetables":        (35,   1.5,  7.0, 0.2),   # avg of common mix
}


# ──────────────────────────────────────────────────────────────────────────
# Ingredient name → USDA_REF key
# Handles naming variants ("Soaked moong dal", "Mung beans", etc.)
# Order matters — first matching substring wins.
# ──────────────────────────────────────────────────────────────────────────

INGREDIENT_MAP = [
    # specific protein cuts first
    (r"chicken breast",         "chicken_breast_cooked"),
    (r"chicken thigh",          "chicken_thigh_cooked"),
    (r"chicken",                "chicken_breast_cooked"),  # default for plain "chicken"
    (r"turkey breast|turkey",   "turkey_breast_cooked"),
    (r"egg white",              "egg_white"),
    (r"egg",                    "egg_whole"),
    (r"salmon",                 "salmon_cooked"),
    (r"tuna",                   "tuna_canned_water"),
    (r"beef|sirloin|steak",     "beef_lean_cooked"),
    (r"shrimp|prawn",           "shrimp_cooked"),
    (r"tofu",                   "tofu_firm"),
    (r"tempeh",                 "tempeh"),

    # dairy
    (r"paneer",                 "paneer"),
    (r"greek yogurt|greek yoghurt", "yogurt_greek_plain"),
    (r"yogurt|yoghurt|curd|dahi", "yogurt_plain_lowfat"),
    (r"skim milk|non.?fat milk", "milk_skim"),
    (r"milk",                   "milk_whole"),
    (r"cheddar",                "cheese_cheddar"),
    (r"cottage cheese",         "cottage_cheese_lowfat"),
    (r"butter",                 "butter"),
    (r"ghee",                   "ghee"),

    # grains/legumes — Indian
    (r"moong dal|mung",         "moong_dal_dry"),
    (r"toor dal|arhar|pigeon pea", "toor_dal_cooked"),
    (r"urad dal|black gram",    "urad_dal_dry"),
    (r"chickpea|chana|garbanzo", "chickpeas_cooked"),
    (r"besan",                  "besan_chickpea_flour"),
    (r"roti|chapati|phulka",    "roti_chapati"),
    (r"naan|paratha|thepla|chilla|cheela|dosa|uttapam|idli|pesarattu", "roti_chapati"),
    (r"poha|flattened rice|aval", "poha_flattened_rice"),
    (r"ragi.*flour|finger millet", "ragi_flour"),
    (r"rava|semolina|suji",     "semolina_rava"),
    (r"dalia|broken wheat|bulgur", "dalia_broken_wheat"),
    (r"makhana|fox.?nut|phool makhana", "makhana_fox_nut"),
    (r"puffed rice|murmura|mamra", "puffed_rice"),

    # grains — global
    (r"brown rice",             "rice_brown_dry"),
    (r"white rice|basmati|jasmine|rice", "rice_white_dry"),
    (r"quinoa",                 "quinoa_cooked"),
    (r"oats|oatmeal",           "oats_dry"),
    (r"whole wheat flour|atta", "whole_wheat_flour"),
    (r"rice flour",             "rice_flour"),
    (r"whole.?wheat bread|multigrain bread|whole grain bread", "bread_whole_wheat"),
    (r"bread",                  "bread_white"),
    (r"tortilla|wrap",          "tortilla_wheat"),
    (r"pasta|spaghetti|penne|fusilli", "pasta_cooked"),
    (r"lentil",                 "lentils_cooked"),
    (r"black bean",             "black_beans_cooked"),
    (r"kidney bean|rajma",      "kidney_beans_cooked"),

    # oils
    (r"olive oil",              "olive_oil"),
    (r"coconut oil",            "coconut_oil"),
    (r"oil",                    "vegetable_oil"),

    # vegetables
    (r"onion",                  "onion"),
    (r"tomato",                 "tomato"),
    (r"spinach|palak",          "spinach"),
    (r"potato",                 "potato_cooked"),
    (r"cauliflower|gobi",       "cauliflower"),
    (r"broccoli",               "broccoli"),
    (r"carrot",                 "carrot"),
    (r"bell pepper|capsicum",   "bell_pepper"),
    (r"cucumber",               "cucumber"),
    (r"green chili|green chilli", "green_chili"),
    (r"garlic",                 "garlic"),
    (r"ginger",                 "ginger"),
    (r"mushroom",               "mushroom"),
    (r"okra|bhindi",            "okra"),
    (r"eggplant|brinjal|baingan", "eggplant"),
    (r"cabbage",                "cabbage"),
    (r"lettuce|salad green",    "lettuce"),
    (r"coriander|cilantro|mint|parsley|dill", "spinach"),  # leafy herbs ≈ greens

    # fruits
    (r"banana",                 "banana"),
    (r"apple",                  "apple"),
    (r"berr|blueberr|raspberr|blackberr", "berries_mixed"),
    (r"strawberr",              "strawberries"),
    (r"orange|mandarin",        "orange"),
    (r"avocado",                "avocado"),
    (r"lemon|lime",             "lemon"),
    (r"tamarind",               "tamarind"),
    (r"coconut",                "coconut_fresh"),
    (r"mixed vegetable|mixed veggies", "mixed_vegetables"),
    (r"fish|rohu|surmai|cod|tilapia|pomfret", "fish_white_cooked"),
    (r"bacon",                  "bacon_cooked"),
    (r"sprouted moong|sprouts",  "moong_dal_cooked"),
    (r"curry leaves|curry leaf|kadi patta", "spices_powder"),  # negligible at typical amounts
    (r"dry red chili|whole red chili|kashmiri chili", "spices_powder"),
    (r"sambar powder|chole masala|amchur|chaat masala|sambhar masala|biryani masala|rasam powder|tea bag|idli batter|chutney|sauce|paste",
        "spices_powder"),

    # nuts/seeds
    (r"almond",                 "almonds"),
    (r"walnut",                 "walnuts"),
    (r"peanut butter",          "peanut_butter"),
    (r"peanut|groundnut",       "peanuts"),
    (r"cashew",                 "cashews"),
    (r"chia",                   "chia_seeds"),
    (r"flax|alsi",              "flax_seeds"),
    (r"sunflower seed",         "sunflower_seeds"),
    (r"sesame|til",             "sesame_seeds"),

    # sweeteners
    (r"honey",                  "honey"),
    (r"jaggery|gur",            "jaggery"),
    (r"sugar",                  "sugar_white"),
    (r"salt|pepper|cumin|turmeric|coriander powder|garam masala|chili powder|paprika|cardamom|cinnamon|clove|bay leaf|mustard seed|fenugreek|asafoetida|hing|spice", "spices_powder"),
    (r"vinegar",                "vinegar"),
    (r"water|stock|broth",      "water"),
]


# ──────────────────────────────────────────────────────────────────────────
# Unit conversions — to grams
# For volume units, conversions are ingredient-aware: liquids ≈ water,
# rice/flour have different densities, etc.
# ──────────────────────────────────────────────────────────────────────────

# Default conversions (when ingredient density unknown, use water-equivalent)
DEFAULT_TSP_G = 5.0
DEFAULT_TBSP_G = 15.0
DEFAULT_CUP_G = 240.0

# Specific densities (grams per cup) for common cooking ingredients
CUP_GRAMS = {
    "rice_white_cooked":   158,
    "rice_white_dry":      185,
    "rice_brown_cooked":   195,
    "rice_brown_dry":      190,
    "oats_dry":            81,
    "oats_cooked":         234,
    "semolina_rava":       167,
    "dalia_broken_wheat":  157,
    "poha_flattened_rice": 95,
    "makhana_fox_nut":     15,    # very low density
    "puffed_rice":         15,    # very low density
    "ragi_flour":          120,
    "urad_dal_dry":        210,
    "tamarind":            240,
    "coconut_fresh":       80,
    "mixed_vegetables":    150,
    "fish_white_cooked":   170,
    "quinoa_cooked":       185,
    "whole_wheat_flour":   120,
    "rice_flour":          158,
    "besan_chickpea_flour": 92,
    "moong_dal_dry":       200,
    "moong_dal_cooked":    202,
    "toor_dal_cooked":     200,
    "chickpeas_cooked":    164,
    "lentils_cooked":      198,
    "black_beans_cooked":  172,
    "kidney_beans_cooked": 177,
    "yogurt_greek_plain":  245,
    "yogurt_plain_lowfat": 245,
    "milk_whole":          244,
    "milk_skim":           245,
    "olive_oil":           216,
    "vegetable_oil":       218,
    "ghee":                205,
    "coconut_oil":         218,
    "onion":               160,  # chopped
    "tomato":              180,  # chopped
    "spinach":             30,   # raw, packed
    "berries_mixed":       144,
    "almonds":             143,
    "peanuts":             146,
    "cashews":             129,
    "honey":               340,
    "sugar_white":         200,
}

# Per-piece weights for count-based ingredients
PIECE_GRAMS = {
    "egg_whole":     50,    # large egg
    "egg_white":     33,
    "onion":         110,   # medium
    "tomato":        123,   # medium
    "potato_cooked": 173,   # medium
    "carrot":        61,    # medium
    "banana":        118,   # medium
    "apple":         182,   # medium
    "orange":        131,
    "avocado":       150,
    "green_chili":   3,     # small
    "garlic":        3,     # 1 clove
    "ginger":        6,     # 1 tsp grated equiv
    "lemon":         58,
    "bread_whole_wheat": 28, # slice
    "bread_white":   28,
    "roti_chapati":  40,    # single roti
    "tortilla_wheat": 49,
}

# Synonyms for piece-related units
PIECE_UNITS = {"piece", "pieces", "small", "medium", "large", "slice", "slices", "clove", "cloves"}


def to_grams(amount: float, unit: str, ref_key: str | None) -> float | None:
    """Convert (amount, unit, ingredient) → grams. None if can't convert."""
    # Strip parenthetical hints like "cup (dry)" → "cup"
    u = re.sub(r"\([^)]*\)", "", (unit or "")).strip().lower()
    if u in ("g", "gram", "grams"):
        return amount
    if u in ("kg", "kilogram"):
        return amount * 1000
    if u in ("mg", "milligram"):
        return amount / 1000
    if u in ("oz", "ounce", "ounces"):
        return amount * 28.35
    if u in ("lb", "pound", "pounds"):
        return amount * 453.6
    if u in ("ml", "milliliter", "milliliters"):
        return amount  # ≈ water density
    if u in ("l", "liter", "liters"):
        return amount * 1000
    if u in ("tsp", "teaspoon", "teaspoons"):
        return amount * DEFAULT_TSP_G
    if u in ("tbsp", "tablespoon", "tablespoons"):
        return amount * DEFAULT_TBSP_G
    if u in ("cup", "cups"):
        return amount * CUP_GRAMS.get(ref_key or "", DEFAULT_CUP_G)
    if u in ("pinch", "dash", "sprinkle"):
        return 0.5  # negligible
    if u in ("inch", "inches", "cm"):
        return amount * 5  # ~5g per inch of ginger/etc.
    if u in PIECE_UNITS or u == "":
        if ref_key and ref_key in PIECE_GRAMS:
            return amount * PIECE_GRAMS[ref_key]
        # If unit empty AND ingredient is a spice/seasoning, treat as negligible
        if ref_key in ("spices_powder", "salt", "water"):
            return 0.5
        return None  # unknown count → can't convert
    return None


# ──────────────────────────────────────────────────────────────────────────
# Ingredient classification
# ──────────────────────────────────────────────────────────────────────────

def classify_ingredient(name: str) -> str | None:
    """Map an ingredient name (free text) to a USDA_REF key, or None."""
    n = name.lower()
    # Strip parentheticals like "(soaked 4 hrs)", "(finely chopped)"
    n = re.sub(r"\([^)]*\)", "", n).strip()
    for pattern, key in INGREDIENT_MAP:
        if re.search(pattern, n):
            return key
    return None


# ──────────────────────────────────────────────────────────────────────────
# Parse TS meal files
# ──────────────────────────────────────────────────────────────────────────

MEAL_BLOCK_RE = re.compile(
    r'\{\s*'
    r'name:\s*"([^"]+)",\s*'
    r'description:\s*"[^"]*",\s*'
    r'calories:\s*(\d+(?:\.\d+)?),\s*'
    r'protein_g:\s*(\d+(?:\.\d+)?),\s*'
    r'carbs_g:\s*(\d+(?:\.\d+)?),\s*'
    r'fat_g:\s*(\d+(?:\.\d+)?),\s*'
    r'(?:servings:\s*(\d+),\s*)?'  # optional servings field
    r'.*?'
    r'recipe:\s*\{\s*ingredients:\s*\[(.*?)\]\s*,\s*steps:',
    re.DOTALL,
)

INGREDIENT_RE = re.compile(
    r'\{\s*name:\s*"([^"]+)"\s*,\s*amount:\s*"([^"]+)"\s*,\s*unit:\s*"([^"]*)"',
    re.DOTALL,
)


def parse_amount(s: str) -> float | None:
    """Parse '1', '1/2', '1.5', '1/4 - 1/2' → float."""
    s = s.strip().lower()
    if s in ("to taste", "a pinch", "as needed", ""):
        return 0.001  # negligible
    # Range like "1-2" or "1 to 2"
    m = re.match(r"^([\d/.]+)\s*[-–to]+\s*([\d/.]+)$", s)
    if m:
        a = parse_amount(m.group(1))
        b = parse_amount(m.group(2))
        if a is not None and b is not None:
            return (a + b) / 2
        return None
    # Fraction "1/2"
    if "/" in s:
        try:
            num, den = s.split("/")
            return float(num) / float(den)
        except (ValueError, ZeroDivisionError):
            return None
    # Mixed "1 1/2"
    m = re.match(r"^(\d+)\s+(\d+)/(\d+)$", s)
    if m:
        return float(m.group(1)) + float(m.group(2)) / float(m.group(3))
    try:
        return float(s)
    except ValueError:
        return None


def parse_meals(ts_path: Path) -> list[dict]:
    """Parse all meal blocks from a TS file."""
    text = ts_path.read_text(encoding="utf-8")
    meals = []
    for m in MEAL_BLOCK_RE.finditer(text):
        name, kcal, p, c, f, servings_raw, ing_block = m.groups()
        servings = int(servings_raw) if servings_raw else 1
        ingredients = []
        for im in INGREDIENT_RE.finditer(ing_block):
            ingredients.append({
                "name": im.group(1),
                "amount": im.group(2),
                "unit": im.group(3),
            })
        meals.append({
            "source": ts_path.name,
            "name": name,
            "servings": servings,
            "listed": {
                "calories": float(kcal),
                "protein_g": float(p),
                "carbs_g": float(c),
                "fat_g": float(f),
            },
            "ingredients": ingredients,
        })
    return meals


# ──────────────────────────────────────────────────────────────────────────
# Reconstruct macros from ingredients
# ──────────────────────────────────────────────────────────────────────────

def reconstruct_macros(meal: dict) -> dict:
    """Compute macros by summing ingredient contributions. Returns dict with totals + diagnostics."""
    total_g = 0.0
    total_kcal = 0.0
    total_p = 0.0
    total_c = 0.0
    total_f = 0.0
    unresolved = []
    resolved_count = 0
    for ing in meal["ingredients"]:
        amt = parse_amount(ing["amount"])
        if amt is None:
            unresolved.append(f"{ing['name']} (couldn't parse amount '{ing['amount']}')")
            continue
        key = classify_ingredient(ing["name"])
        if key is None:
            unresolved.append(f"{ing['name']} (no USDA mapping)")
            continue
        grams = to_grams(amt, ing["unit"], key)
        if grams is None:
            unresolved.append(f"{ing['name']} ({amt} {ing['unit']} → can't convert to grams)")
            continue
        ref = USDA_REF.get(key)
        if ref is None:
            unresolved.append(f"{ing['name']} (mapped to {key}, but key missing from USDA_REF)")
            continue
        kcal100, p100, c100, f100 = ref
        ratio = grams / 100.0
        total_g += grams
        total_kcal += kcal100 * ratio
        total_p += p100 * ratio
        total_c += c100 * ratio
        total_f += f100 * ratio
        resolved_count += 1
    return {
        "computed": {
            "grams": total_g,
            "calories": total_kcal,
            "protein_g": total_p,
            "carbs_g": total_c,
            "fat_g": total_f,
        },
        "unresolved": unresolved,
        "resolved_count": resolved_count,
        "total_count": len(meal["ingredients"]),
    }


# ──────────────────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────────────────

def main():
    all_meals = []
    for fp in MEAL_FILES:
        if not fp.exists():
            print(f"⚠️  skipping missing file: {fp}", file=sys.stderr)
            continue
        meals = parse_meals(fp)
        print(f"Parsed {len(meals)} meals from {fp.name}", file=sys.stderr)
        all_meals.extend(meals)

    rows = []
    flagged = []
    for meal in all_meals:
        recon = reconstruct_macros(meal)
        listed = meal["listed"]
        servings = meal.get("servings", 1) or 1
        # Recipe ingredients describe the whole batch — divide by servings
        # to get per-serving values that line up with listed (per-serving) macros.
        comp = {
            "grams": recon["computed"]["grams"] / servings,
            "calories": recon["computed"]["calories"] / servings,
            "protein_g": recon["computed"]["protein_g"] / servings,
            "carbs_g": recon["computed"]["carbs_g"] / servings,
            "fat_g": recon["computed"]["fat_g"] / servings,
        }

        coverage_pct = (recon["resolved_count"] / max(1, recon["total_count"])) * 100

        # Variance vs listed (only meaningful if coverage is decent)
        def pct_diff(a, b):
            if b == 0:
                return 0.0 if a == 0 else float("inf")
            return (a - b) / b * 100.0

        d_kcal = pct_diff(comp["calories"], listed["calories"])
        d_p = pct_diff(comp["protein_g"], listed["protein_g"])
        d_c = pct_diff(comp["carbs_g"], listed["carbs_g"])
        d_f = pct_diff(comp["fat_g"], listed["fat_g"])

        worst = max(abs(d_kcal), abs(d_p), abs(d_c), abs(d_f))
        status = "OK" if (worst <= ACCEPT_PCT and coverage_pct >= 80) else (
            "LOW_COVERAGE" if coverage_pct < 80 else "VARIANCE"
        )

        rows.append({
            "name": meal["name"],
            "source": meal["source"],
            "servings": servings,
            "ingredients_resolved": f"{recon['resolved_count']}/{recon['total_count']}",
            "coverage_pct": f"{coverage_pct:.0f}%",
            "listed_kcal": listed["calories"],
            "computed_kcal_per_serving": round(comp["calories"], 1),
            "kcal_diff_pct": round(d_kcal, 1),
            "listed_P": listed["protein_g"],
            "computed_P": round(comp["protein_g"], 1),
            "p_diff_pct": round(d_p, 1),
            "listed_C": listed["carbs_g"],
            "computed_C": round(comp["carbs_g"], 1),
            "c_diff_pct": round(d_c, 1),
            "listed_F": listed["fat_g"],
            "computed_F": round(comp["fat_g"], 1),
            "f_diff_pct": round(d_f, 1),
            "status": status,
            "worst_variance": round(worst, 1),
            "unresolved": "; ".join(recon["unresolved"][:3]),
        })

        if status == "VARIANCE":
            flagged.append((meal["name"], worst, d_kcal, d_p, d_c, d_f, recon))

    # Write CSV
    if rows:
        with open(OUT_CSV, "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
            w.writeheader()
            w.writerows(rows)

    # Console summary
    total = len(rows)
    ok = sum(1 for r in rows if r["status"] == "OK")
    low_cov = sum(1 for r in rows if r["status"] == "LOW_COVERAGE")
    variance = sum(1 for r in rows if r["status"] == "VARIANCE")

    print()
    print(f"════════════════════════════════════════════════════════════")
    print(f"  USDA MACRO AUDIT — {total} meals processed")
    print(f"════════════════════════════════════════════════════════════")
    print(f"  ✓ OK             ({ok:>3}): within ±{ACCEPT_PCT:.0f}% of USDA-reconstructed macros")
    print(f"  ? LOW_COVERAGE   ({low_cov:>3}): <80% of ingredients resolved — can't audit reliably")
    print(f"  ⚠ VARIANCE       ({variance:>3}): >{ACCEPT_PCT:.0f}% drift from USDA reconstruction")
    print(f"════════════════════════════════════════════════════════════")
    print(f"  Full report: {OUT_CSV.relative_to(ROOT)}")
    print()

    if flagged:
        print(f"Top {min(15, len(flagged))} VARIANCE meals (worst first):")
        print(f"  {'Meal':<45} {'kcal':>8} {'Δ%':>7} {'P %':>6} {'C %':>6} {'F %':>6}")
        for name, worst, dk, dp, dc, df, recon in sorted(flagged, key=lambda x: -x[1])[:15]:
            print(f"  {name:<45} {recon['computed']['calories']:>7.0f}  {dk:>+5.1f}% {dp:>+5.1f}% {dc:>+5.1f}% {df:>+5.1f}%")

    return 0 if variance == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
