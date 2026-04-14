import { z } from "zod";

export const IngredientSchema = z.object({
  name: z.string(),
  amount: z.string(),
  unit: z.string(),
  category: z.enum(["produce", "protein", "dairy", "grains", "pantry", "frozen", "other"]),
});
export type Ingredient = z.infer<typeof IngredientSchema>;

export const MealRecipeSchema = z.object({
  ingredients: z.array(IngredientSchema),
  steps: z.array(z.string()),
  prep_time_min: z.number(),
  cook_time_min: z.number(),
  difficulty: z.enum(["easy", "medium", "hard"]),
});
export type MealRecipe = z.infer<typeof MealRecipeSchema>;

export const TakeoutGuideSchema = z.object({
  restaurant: z.string(),
  order_suggestion: z.string(),
  estimated_calories: z.number(),
  estimated_protein_g: z.number(),
});
export type TakeoutGuide = z.infer<typeof TakeoutGuideSchema>;

export const MealSchema = z.object({
  name: z.string(),
  description: z.string(),
  calories: z.number(),
  protein_g: z.number(),
  carbs_g: z.number(),
  fat_g: z.number(),
});

export type Meal = z.infer<typeof MealSchema>;

export const MealPlanSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  date: z.string(),
  target_calories: z.number(),
  target_protein_g: z.number(),
  target_carbs_g: z.number(),
  target_fat_g: z.number(),
  meals: z.array(MealSchema),
});

export type MealPlan = z.infer<typeof MealPlanSchema>;
