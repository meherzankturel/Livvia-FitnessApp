"""Local ingredient nutrition database with realistic per-unit weights.
Values sourced from USDA FoodData Central + IFCT 2017 (for Indian ingredients).
Used as the third independent source in the 3-way macro audit.

Format: per the listed unit. Calories rounded to whole numbers.
"""

# Each entry: (cal, protein_g, carbs_g, fat_g)
# Key format: (normalized_name, normalized_unit) → tuple
# Normalized name = lowercased, stripped of parens/details

NUTRITION_DB: dict[tuple[str, str], tuple[float, float, float, float]] = {
    # ── PROTEINS ──────────────────────────────────────────────────────
    ("egg", "large"):                    (70, 6, 0, 5),
    ("egg", "medium"):                   (60, 5, 0, 4),
    ("eggs", "large"):                   (70, 6, 0, 5),
    ("eggs", "medium"):                  (60, 5, 0, 4),
    ("chicken breast", "g"):             (1.65, 0.31, 0, 0.04),
    ("chicken breast (thin)", "g"):      (1.65, 0.31, 0, 0.04),
    ("chicken breast", "100g"):          (165, 31, 0, 4),
    ("chicken thigh", "g"):              (2.4, 0.20, 0, 0.17),
    ("chicken thigh (bone-in)", "g"):    (2.0, 0.18, 0, 0.13),
    ("chicken thighs", "g"):             (2.4, 0.20, 0, 0.17),
    ("ground chicken", "g"):             (1.45, 0.20, 0, 0.08),
    ("ground beef", "g"):                (2.50, 0.26, 0, 0.17),
    ("ground lamb", "g"):                (2.94, 0.25, 0, 0.21),
    ("ground pork", "g"):                (2.50, 0.21, 0, 0.18),
    ("ground turkey", "g"):              (1.50, 0.20, 0, 0.08),
    ("salmon fillet", "g"):              (2.08, 0.20, 0, 0.13),
    ("salmon", "g"):                     (2.08, 0.20, 0, 0.13),
    ("tuna", "g"):                       (1.30, 0.28, 0, 0.01),
    ("tuna steak", "g"):                 (1.30, 0.28, 0, 0.01),
    ("cod", "g"):                        (0.82, 0.18, 0, 0.01),
    ("tilapia", "g"):                    (1.30, 0.26, 0, 0.03),
    ("shrimp", "g"):                     (0.99, 0.24, 0, 0.003),
    ("bacon", "g"):                      (5.40, 0.37, 0.01, 0.42),
    ("ham", "g"):                        (1.45, 0.21, 0.01, 0.06),
    ("firm tofu", "g"):                  (1.44, 0.17, 0.03, 0.08),
    ("silken tofu", "g"):                (0.55, 0.05, 0.02, 0.03),
    ("paneer", "g"):                     (2.65, 0.18, 0.01, 0.21),
    ("tempeh", "g"):                     (1.93, 0.20, 0.09, 0.11),
    ("halloumi", "g"):                   (3.30, 0.21, 0.02, 0.27),
    ("falafel", "pieces"):               (60, 3, 5, 4),    # ~17g each
    ("falafel", "piece"):                (60, 3, 5, 4),
    ("hard-boiled eggs", "large"):       (70, 6, 0, 5),

    # ── DAIRY ─────────────────────────────────────────────────────────
    ("butter", "tbsp"):                  (102, 0, 0, 11.5),
    ("butter", "tsp"):                   (34, 0, 0, 3.8),
    ("ghee", "tbsp"):                    (112, 0, 0, 13),
    ("greek yogurt", "cup"):             (220, 22, 8, 12),  # full-fat
    ("greek yogurt", "tbsp"):            (14, 1.4, 0.5, 0.8),
    ("yogurt", "cup"):                   (150, 8, 11, 8),
    ("milk", "cup"):                     (150, 8, 12, 8),
    ("heavy cream", "cup"):              (810, 7, 7, 86),
    ("heavy cream", "tbsp"):             (51, 0.4, 0.4, 5.4),
    ("sour cream", "tbsp"):              (30, 0.4, 0.6, 3.0),
    ("cream cheese", "tbsp"):            (50, 1, 1, 5),
    ("fresh mozzarella", "g"):           (3.0, 0.22, 0.02, 0.22),
    ("mozzarella", "g"):                 (3.0, 0.22, 0.02, 0.22),
    ("feta", "g"):                       (2.65, 0.14, 0.04, 0.21),
    ("cheddar", "g"):                    (4.04, 0.25, 0.01, 0.33),
    ("parmesan", "g"):                   (4.31, 0.38, 0.04, 0.29),
    ("gruyère", "g"):                    (4.13, 0.30, 0.004, 0.32),
    ("queso fresco", "g"):               (3.07, 0.18, 0.03, 0.24),
    ("ricotta", "g"):                    (1.74, 0.11, 0.03, 0.13),
    ("cottage cheese", "g"):             (0.98, 0.11, 0.03, 0.04),

    # ── GRAINS / BREAD / WRAPS ────────────────────────────────────────
    ("whole wheat bread", "slices"):     (70, 3, 13, 1),
    ("white bread", "slices"):           (70, 3, 14, 1),
    ("sourdough", "slices"):             (80, 3, 16, 1),
    ("sourdough bread", "slices"):       (80, 3, 16, 1),
    ("multigrain bread", "slices"):      (90, 4, 16, 2),
    ("baguette", "slices"):              (80, 3, 16, 1),
    ("baguette slice", "slices"):        (80, 3, 16, 1),
    ("pastry shell", "slices"):          (200, 3, 18, 13),  # single-serve quiche
    ("pita bread", "whole"):             (165, 5, 33, 1),   # 6-inch
    ("pita bread", "large"):             (230, 7, 47, 1),
    ("whole wheat pita", "large"):       (230, 8, 47, 1),
    ("whole wheat wrap", "large"):       (220, 6, 35, 6),
    ("corn tortillas", "small"):         (50, 1, 11, 1),
    ("corn tortilla", "small"):          (50, 1, 11, 1),
    ("flour tortilla", "small"):         (95, 3, 16, 2),
    ("flour tortilla", "large"):         (220, 6, 35, 6),
    ("roti", "piece"):                   (120, 4, 22, 3),
    ("phulka", "piece"):                 (90, 3, 18, 1),
    ("chapati", "piece"):                (120, 4, 22, 3),
    ("paratha", "piece"):                (270, 6, 36, 10),
    ("naan", "piece"):                   (260, 9, 45, 5),
    ("idli", "piece"):                   (40, 2, 8, 0.2),
    ("dosa", "piece"):                   (135, 4, 22, 4),

    # Rice & grains (DRY measurements)
    ("basmati rice", "cup dry"):         (675, 13, 148, 1),
    ("white rice", "cup dry"):           (680, 13, 148, 1),
    ("brown rice", "cup dry"):           (685, 14, 143, 5),
    ("jasmine rice", "cup dry"):         (680, 13, 148, 1),
    ("arborio rice", "cup"):             (675, 13, 148, 1),   # implied dry
    ("sushi rice", "cup dry"):           (680, 13, 148, 1),
    # Rice cooked
    ("basmati rice", "cup cooked"):      (210, 5, 45, 0.5),
    ("white rice", "cup cooked"):        (205, 4, 45, 0.4),
    ("brown rice", "cup cooked"):        (215, 5, 45, 1.8),
    ("jasmine rice", "cup cooked"):      (210, 4, 45, 0.5),
    ("cilantro-lime rice", "cup cooked"):(220, 4, 46, 2),
    ("rice", "cup cooked"):              (205, 4, 45, 0.5),
    ("sushi rice", "cup cooked"):        (216, 4, 47, 0.4),
    # Pasta
    ("spaghetti", "g dry"):              (3.7, 0.13, 0.75, 0.02),
    ("linguine", "g dry"):               (3.7, 0.13, 0.75, 0.02),
    ("penne", "g dry"):                  (3.7, 0.13, 0.75, 0.02),
    ("pasta", "g dry"):                  (3.7, 0.13, 0.75, 0.02),
    ("rice noodles", "g dry"):           (3.6, 0.06, 0.81, 0.01),
    # Cereals/oats
    ("rolled oats", "cup dry"):          (300, 11, 54, 5),
    ("oats", "cup dry"):                 (300, 11, 54, 5),
    ("oatmeal", "cup cooked"):           (160, 6, 28, 3),
    ("granola", "cup"):                  (470, 11, 64, 21),
    # Legumes (DRY)
    ("brown lentils", "cup dry"):        (680, 50, 115, 2),
    ("red lentils", "cup dry"):          (665, 47, 115, 2),
    ("lentils", "cup dry"):              (680, 50, 115, 2),
    ("chickpeas", "cup dry"):            (725, 38, 121, 12),
    ("black beans", "cup dry"):          (660, 42, 121, 3),
    ("kidney beans", "cup dry"):         (615, 41, 110, 2),
    ("toor dal", "cup dry"):             (685, 50, 115, 3),
    ("moong dal", "cup dry"):            (685, 48, 116, 2),
    ("chana dal", "cup dry"):            (725, 38, 121, 12),
    # Legumes (COOKED / CANNED)
    ("black beans", "cup"):              (220, 14, 40, 1),
    ("chickpeas", "cup"):                (270, 14, 45, 4),
    ("kidney beans", "cup"):             (215, 15, 39, 1),
    # Other carbs
    ("polenta", "cup dry"):              (350, 8, 78, 2),
    ("bulgur", "cup cooked"):            (150, 6, 34, 0.4),
    ("quinoa", "cup dry"):               (625, 24, 109, 10),
    ("couscous", "cup dry"):             (650, 22, 134, 1),
    ("besan", "cup"):                    (360, 21, 53, 6),    # chickpea flour, 100g
    ("rice flour", "cup"):               (370, 6, 80, 1),
    # Breakfast
    ("granola", "cup"):                  (470, 11, 64, 21),

    # ── OILS & FATS ───────────────────────────────────────────────────
    ("olive oil", "tbsp"):               (119, 0, 0, 14),
    ("olive oil", "tsp"):                (40, 0, 0, 4.7),
    ("vegetable oil", "tbsp"):           (120, 0, 0, 14),
    ("oil", "tbsp"):                     (120, 0, 0, 14),
    ("oil", "tsp"):                      (40, 0, 0, 4.7),
    ("sesame oil", "tbsp"):              (120, 0, 0, 14),
    ("sesame oil", "tsp"):               (40, 0, 0, 4.7),
    ("coconut oil", "tbsp"):             (117, 0, 0, 14),
    ("mayonnaise", "tbsp"):              (93, 0.1, 0.1, 10.3),
    ("mayo", "tbsp"):                    (93, 0.1, 0.1, 10.3),

    # ── VEGETABLES (mostly low-cal) ───────────────────────────────────
    ("tomato", "medium"):                (22, 1, 5, 0),
    ("tomatoes", "medium"):              (22, 1, 5, 0),
    ("cherry tomatoes", "cup"):          (27, 1, 6, 0),
    ("crushed tomatoes", "cup"):         (80, 4, 18, 0.5),
    ("san marzano tomatoes", "cup"):     (80, 4, 18, 0.5),
    ("onion", "medium"):                 (44, 1, 10, 0),
    ("onions", "large"):                 (60, 2, 14, 0),
    ("pearl onions", "g"):               (0.40, 0.01, 0.09, 0),
    ("yellow onions", "large"):          (60, 2, 14, 0),
    ("red onion", "medium"):             (44, 1, 10, 0),
    ("cucumber", "medium"):              (30, 1, 7, 0),
    ("bell pepper", "medium"):           (30, 1, 7, 0),
    ("red bell pepper", "medium"):       (30, 1, 7, 0),
    ("green bell pepper", "medium"):     (24, 1, 6, 0),
    ("eggplant", "small"):               (75, 3, 18, 1),
    ("eggplant", "medium"):              (130, 5, 30, 1),
    ("zucchini", "medium"):              (33, 2, 6, 0),
    ("carrot", "medium"):                (25, 1, 6, 0),
    ("carrots", "medium"):               (25, 1, 6, 0),
    ("potato", "medium"):                (160, 4, 36, 0),
    ("baby potatoes", "g"):              (0.77, 0.02, 0.17, 0),
    ("spinach", "cup"):                  (7, 1, 1, 0),
    ("lettuce", "cup"):                  (5, 0.5, 1, 0),
    ("butter lettuce", "leaves"):        (1, 0.1, 0.2, 0),
    ("cabbage", "cup shredded"):         (18, 1, 4, 0),
    ("red cabbage", "cup shredded"):     (22, 1, 5, 0),
    ("mushrooms", "g"):                  (0.22, 0.03, 0.03, 0),
    ("mushrooms", "cup"):                (21, 3, 3, 0),
    ("mixed mushrooms", "g"):            (0.22, 0.03, 0.03, 0),
    ("avocado", "whole"):                (240, 3, 12, 22),
    ("avocado", "medium"):               (240, 3, 12, 22),
    ("garlic", "cloves"):                (4, 0.2, 1, 0),
    ("garlic", "clove"):                 (4, 0.2, 1, 0),
    ("ginger", "tsp"):                   (2, 0.05, 0.4, 0),
    ("green beans", "cup"):              (35, 2, 8, 0),
    ("green peas", "cup"):               (120, 8, 21, 0.5),
    ("corn", "cup"):                     (140, 5, 32, 2),
    ("leeks", "small"):                  (45, 1, 11, 0),
    ("scallions", "stalks"):             (5, 0.2, 1.1, 0),
    ("scallions", "stalk"):              (5, 0.2, 1.1, 0),

    # ── HERBS / SPICES (mostly negligible) ────────────────────────────
    ("fresh chives", "tbsp"):            (1, 0.1, 0.1, 0),
    ("chives", "tbsp"):                  (1, 0.1, 0.1, 0),
    ("fresh basil", "leaves"):           (0.2, 0.02, 0.03, 0),
    ("basil", "leaves"):                 (0.2, 0.02, 0.03, 0),
    ("fresh basil", "tbsp"):             (1, 0.1, 0.1, 0),
    ("cilantro", "tbsp"):                (1, 0.1, 0.1, 0),
    ("parsley", "tbsp"):                 (1, 0.1, 0.1, 0),
    ("mint", "tbsp"):                    (1, 0.1, 0.2, 0),
    ("dill", "tsp"):                     (1, 0.1, 0.1, 0),
    ("oregano", "tsp"):                  (3, 0.1, 0.7, 0.1),
    ("cumin", "tsp"):                    (8, 0.4, 0.9, 0.5),
    ("cumin seeds", "tsp"):              (8, 0.4, 0.9, 0.5),
    ("paprika", "tsp"):                  (6, 0.3, 1.2, 0.3),
    ("turmeric powder", "tsp"):          (9, 0.3, 1.6, 0.2),
    ("coriander", "tsp"):                (5, 0.2, 1, 0.3),
    ("herbes de provence", "tsp"):       (4, 0.2, 0.8, 0.1),
    ("ajwain (carom seeds)", "tsp"):     (10, 0.5, 1.5, 0.6),
    ("red chili powder", "tsp"):         (8, 0.3, 1.4, 0.4),
    ("green chili", "piece"):            (2, 0.1, 0.5, 0),
    ("green chili (chopped)", "pieces"): (2, 0.1, 0.5, 0),

    # ── NUTS / SEEDS ──────────────────────────────────────────────────
    ("peanuts", "tbsp"):                 (50, 2, 1.5, 4),
    ("peanut butter", "tbsp"):           (95, 4, 4, 8),
    ("almonds", "tbsp"):                 (50, 2, 2, 4),
    ("walnuts", "tbsp"):                 (50, 1, 1, 5),
    ("cashews", "tbsp"):                 (50, 2, 3, 4),
    ("sesame seeds", "tsp"):             (16, 0.5, 0.7, 1.5),
    ("tahini", "tbsp"):                  (90, 3, 3, 8),

    # ── CONDIMENTS / SAUCES ───────────────────────────────────────────
    ("soy sauce", "tbsp"):               (8, 1.3, 0.8, 0.1),
    ("hummus", "tbsp"):                  (25, 1, 2, 1.5),
    ("hummus", "cup"):                   (400, 14, 32, 24),
    ("salsa", "tbsp"):                   (5, 0.2, 1.1, 0),
    ("salsa roja", "cup"):               (70, 3, 16, 0.5),
    ("marinara sauce", "cup"):           (140, 4, 24, 4),
    ("balsamic glaze", "tsp"):           (15, 0, 4, 0),
    ("balsamic vinegar", "tbsp"):        (14, 0, 3, 0),
    ("rice vinegar", "tsp"):             (1, 0, 0.2, 0),
    ("honey", "tbsp"):                   (65, 0, 17, 0),
    ("honey", "tsp"):                    (21, 0, 6, 0),
    ("maple syrup", "tbsp"):             (52, 0, 13, 0),
    ("gochujang", "tbsp"):               (35, 1, 7, 0),
    ("tamarind paste", "tbsp"):          (12, 0.3, 3, 0),
    ("mirin", "tbsp"):                   (40, 0, 9, 0),
    ("miso paste", "tbsp"):              (35, 2, 5, 1),
    ("white miso paste", "tbsp"):        (35, 2, 5, 1),
    ("pickles", "tbsp"):                 (3, 0.1, 0.7, 0),
    ("pickled ginger", "tbsp"):          (7, 0.1, 1.7, 0),
    ("capers", "tbsp"):                  (2, 0.2, 0.4, 0),
    ("olives", "pieces"):                (5, 0, 0.3, 0.4),  # per olive
    ("niçoise olives", "tbsp"):          (25, 0.2, 1.4, 2.3),
    ("sun-dried tomatoes", "tbsp"):      (15, 0.8, 3, 0.2),

    # ── BROTHS / WINES ────────────────────────────────────────────────
    ("vegetable broth", "cup"):          (15, 0, 3, 0),
    ("beef broth", "cup"):               (15, 3, 0, 0),
    ("chicken broth", "cup"):            (15, 2, 0, 0),
    ("dashi or veg broth", "cup"):       (15, 0, 3, 0),
    ("red wine", "cup"):                 (170, 0, 8, 0),
    ("white wine", "cup"):               (160, 0, 6, 0),
    ("white wine", "tbsp"):              (10, 0, 0.4, 0),
    ("water", "cup"):                    (0, 0, 0, 0),

    # ── PANTRY DRY ────────────────────────────────────────────────────
    ("flour", "tbsp"):                   (28, 1, 6, 0),
    ("flour", "tsp"):                    (9, 0.3, 2, 0),
    ("breadcrumbs", "tbsp"):             (28, 1, 5, 0.3),
    ("salt", "pinch"):                   (0, 0, 0, 0),
    ("salt", "tsp"):                     (0, 0, 0, 0),
    ("black pepper", "pinch"):           (0, 0, 0, 0),
    ("black pepper", "tsp"):             (5, 0.3, 1.4, 0.1),
    ("nori", "sheet"):                   (5, 1, 0.7, 0),

    # ── INDIAN-SPECIFIC ────────────────────────────────────────────────
    ("besan (chickpea flour)", "cup"):   (360, 21, 53, 6),
    ("gram flour", "cup"):               (360, 21, 53, 6),
    ("jaggery", "tbsp"):                 (45, 0, 12, 0),
    ("ghee", "tsp"):                     (37, 0, 0, 4),
    ("coconut", "tbsp"):                 (35, 0.3, 1.4, 3.3),
    ("coconut milk", "cup"):             (450, 5, 6, 48),
    ("curry leaves", "leaves"):          (0.3, 0, 0, 0),
    ("mustard seeds", "tsp"):            (15, 0.8, 1.2, 1.0),
    ("garam masala", "tsp"):             (7, 0.3, 1.5, 0.3),
    ("kasuri methi", "tsp"):             (2, 0.1, 0.4, 0),

    # Common in our recipes
    ("dumbbell", "_"):                   (0, 0, 0, 0),  # noop catch-all

    # ── EXPANSION: top unresolved items ───────────────────────────────
    ("lemon juice", "tbsp"):             (3, 0, 1, 0),
    ("lemon juice", "tsp"):              (1, 0, 0.4, 0),
    ("lime juice", "tbsp"):              (3, 0, 1, 0),
    ("lemon", "whole"):                  (17, 1, 5, 0),
    ("lime", "whole"):                   (20, 0.5, 7, 0),
    ("lemon wedge", "wedge"):            (3, 0, 1, 0),
    ("lemon wedge", "wedges"):           (3, 0, 1, 0),
    ("fresh coriander", "tbsp"):         (1, 0.1, 0.2, 0),
    ("fresh coriander", "cup"):          (4, 0.4, 0.7, 0),
    ("coriander leaves", "tbsp"):        (1, 0.1, 0.2, 0),
    ("ginger-garlic paste", "tbsp"):     (30, 1, 7, 0.2),
    ("ginger-garlic paste", "tsp"):      (10, 0.3, 2.3, 0.1),
    ("each salt and pepper", "pinch"):   (0, 0, 0, 0),
    ("salt and pepper", "pinch"):        (0, 0, 0, 0),
    ("salt", "to taste"):                (0, 0, 0, 0),
    ("coriander powder", "tsp"):         (5, 0.2, 1, 0.3),
    ("coriander powder", "tbsp"):        (15, 0.6, 3, 0.9),
    ("mustard oil", "tbsp"):             (124, 0, 0, 14),
    ("mustard oil", "tsp"):              (40, 0, 0, 4.5),
    ("chaat masala", "tsp"):             (5, 0.2, 1, 0.2),
    ("sugar", "tsp"):                    (16, 0, 4, 0),
    ("sugar", "tbsp"):                   (48, 0, 12, 0),
    ("brown sugar", "tsp"):              (15, 0, 4, 0),
    ("bay leaf", "piece"):               (1, 0, 0.2, 0),
    ("bay leaf", "leaf"):                (1, 0, 0.2, 0),
    ("bay leaves", "leaves"):            (1, 0, 0.2, 0),
    ("banana", "medium"):                (105, 1, 27, 0),
    ("banana", "whole"):                 (105, 1, 27, 0),
    ("shredded cheese", "tbsp"):         (28, 1.8, 0.2, 2.3),
    ("shredded cheese", "cup"):          (450, 28, 3, 36),
    ("grated parmesan cheese", "tbsp"):  (22, 2, 0.2, 1.5),
    ("yogurt (thick)", "cup"):           (220, 22, 8, 12),
    ("minced garlic", "clove"):          (4, 0.2, 1, 0),
    ("minced garlic", "cloves"):         (4, 0.2, 1, 0),
    ("minced garlic", "tbsp"):           (13, 0.6, 3, 0),
    ("cooking spray", "spray"):          (0, 0, 0, 0),
    ("cooking spray", ""):               (0, 0, 0, 0),
    ("toor dal", "cup dry"):             (685, 50, 115, 3),
    ("toor dal", "g"):                   (3.4, 0.25, 0.58, 0.02),
    ("urad dal", "cup dry"):             (705, 50, 117, 5),
    ("masoor dal", "cup dry"):           (665, 47, 115, 2),
    ("rajma", "cup dry"):                (615, 41, 110, 2),
    ("kabuli chana", "cup dry"):         (725, 38, 121, 12),
    ("steamed rice", "cup cooked"):      (205, 4, 45, 0.4),
    ("steamed rice", "cup"):             (205, 4, 45, 0.4),
    ("whole wheat roti", "piece"):       (120, 4, 22, 3),
    ("multigrain roti", "piece"):        (125, 5, 22, 3),
    ("multigrain bread", "slices"):      (90, 4, 16, 2),
    ("phulka roti", "piece"):            (90, 3, 18, 1),
    ("mixed greens", "cup"):             (8, 1, 1, 0),
    ("romaine lettuce", "cup"):          (8, 0.6, 1.5, 0),
    ("yellow split peas", "cup dry"):    (671, 47, 121, 2),
    ("white miso", "tbsp"):              (35, 2, 5, 1),
    ("dry parsley", "tsp"):              (1, 0.1, 0.2, 0),
    ("dried oregano", "tsp"):            (3, 0.1, 0.7, 0.1),
    ("italian seasoning", "tsp"):        (3, 0.1, 0.6, 0.1),
    ("garam masala", "tsp"):             (7, 0.3, 1.5, 0.3),
    ("amchur", "tsp"):                   (5, 0.2, 1, 0),
    ("amchur powder", "tsp"):            (5, 0.2, 1, 0),
    ("asafoetida", "pinch"):             (0, 0, 0, 0),
    ("asafoetida (hing)", "pinch"):      (0, 0, 0, 0),
    ("kashmiri red chili powder", "tsp"):(7, 0.3, 1.3, 0.4),
    ("red chili", "piece"):              (2, 0.1, 0.5, 0),
    ("dry red chili", "piece"):          (1, 0.05, 0.3, 0),
    ("dried red chilis", "piece"):       (1, 0.05, 0.3, 0),
    ("kalonji", "tsp"):                  (16, 0.6, 1.6, 1.2),
    ("kalonji (nigella seeds)", "tsp"):  (16, 0.6, 1.6, 1.2),
    ("nigella seeds", "tsp"):            (16, 0.6, 1.6, 1.2),
    ("hilsa fish", "g"):                 (3.1, 0.22, 0, 0.24),
    ("hilsa", "g"):                      (3.1, 0.22, 0, 0.24),
    ("methi leaves", "cup"):             (15, 1, 3, 0.2),
    ("kasuri methi", "tsp"):             (2, 0.1, 0.4, 0),
    ("kewra water", "tsp"):              (0, 0, 0, 0),
    ("rose water", "tsp"):               (0, 0, 0, 0),
    ("saffron", "pinch"):                (0.4, 0, 0.1, 0),
    ("saffron strands", "pinch"):        (0.4, 0, 0.1, 0),
    ("cardamom pods", "piece"):          (2, 0.1, 0.5, 0),
    ("cardamom", "tsp"):                 (6, 0.2, 1.4, 0.1),
    ("cloves", "piece"):                 (1, 0, 0.3, 0),
    ("cinnamon", "stick"):               (5, 0.1, 1.6, 0.1),
    ("cinnamon stick", "piece"):         (5, 0.1, 1.6, 0.1),
    ("cinnamon", "tsp"):                 (6, 0.1, 2.1, 0),
    ("fennel seeds", "tsp"):             (7, 0.3, 1, 0.3),
    ("anise", "tsp"):                    (7, 0.4, 1.1, 0.3),
    ("star anise", "piece"):             (4, 0.2, 0.7, 0.2),
    ("black salt", "pinch"):             (0, 0, 0, 0),
    ("black salt", "tsp"):               (0, 0, 0, 0),
    ("dijon mustard", "tsp"):            (5, 0.3, 0.4, 0.3),
    ("dijon mustard", "tbsp"):           (15, 1, 1.2, 1),
    ("worcestershire sauce", "tsp"):     (4, 0.1, 1, 0),
    ("fish sauce", "tsp"):               (3, 0.4, 0.4, 0),
    ("fish sauce", "tbsp"):              (10, 1.3, 1.3, 0),
    ("oyster sauce", "tbsp"):            (9, 0.2, 1.8, 0),
    ("hoisin sauce", "tbsp"):            (35, 0.6, 7, 0.6),
    ("dark soy sauce", "tbsp"):          (10, 1.3, 1, 0.1),
    ("chili flakes", "tsp"):             (6, 0.3, 1.2, 0.3),
    ("red pepper flakes", "tsp"):        (6, 0.3, 1.2, 0.3),
    ("crushed red pepper", "tsp"):       (6, 0.3, 1.2, 0.3),
    ("ginger", "tbsp"):                  (5, 0.1, 1, 0),
    ("grated ginger", "tsp"):            (2, 0.05, 0.4, 0),
    ("grated ginger", "tbsp"):           (5, 0.1, 1, 0),
    ("garlic powder", "tsp"):            (10, 0.5, 2.3, 0),
    ("onion powder", "tsp"):             (8, 0.2, 1.9, 0),
    ("smoked paprika", "tsp"):           (6, 0.3, 1.2, 0.3),
    ("white pepper", "tsp"):             (7, 0.3, 1.6, 0.1),
    ("cayenne pepper", "tsp"):           (6, 0.2, 1, 0.3),
    ("chili powder", "tsp"):             (8, 0.3, 1.4, 0.4),
    ("nutmeg", "tsp"):                   (12, 0.1, 1.1, 0.8),
    ("vanilla extract", "tsp"):          (12, 0, 0.5, 0),
    ("baking powder", "tsp"):            (2, 0, 0.4, 0),
    ("baking soda", "tsp"):              (0, 0, 0, 0),
    ("yeast", "tsp"):                    (8, 1, 1, 0),
    # weight-based for things we'd want to scale
    ("chicken breast", "oz"):            (47, 9, 0, 1),
    ("chicken thigh", "oz"):             (68, 6, 0, 5),
    ("salmon", "oz"):                    (58, 6, 0, 4),
    ("beef", "oz"):                      (71, 7, 0, 5),
    ("pork", "oz"):                      (69, 6, 0, 5),
    # Cooked legumes (cup is more common in recipes)
    ("dal", "cup cooked"):               (230, 18, 39, 1),
    ("cooked black beans", "cup"):       (220, 14, 40, 1),
    ("cooked chickpeas", "cup"):         (270, 14, 45, 4),
    # Pancake/dosa-style
    ("idli batter", "cup"):              (180, 7, 35, 1),
    ("dosa batter", "cup"):              (200, 7, 38, 2),
    # Snacks / sweets
    ("dates", "piece"):                  (66, 0.4, 18, 0),
    ("raisins", "tbsp"):                 (25, 0.3, 7, 0),
    ("apple", "medium"):                 (95, 0.5, 25, 0.3),
    ("strawberries", "cup"):             (50, 1, 12, 0.5),
    ("mixed berries", "cup"):            (70, 1, 18, 0.4),
    ("blueberries", "cup"):              (85, 1, 21, 0.5),
    ("mango", "cup"):                    (100, 1, 25, 0.6),
    ("pineapple", "cup"):                (82, 1, 22, 0.2),
    # Bones / aromatics (negligible)
    ("water", "cup"):                    (0, 0, 0, 0),
    ("water", "tbsp"):                   (0, 0, 0, 0),
    ("ice", "cup"):                      (0, 0, 0, 0),
    # Greek / Mediterranean
    ("kalamata olives", "tbsp"):         (25, 0.2, 1.4, 2.3),
    ("dijon", "tsp"):                    (5, 0.3, 0.4, 0.3),
    # Indian sweets / dairy
    ("paneer (crumbled)", "g"):          (2.65, 0.18, 0.01, 0.21),
    ("cottage cheese (low-fat)", "g"):   (0.72, 0.12, 0.03, 0.01),
    ("condensed milk", "tbsp"):          (62, 1.5, 10.5, 1.7),
}


