export interface GroceryItem {
  name: string;
  amount: string;
  unit: string;
  category: string;
  checked: boolean;
}

export interface GroceryList {
  items: GroceryItem[];
  categories: string[];
}

interface MealWithRecipe {
  recipe?: {
    ingredients: { name: string; amount: string; unit: string; category: string }[];
  };
}

// ─── Unit Normalization ─────────────────────────────────────────────────────────
// Convert known items to canonical units BEFORE aggregation so
// "2 cups rice" + "500g rice" merge into one entry.

// Items where we can convert cups to grams (dry goods)
const CUPS_TO_GRAMS: Record<string, number> = {
  rice: 185, oats: 81, "rolled oats": 81, pasta: 105,
  flour: 125, quinoa: 170, lentils: 192, sugar: 200,
};

/**
 * Extract the base unit from compound units like "cup shredded" → "cup",
 * "oz sliced" → "oz", "cups chopped" → "cups", "cup (dry)" → "cup".
 * Recipe units often have modifiers appended — we need just the measurement.
 */
function extractBaseUnit(unit: string): string {
  const lower = unit.toLowerCase().trim();

  // Handle parenthetical: "can (5oz)" → "can", "cup (dry)" → "cup", "whole (use half)" → "whole"
  const parenMatch = lower.match(/^(\w+)\s*\(/);
  if (parenMatch) return parenMatch[1];

  // Handle modifier suffixes: "cup shredded" → "cup", "oz sliced" → "oz"
  const baseMatch = lower.match(/^(cups?|oz|tbsp|tsp|g|kg|ml|l|large|medium|small|slices?|strips?|pieces?|cloves?|whole|block|can|bag|head|bunch|sprig|stalk|leaves?|handful|scoop|cubes?)\b/);
  if (baseMatch) return baseMatch[1];

  return lower;
}

/** Normalize an ingredient's amount/unit to a canonical form for aggregation. */
function normalizeIngredient(
  name: string,
  amount: string,
  unit: string
): { amount: number; unit: string } {
  const num = parseFloat(amount) || 1;
  const lower = name.toLowerCase();
  const baseUnit = extractBaseUnit(unit);

  // cups → grams for known dry goods
  if (baseUnit === "cup" || baseUnit === "cups") {
    for (const [item, gramsPerCup] of Object.entries(CUPS_TO_GRAMS)) {
      if (lower.includes(item)) {
        return { amount: Math.round(num * gramsPerCup), unit: "g" };
      }
    }
    // Liquids: cups → ml
    if (lower.includes("milk") || lower.includes("water") || lower.includes("broth") || lower.includes("stock") || lower.includes("yogurt")) {
      return { amount: Math.round(num * 240), unit: "ml" };
    }
  }

  // Weight normalization
  if (baseUnit === "kg") return { amount: Math.round(num * 1000), unit: "g" };
  if (baseUnit === "g" || unit.toLowerCase() === "grams") return { amount: num, unit: "g" };
  if (baseUnit === "oz") return { amount: Math.round(num * 28.35), unit: "g" };
  if (baseUnit === "l") return { amount: Math.round(num * 1000), unit: "ml" };
  if (baseUnit === "ml") return { amount: num, unit: "ml" };

  // Standardize count-based units to their base form
  if (baseUnit === "large" || baseUnit === "medium" || baseUnit === "small" || baseUnit === "whole") {
    return { amount: num, unit: "pcs" };
  }
  if (baseUnit === "slice" || baseUnit === "slices") return { amount: num, unit: "slices" };
  if (baseUnit === "strip" || baseUnit === "strips") return { amount: num, unit: "strips" };
  if (baseUnit === "clove" || baseUnit === "cloves") return { amount: num, unit: "cloves" };
  if (baseUnit === "can") return { amount: num, unit: "can" };
  if (baseUnit === "block") return { amount: num, unit: "block" };
  if (baseUnit === "scoop") return { amount: num, unit: "scoop" };
  if (baseUnit === "handful") return { amount: num, unit: "handful" };
  if (baseUnit === "sprig" || baseUnit === "bunch") return { amount: num, unit: "bunch" };
  if (baseUnit === "stalk") return { amount: num, unit: "stalk" };
  if (baseUnit === "leaf" || baseUnit === "leaves") return { amount: num, unit: "pcs" };

  return { amount: num, unit: baseUnit };
}

// ─── Pantry Staples ─────────────────────────────────────────────────────────────

/** Default staples most people always have — suggested during pantry setup. */
export const DEFAULT_PANTRY_STAPLES = [
  "Salt", "Black pepper", "Olive oil", "Cooking spray",
  "Cinnamon", "Red pepper flakes", "Garlic powder", "Onion powder",
  "Soy sauce", "Vinegar", "Sugar", "Cumin",
];

// ─── Grocery Amount Scaling ─────────────────────────────────────────────────────

/** Scale aggregated quantities to realistic grocery store purchase amounts.
 * Converts recipe-level units (cups, tbsp, handful) to store-purchase units
 * (kg, bags, packs, bottles, jars, pcs). Users should NEVER see recipe units
 * on their grocery list. */
function scaleToGroceryAmount(amount: string, unit: string, name: string): { amount: string; unit: string } {
  const num = parseFloat(amount) || 1;
  const lowerName = name.toLowerCase();

  // Grains/rice/pasta in grams → round up to nearest 500g
  if (lowerName.includes("rice") || lowerName.includes("pasta") || lowerName.includes("oats") || lowerName.includes("quinoa") || lowerName.includes("lentils")) {
    if (unit === "g") {
      const scaled = Math.ceil(num / 500) * 500;
      return { amount: String(scaled >= 1000 ? scaled / 1000 : scaled), unit: scaled >= 1000 ? "kg" : "g" };
    }
    if (unit === "cup" || unit === "cups") {
      const grams = num * 185;
      const kg = Math.ceil(grams / 500) * 0.5;
      return { amount: String(kg), unit: "kg" };
    }
  }

  // Milk/liquid in ml → round up to nearest liter
  if (lowerName.includes("milk") || lowerName.includes("almond milk")) {
    if (unit === "ml") {
      const liters = Math.max(1, Math.ceil(num / 1000));
      return { amount: String(liters), unit: "L" };
    }
    if (unit === "cup" || unit === "cups") {
      const liters = Math.ceil(num * 0.24);
      return { amount: String(Math.max(1, liters)), unit: "L" };
    }
  }

  // Protein (chicken, beef, fish): round up to nearest 500g
  if (lowerName.includes("chicken") || lowerName.includes("beef") || lowerName.includes("salmon") || lowerName.includes("fish") || lowerName.includes("turkey") || lowerName.includes("lamb") || lowerName.includes("shrimp")) {
    if (unit === "g" || unit === "grams") {
      const scaled = Math.ceil(num / 500) * 500;
      return { amount: String(scaled), unit: "g" };
    }
    if (unit === "breast" || unit === "breasts" || unit === "fillet" || unit === "fillets") {
      return { amount: String(Math.max(2, Math.ceil(num))), unit: unit };
    }
  }

  // Eggs: round up to nearest half-dozen
  if (lowerName.includes("egg")) {
    const rounded = Math.ceil(num / 6) * 6;
    return { amount: String(Math.max(6, rounded)), unit: "pcs" };
  }

  // Vegetables: reasonable minimums
  if (unit === "cup" || unit === "cups" || unit === "g") {
    if (lowerName.includes("spinach") || lowerName.includes("kale") || lowerName.includes("lettuce")) {
      return { amount: String(Math.max(1, Math.ceil(num / 150))), unit: "bag" };
    }
    if (lowerName.includes("broccoli") || lowerName.includes("cauliflower")) {
      return { amount: String(Math.max(1, Math.ceil(num / 300))), unit: "head" };
    }
  }

  // Fruits: convert to whole pieces
  if (lowerName.includes("avocado")) {
    if (unit === "sliced" || unit === "slices") {
      return { amount: String(Math.max(2, Math.ceil(num / 7))), unit: "pcs" };
    }
    return { amount: String(Math.max(2, Math.ceil(num))), unit: "pcs" };
  }

  if (lowerName.includes("banana")) {
    return { amount: String(Math.max(3, Math.ceil(num))), unit: "pcs" };
  }

  if (lowerName.includes("apple") || lowerName.includes("orange") || lowerName.includes("lemon") || lowerName.includes("lime")) {
    return { amount: String(Math.max(3, Math.ceil(num))), unit: "pcs" };
  }

  if (lowerName.includes("berries") || lowerName.includes("blueberr") || lowerName.includes("strawberr") || lowerName.includes("raspberr")) {
    return { amount: String(Math.max(1, Math.ceil(num / 400))), unit: "pack (400g)" };
  }

  // Common cooking measurements → practical store amounts
  if (unit === "tbsp" || unit === "tablespoon" || unit === "tablespoons") {
    if (lowerName.includes("oil") || lowerName.includes("sauce") || lowerName.includes("vinegar") || lowerName.includes("honey") || lowerName.includes("syrup") || lowerName.includes("dressing") || lowerName.includes("mustard") || lowerName.includes("sriracha")) {
      return { amount: "1", unit: "bottle" };
    }
    if (lowerName.includes("butter") || lowerName.includes("cheese") || lowerName.includes("yogurt") || lowerName.includes("cream")) {
      return { amount: "1", unit: "pack" };
    }
    if (lowerName.includes("chia") || lowerName.includes("seed") || lowerName.includes("yeast")) {
      return { amount: "1", unit: "pack" };
    }
    return { amount: "1", unit: "pack" };
  }

  if (unit === "tsp" || unit === "teaspoon" || unit === "teaspoons") {
    if (lowerName.includes("oil") || lowerName.includes("ghee")) {
      return { amount: "1", unit: "bottle" };
    }
    return { amount: "1", unit: "jar" };
  }

  if (unit === "cloves") {
    return { amount: "1", unit: "head" };
  }

  // Tofu: keep as blocks
  if (unit === "block" && lowerName.includes("tofu")) {
    return { amount: String(Math.max(1, Math.ceil(num))), unit: "block" };
  }

  // Protein powder: convert scoops to tubs
  if (unit === "scoop" && lowerName.includes("protein")) {
    const tubs = Math.max(1, Math.ceil(num / 30)); // ~30 scoops per tub
    return { amount: String(tubs), unit: "tub" };
  }

  // Canned goods: keep as cans
  if (unit === "can") {
    return { amount: String(Math.max(1, Math.ceil(num))), unit: "can" };
  }

  // Fresh herbs: convert sprigs/stalks to bunches
  if (unit === "bunch" || unit === "sprig") {
    return { amount: "1", unit: "bunch" };
  }
  if (unit === "stalk") {
    return { amount: String(Math.max(2, Math.ceil(num))), unit: "stalks" };
  }

  // Handful → bags for greens/produce
  if (unit === "handful") {
    return { amount: "1", unit: "bag" };
  }

  // Bread/baked: slices → loaf
  if (unit === "slices") {
    if (lowerName.includes("bread") || lowerName.includes("toast")) {
      return { amount: "1", unit: "loaf" };
    }
    return { amount: String(Math.max(1, Math.ceil(num))), unit: "pcs" };
  }

  // Strips (bacon etc) → packs
  if (unit === "strips") {
    return { amount: "1", unit: "pack" };
  }

  // Items everyone has — skip from grocery list
  if (lowerName === "water" || lowerName === "ice cubes" || lowerName === "ice") {
    return { amount: "0", unit: "skip" };
  }

  // For items measured in "piece", "whole", "medium", "large", "pcs"
  if (unit === "" || unit === "piece" || unit === "pieces" || unit === "whole" || unit === "medium" || unit === "large" || unit === "small" || unit === "pcs") {
    return { amount: String(Math.max(2, Math.ceil(num))), unit: "pcs" };
  }

  // Fallback: round up and keep unit
  return { amount: String(Math.ceil(num)), unit };
}

// ─── Main Generator ─────────────────────────────────────────────────────────────

/**
 * Aggregate ingredients from multiple meals into a grocery list, grouped by category.
 * Combines duplicate items by summing amounts (with unit normalization),
 * filters out pantry staples, and estimates per-item prices.
 */
export function generateGroceryList(
  meals: MealWithRecipe[],
  pantryStaples: string[] = []
): GroceryList {
  // Build pantry exclusion set
  const stapleSet = new Set(pantryStaples.map((s) => s.toLowerCase()));

  // Aggregate ingredients with normalized units
  const itemMap = new Map<string, { name: string; amount: number; unit: string; category: string }>();

  for (const meal of meals) {
    if (!meal.recipe?.ingredients) continue;

    for (const ing of meal.recipe.ingredients) {
      // Normalize units for consistent aggregation
      const normalized = normalizeIngredient(ing.name, ing.amount, ing.unit);
      const key = `${ing.name.toLowerCase()}_${normalized.unit}`;

      if (itemMap.has(key)) {
        const existing = itemMap.get(key)!;
        existing.amount += normalized.amount;
      } else {
        itemMap.set(key, {
          name: ing.name,
          amount: normalized.amount,
          unit: normalized.unit,
          category: ing.category || "other",
        });
      }
    }
  }

  // Scale to grocery amounts, estimate prices, filter pantry staples
  const scaledItems: GroceryItem[] = [];

  for (const item of itemMap.values()) {
    // Skip pantry staples
    if (stapleSet.has(item.name.toLowerCase())) continue;

    const scaled = scaleToGroceryAmount(String(item.amount), item.unit, item.name);

    // Skip items marked for removal (e.g., ice cubes)
    if (scaled.unit === "skip") continue;

    scaledItems.push({
      name: item.name,
      amount: scaled.amount,
      unit: scaled.unit,
      category: item.category,
      checked: false,
    });
  }

  const items = scaledItems.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.name.localeCompare(b.name);
  });

  const categories = [...new Set(items.map((i) => i.category))];

  return { items, categories };
}
