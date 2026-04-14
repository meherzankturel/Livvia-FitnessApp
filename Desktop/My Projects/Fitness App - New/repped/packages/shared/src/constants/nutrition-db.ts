/**
 * Nutritional database for common Indian and Western ingredients.
 * Values per standard unit (as specified in recipes).
 *
 * Sources:
 * - USDA FoodData Central (fdc.nal.usda.gov)
 * - Indian Food Composition Tables (IFCT 2017, NIN Hyderabad)
 * - Nutritionix verified data
 *
 * All values are per the listed amount and unit.
 */

export interface NutrientData {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

/**
 * Nutrition lookup by ingredient name (lowercase).
 * Values are PER STANDARD SERVING as typically used in recipes.
 */
export const INGREDIENT_NUTRITION: Record<string, NutrientData & { per: string }> = {
  // ─── GRAINS & CEREALS ───
  "brown rice": { calories: 215, protein_g: 5, carbs_g: 45, fat_g: 1.8, per: "1 cup cooked" },
  "white rice": { calories: 205, protein_g: 4.3, carbs_g: 45, fat_g: 0.4, per: "1 cup cooked" },
  "steamed rice": { calories: 205, protein_g: 4.3, carbs_g: 45, fat_g: 0.4, per: "1 cup cooked" },
  "whole wheat flour": { calories: 340, protein_g: 13, carbs_g: 72, fat_g: 2.5, per: "1 cup" },
  "whole wheat roti": { calories: 120, protein_g: 3.5, carbs_g: 20, fat_g: 3.5, per: "1 piece" },
  "multigrain roti": { calories: 120, protein_g: 4, carbs_g: 20, fat_g: 3.5, per: "1 piece" },
  "multigrain toast": { calories: 80, protein_g: 4, carbs_g: 14, fat_g: 1, per: "1 slice" },
  "oats": { calories: 307, protein_g: 11, carbs_g: 55, fat_g: 5, per: "1 cup dry" },
  "semolina": { calories: 300, protein_g: 10, carbs_g: 60, fat_g: 1, per: "1 cup" },
  "besan": { calories: 356, protein_g: 22, carbs_g: 53, fat_g: 6, per: "1 cup" },
  "rice flour": { calories: 366, protein_g: 6, carbs_g: 80, fat_g: 1.4, per: "1 cup" },
  "poha": { calories: 264, protein_g: 5, carbs_g: 58, fat_g: 1, per: "1.5 cups" },
  "dalia": { calories: 160, protein_g: 6, carbs_g: 32, fat_g: 1, per: "1/2 cup dry" },
  "pav bread": { calories: 140, protein_g: 4, carbs_g: 26, fat_g: 2, per: "2 pieces" },
  "ragi flour": { calories: 328, protein_g: 7.3, carbs_g: 72, fat_g: 1.3, per: "1 cup" },
  "maida": { calories: 360, protein_g: 10, carbs_g: 76, fat_g: 1, per: "1 cup" },
  "quinoa": { calories: 222, protein_g: 8, carbs_g: 39, fat_g: 3.5, per: "1 cup cooked" },
  "pasta": { calories: 220, protein_g: 8, carbs_g: 43, fat_g: 1.3, per: "1 cup cooked" },

  // ─── LENTILS & LEGUMES ───
  "toor dal": { calories: 198, protein_g: 13, carbs_g: 34, fat_g: 1.5, per: "1/2 cup dry" },
  "moong dal": { calories: 180, protein_g: 14, carbs_g: 30, fat_g: 0.6, per: "1/2 cup dry" },
  "masoor dal": { calories: 170, protein_g: 12, carbs_g: 30, fat_g: 0.5, per: "1/2 cup dry" },
  "chana dal": { calories: 200, protein_g: 13, carbs_g: 33, fat_g: 2.5, per: "1/2 cup dry" },
  "green moong dal": { calories: 180, protein_g: 14, carbs_g: 30, fat_g: 0.6, per: "1 cup soaked" },
  "rajma": { calories: 225, protein_g: 15, carbs_g: 40, fat_g: 0.8, per: "1 cup cooked" },
  "chole": { calories: 269, protein_g: 15, carbs_g: 45, fat_g: 4, per: "1 cup cooked" },
  "sprouted moth beans": { calories: 210, protein_g: 14, carbs_g: 36, fat_g: 1, per: "1 cup" },
  "sprouted moong": { calories: 31, protein_g: 3, carbs_g: 6, fat_g: 0.2, per: "1/4 cup" },

  // ─── DAIRY ───
  "paneer": { calories: 265, protein_g: 18, carbs_g: 4, fat_g: 20, per: "100g" },
  "yogurt": { calories: 60, protein_g: 3.5, carbs_g: 5, fat_g: 3, per: "1/2 cup" },
  "greek yogurt": { calories: 100, protein_g: 17, carbs_g: 6, fat_g: 0.7, per: "1 cup" },
  "buttermilk": { calories: 40, protein_g: 3, carbs_g: 5, fat_g: 1, per: "1 cup" },
  "ghee": { calories: 45, protein_g: 0, carbs_g: 0, fat_g: 5, per: "1 tsp" },
  "butter": { calories: 36, protein_g: 0, carbs_g: 0, fat_g: 4, per: "1 tsp" },
  "milk": { calories: 150, protein_g: 8, carbs_g: 12, fat_g: 8, per: "1 cup" },
  "cottage cheese": { calories: 220, protein_g: 25, carbs_g: 8, fat_g: 10, per: "1 cup" },

  // ─── PROTEIN (NON-VEG) ───
  "chicken breast": { calories: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6, per: "100g cooked" },
  "chicken thigh": { calories: 209, protein_g: 26, carbs_g: 0, fat_g: 11, per: "100g cooked" },
  "eggs": { calories: 72, protein_g: 6.3, carbs_g: 0.4, fat_g: 5, per: "1 large" },
  "white fish": { calories: 90, protein_g: 20, carbs_g: 0, fat_g: 1, per: "100g" },
  "salmon": { calories: 208, protein_g: 20, carbs_g: 0, fat_g: 13, per: "100g" },
  "rohu fish": { calories: 97, protein_g: 17, carbs_g: 0, fat_g: 3, per: "100g" },
  "hilsa fish": { calories: 273, protein_g: 22, carbs_g: 0, fat_g: 20, per: "200g" },
  "small fish": { calories: 100, protein_g: 18, carbs_g: 0, fat_g: 3, per: "100g" },

  // ─── VEGETABLES ───
  "potato": { calories: 130, protein_g: 3, carbs_g: 30, fat_g: 0.2, per: "1 medium" },
  "onion": { calories: 44, protein_g: 1.2, carbs_g: 10, fat_g: 0.1, per: "1 medium" },
  "tomato": { calories: 22, protein_g: 1, carbs_g: 5, fat_g: 0.2, per: "1 medium" },
  "spinach": { calories: 7, protein_g: 0.9, carbs_g: 1, fat_g: 0.1, per: "1 cup raw" },
  "broccoli": { calories: 55, protein_g: 3.7, carbs_g: 11, fat_g: 0.6, per: "1 cup" },
  "eggplant": { calories: 35, protein_g: 1, carbs_g: 9, fat_g: 0.2, per: "1 cup" },
  "cauliflower": { calories: 25, protein_g: 2, carbs_g: 5, fat_g: 0.1, per: "1 cup" },
  "peas": { calories: 62, protein_g: 4, carbs_g: 11, fat_g: 0.3, per: "1/2 cup" },
  "capsicum": { calories: 30, protein_g: 1, carbs_g: 7, fat_g: 0.3, per: "1 medium" },
  "sweet potato": { calories: 103, protein_g: 2, carbs_g: 24, fat_g: 0.1, per: "1 medium" },
  "cucumber": { calories: 16, protein_g: 0.7, carbs_g: 4, fat_g: 0.1, per: "1/2 medium" },

  // ─── NUTS & SEEDS ───
  "peanuts": { calories: 85, protein_g: 3.5, carbs_g: 3, fat_g: 7, per: "2 tbsp" },
  "cashews": { calories: 94, protein_g: 2.5, carbs_g: 5, fat_g: 7.5, per: "10 pieces" },
  "almonds": { calories: 80, protein_g: 3, carbs_g: 3, fat_g: 7, per: "10 pieces" },
  "poppy seeds": { calories: 92, protein_g: 3, carbs_g: 5, fat_g: 7, per: "2 tbsp" },
  "mustard seeds": { calories: 18, protein_g: 1, carbs_g: 1, fat_g: 1, per: "1/2 tsp" },
  "sesame seeds": { calories: 52, protein_g: 2, carbs_g: 2, fat_g: 4.5, per: "1 tbsp" },
  "coconut grated": { calories: 70, protein_g: 0.7, carbs_g: 3, fat_g: 6.5, per: "2 tbsp" },
  "coconut milk": { calories: 115, protein_g: 1, carbs_g: 2, fat_g: 12, per: "1/2 cup" },
  "mixed nuts": { calories: 170, protein_g: 5, carbs_g: 7, fat_g: 15, per: "1 oz" },

  // ─── OILS & FATS ───
  "oil": { calories: 40, protein_g: 0, carbs_g: 0, fat_g: 4.5, per: "1 tsp" },
  "mustard oil": { calories: 40, protein_g: 0, carbs_g: 0, fat_g: 4.5, per: "1 tsp" },
  "olive oil": { calories: 40, protein_g: 0, carbs_g: 0, fat_g: 4.5, per: "1 tsp" },

  // ─── FRUITS ───
  "banana": { calories: 105, protein_g: 1.3, carbs_g: 27, fat_g: 0.4, per: "1 medium" },
  "apple": { calories: 95, protein_g: 0.5, carbs_g: 25, fat_g: 0.3, per: "1 medium" },
  "mixed berries": { calories: 70, protein_g: 1, carbs_g: 17, fat_g: 0.5, per: "1 cup" },
  "mango": { calories: 99, protein_g: 1.4, carbs_g: 25, fat_g: 0.6, per: "1 cup" },
  "puffed rice": { calories: 110, protein_g: 2, carbs_g: 25, fat_g: 0.3, per: "2 cups" },

  // ─── SWEETENERS & MISC ───
  "jaggery": { calories: 20, protein_g: 0, carbs_g: 5, fat_g: 0, per: "1 tsp" },
  "sugar": { calories: 16, protein_g: 0, carbs_g: 4, fat_g: 0, per: "1 tsp" },
  "honey": { calories: 21, protein_g: 0, carbs_g: 6, fat_g: 0, per: "1 tsp" },
  "peanut butter": { calories: 95, protein_g: 3.5, carbs_g: 3.5, fat_g: 8, per: "1 tbsp" },
  "protein powder": { calories: 120, protein_g: 24, carbs_g: 3, fat_g: 1, per: "1 scoop" },

  // ─── SPICES (negligible calories) ───
  "turmeric": { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, per: "1/4 tsp" },
  "cumin seeds": { calories: 4, protein_g: 0.2, carbs_g: 0.5, fat_g: 0.2, per: "1/2 tsp" },
  "garam masala": { calories: 5, protein_g: 0.2, carbs_g: 1, fat_g: 0.2, per: "1/4 tsp" },
  "salt": { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, per: "any" },
  "fresh coriander": { calories: 1, protein_g: 0.1, carbs_g: 0.1, fat_g: 0, per: "2 tbsp" },
  "curry leaves": { calories: 1, protein_g: 0, carbs_g: 0.2, fat_g: 0, per: "8 leaves" },
  "green chili": { calories: 4, protein_g: 0.2, carbs_g: 1, fat_g: 0, per: "1 piece" },
  "ginger": { calories: 2, protein_g: 0, carbs_g: 0.4, fat_g: 0, per: "1 tsp grated" },
  "garlic": { calories: 4, protein_g: 0.2, carbs_g: 1, fat_g: 0, per: "2 cloves" },
  "lemon juice": { calories: 4, protein_g: 0, carbs_g: 1.3, fat_g: 0, per: "1 tbsp" },

  // ─── SNACK ITEMS ───
  "makhana": { calories: 90, protein_g: 4, carbs_g: 17, fat_g: 0.5, per: "1 cup" },
  "roasted chana": { calories: 120, protein_g: 7, carbs_g: 18, fat_g: 2, per: "1/4 cup" },
  "sprouts": { calories: 86, protein_g: 7, carbs_g: 14, fat_g: 0.5, per: "1 cup" },
  "papad": { calories: 45, protein_g: 3, carbs_g: 6, fat_g: 1, per: "1 piece" },
};

/**
 * Validate a meal's macros against the formula:
 * Calories ≈ (protein × 4) + (carbs × 4) + (fat × 9)
 * Allows ±10% tolerance.
 */
export function validateMealMacros(
  name: string,
  calories: number,
  protein_g: number,
  carbs_g: number,
  fat_g: number
): { valid: boolean; calculated: number; difference: number } {
  const calculated = (protein_g * 4) + (carbs_g * 4) + (fat_g * 9);
  const difference = Math.abs(calories - calculated);
  const tolerance = calories * 0.1; // 10% tolerance
  return {
    valid: difference <= tolerance,
    calculated: Math.round(calculated),
    difference: Math.round(difference),
  };
}