def _norm(s: str) -> str:
    """Normalize: lowercase, strip parens content, drop common prep words."""
    import re
    if not s:
        return ""
    s = s.lower().strip()
    # Drop parenthetical content (e.g., "Onion (finely chopped)")
    s = re.sub(r"\(.*?\)", "", s).strip()
    # Drop common preparation prefixes/suffixes (NOT "fresh" — keep it for DB lookups)
    prep_words = [
        "finely ", "roughly ", "coarsely ", "thinly ", "thickly ",
        "freshly ", "dried ",
        "diced ", "chopped ", "minced ", "grated ", "shredded ",
        "sliced ", "julienned ", "crushed ",
        "boiled ", "steamed ", "roasted ", "grilled ", "cooked ",
        "halved ",
    ]
    for w in prep_words:
        if s.startswith(w):
            s = s[len(w):]
    # Drop trailing prep words
    for w in [" diced", " chopped", " minced", " grated", " shredded",
              " sliced", " julienned", " crushed", " ground", " halved"]:
        if s.endswith(w):
            s = s[:-len(w)]
    return s.strip()


def _norm_unit(u: str) -> str:
    """Normalize unit. Lowercase, strip whitespace, map common variations."""
    if not u:
        return ""
    u = u.lower().strip()
    aliases = {
        "tbsp.": "tbsp", "tablespoon": "tbsp", "tablespoons": "tbsp",
        "tsp.": "tsp", "teaspoon": "tsp", "teaspoons": "tsp",
        "cups": "cup", "c.": "cup",
        "ozs": "oz", "ounce": "oz", "ounces": "oz",
        "grams": "g", "gram": "g", "gm": "g",
        "kilograms": "kg", "kgs": "kg",
        "lbs": "lb", "pound": "lb", "pounds": "lb",
        "ml": "ml", "mls": "ml",
        "piece": "piece", "pieces": "piece", "pc": "piece",
        "leaf": "leaves", "leafs": "leaves",
        "clove": "cloves",
        "slice": "slices",
        "stalk": "stalks",
        "wedges": "wedge",
    }
    return aliases.get(u, u)


