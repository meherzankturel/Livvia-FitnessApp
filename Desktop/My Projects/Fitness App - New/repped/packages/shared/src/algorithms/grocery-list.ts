export interface GroceryItem {
  name: string;
  amount: string;
  unit: string;
  category: string;
  checked: boolean;
  estimatedPrice?: number;
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

const PRICE_ESTIMATES: Record<string, number> = {
  produce: 3.50,
  protein: 8.00,
  dairy: 4.50,
  grains: 3.00,
  pantry: 4.00,
  frozen: 5.00,
  other: 3.50,
};

/** Scale recipe quantities to realistic grocery store amounts */
function scaleToGroceryAmount(amount: string, unit: string, name: string): { amount: string; unit: string } {
  const num = parseFloat(amount) || 1;

  const lowerName = name.toLowerCase();

  // Grains/rice/pasta: round up to nearest 500g or 1kg
  if (lowerName.includes("rice") || lowerName.includes("pasta") || lowerName.includes("oats")) {
    if (unit === "cup" || unit === "cups") {
      const grams = num * 185; // ~185g per cup of dry rice
      const kg = Math.ceil(grams / 500) * 0.5;
      return { amount: String(kg), unit: "kg" };
    }
  }

  // Milk/liquid: round up to nearest liter
  if (lowerName.includes("milk") || lowerName.includes("almond milk")) {
    if (unit === "cup" || unit === "cups") {
      const liters = Math.ceil(num * 0.24); // 1 cup = ~240ml
      return { amount: String(Math.max(1, liters)), unit: "L" };
    }
  }

  // Protein (chicken, beef, fish): round up to nearest 500g
  if (lowerName.includes("chicken") || lowerName.includes("beef") || lowerName.includes("salmon") || lowerName.includes("fish") || lowerName.includes("turkey")) {
    if (unit === "g" || unit === "grams") {
      const scaled = Math.ceil(num / 500) * 500;
      return { amount: String(scaled), unit: "g" };
    }
    if (unit === "breast" || unit === "breasts" || unit === "fillet" || unit === "fillets") {
      return { amount: String(Math.max(2, num)), unit: unit };
    }
  }

  // Eggs: round up to nearest half-dozen
  if (lowerName.includes("egg")) {
    const dozens = Math.ceil(num / 6) * 6;
    return { amount: String(Math.max(6, dozens)), unit: "pcs" };
  }

  // Vegetables: reasonable minimums
  if (unit === "cup" || unit === "cups") {
    if (lowerName.includes("spinach") || lowerName.includes("kale") || lowerName.includes("lettuce")) {
      return { amount: "1", unit: "bag" };
    }
    if (lowerName.includes("broccoli") || lowerName.includes("cauliflower")) {
      return { amount: "1", unit: "head" };
    }
  }

  // Fruits: convert to whole pieces
  if (lowerName.includes("avocado")) {
    // Any measurement → round to whole avocados (7 slices ≈ 1 avocado)
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
    return { amount: "1", unit: "pack (400g)" };
  }

  // Common cooking measurements → practical amounts
  if (unit === "tbsp" || unit === "tablespoon" || unit === "tablespoons") {
    // Spices/sauces: just need 1 bottle
    if (lowerName.includes("oil") || lowerName.includes("sauce") || lowerName.includes("vinegar") || lowerName.includes("honey") || lowerName.includes("syrup")) {
      return { amount: "1", unit: "bottle" };
    }
    return { amount: String(Math.ceil(num)), unit: "tbsp" };
  }

  if (unit === "tsp" || unit === "teaspoon" || unit === "teaspoons") {
    // Spices: just need 1 jar
    return { amount: "1", unit: "jar" };
  }

  if (unit === "clove" || unit === "cloves") {
    // Garlic: 1 head
    return { amount: "1", unit: "head" };
  }

  // Sliced/chopped/diced → convert to whole items
  if (unit === "sliced" || unit === "chopped" || unit === "diced" || unit === "minced") {
    return { amount: String(Math.max(2, Math.ceil(num / 4))), unit: "pcs" };
  }

  // For items measured in "piece" or "whole", ensure minimum of 2-3
  if (unit === "" || unit === "piece" || unit === "whole" || unit === "medium" || unit === "large") {
    return { amount: String(Math.max(2, Math.ceil(num))), unit: "pcs" };
  }

  return { amount: String(Math.ceil(num)), unit };
}

/**
 * Aggregate ingredients from multiple meals into a grocery list, grouped by category.
 * Combines duplicate items by summing amounts where possible.
 */
export function generateGroceryList(meals: MealWithRecipe[]): GroceryList {
  const itemMap = new Map<string, GroceryItem>();

  for (const meal of meals) {
    if (!meal.recipe?.ingredients) continue;

    for (const ing of meal.recipe.ingredients) {
      const key = `${ing.name.toLowerCase()}_${ing.unit}`;

      if (itemMap.has(key)) {
        const existing = itemMap.get(key)!;
        // Try to sum amounts if they're numeric
        const existingAmt = parseFloat(existing.amount);
        const newAmt = parseFloat(ing.amount);
        if (!isNaN(existingAmt) && !isNaN(newAmt)) {
          existing.amount = String(Math.round((existingAmt + newAmt) * 10) / 10);
        } else {
          existing.amount = `${existing.amount} + ${ing.amount}`;
        }
      } else {
        itemMap.set(key, {
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          category: ing.category || "other",
          checked: false,
        });
      }
    }
  }

  // Scale quantities to realistic grocery amounts and estimate prices
  const scaledItems = Array.from(itemMap.values()).map((item) => {
    const scaled = scaleToGroceryAmount(item.amount, item.unit, item.name);
    return {
      ...item,
      amount: scaled.amount,
      unit: scaled.unit,
      estimatedPrice: PRICE_ESTIMATES[item.category] ?? PRICE_ESTIMATES.other,
    };
  });

  const items = scaledItems.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.name.localeCompare(b.name);
  });

  const categories = [...new Set(items.map((i) => i.category))];

  return { items, categories };
}