def _parse_amount(amt: str) -> float:
    """Convert '1', '1/2', '1 1/2', '2.5', '5K' to a number."""
    if not amt:
        return 0.0
    amt = amt.strip()
    # Handle "K" suffix (1K → 1000)
    if amt.lower().endswith("k"):
        try:
            return float(amt[:-1]) * 1000
        except ValueError:
            return 0.0
    # Mixed: "1 1/2"
    import re
    m = re.match(r"^(\d+)\s+(\d+)/(\d+)$", amt)
    if m:
        return int(m.group(1)) + int(m.group(2)) / int(m.group(3))
    # Fraction: "1/2"
    m = re.match(r"^(\d+)/(\d+)$", amt)
    if m:
        return int(m.group(1)) / int(m.group(2))
    # Decimal or int
    try:
        return float(amt)
    except ValueError:
        return 0.0


def lookup(name: str, amount: str, unit: str) -> tuple[float, float, float, float] | None:
    """Returns (calories, protein_g, carbs_g, fat_g) for the ingredient × amount,
    or None if not in the database."""
    nm = _norm(name)
    un = _norm_unit(unit)
    qty = _parse_amount(amount)

    # 1. Exact match
    if (nm, un) in NUTRITION_DB:
        base = NUTRITION_DB[(nm, un)]
        return tuple(round(v * qty, 1) for v in base)

    # 2. Singular/plural noun + same unit
    candidates = []
    if nm.endswith("s"):
        candidates.append(nm[:-1])
    else:
        candidates.append(nm + "s")
    for cn in candidates:
        if (cn, un) in NUTRITION_DB:
            base = NUTRITION_DB[(cn, un)]
            return tuple(round(v * qty, 1) for v in base)

    # 3. Same noun, any unit that's "close enough" (size variations)
    SIZE_FALLBACKS = ["medium", "large", "small", "whole"]
    if un in SIZE_FALLBACKS or un == "" or un == "piece":
        for u2 in SIZE_FALLBACKS:
            if (nm, u2) in NUTRITION_DB:
                base = NUTRITION_DB[(nm, u2)]
                return tuple(round(v * qty, 1) for v in base)

    # 4. Cup variants (cup, cup cooked, cup dry)
    if un.startswith("cup"):
        for u2 in ("cup", "cup cooked", "cup dry"):
            if (nm, u2) in NUTRITION_DB:
                base = NUTRITION_DB[(nm, u2)]
                return tuple(round(v * qty, 1) for v in base)

    return None


def compute_meal(meal: dict) -> dict:
    """Compute total macros for a meal from its recipe.ingredients using our DB.
    Returns: {calories, protein_g, carbs_g, fat_g, resolved_pct, unresolved}"""
    ingredients = meal.get("recipe", {}).get("ingredients", [])
    if not ingredients:
        return {"calories": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0, "resolved_pct": 0, "unresolved": []}

    total = [0.0, 0.0, 0.0, 0.0]
    resolved = 0
    unresolved = []

    for ing in ingredients:
        name = ing.get("name", "")
        amount = ing.get("amount", "")
        unit = ing.get("unit", "")
        if not name or amount.lower() in ("to taste", ""):
            continue
        result = lookup(name, amount, unit)
        if result:
            for i in range(4):
                total[i] += result[i]
            resolved += 1
        else:
            unresolved.append(f"{amount} {unit} {name}".strip())

    pct = (resolved / len(ingredients) * 100) if ingredients else 0
    servings = meal.get("servings", 1) or 1
    return {
        "calories": round(total[0] / servings),
        "protein_g": round(total[1] / servings),
        "carbs_g": round(total[2] / servings),
        "fat_g": round(total[3] / servings),
        "resolved_pct": round(pct),
        "unresolved": unresolved,
    }
