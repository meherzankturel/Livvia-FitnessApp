import type { Goal } from "../types/user";
import {
  GOAL_CALORIE_FRACTION,
  PROTEIN_RANGE,
  FAT_RANGE,
} from "../constants/fitness";

export interface MacroTargets {
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
}

/**
 * Calculate daily macro targets based on TDEE, goal, and body weight.
 *
 * Calorie adjustment is now percentage-based (15% deficit / 12% surplus)
 * so it scales properly for both small and large individuals.
 *
 * Protein is bumped +0.2 g/kg during fat loss to preserve muscle in a deficit.
 */
export function calculateMacros(
  tdee: number,
  goal: Goal,
  weight_kg: number
): MacroTargets {
  // Percentage-based calorie adjustment scales with body size
  const calories = Math.round(tdee + tdee * GOAL_CALORIE_FRACTION[goal]);

  // Protein: 1.8 g/kg baseline, +0.2 g/kg for fat loss (muscle preservation in deficit)
  const proteinPerKg = goal === "lose_fat" ? 2.0 : 1.8;
  const protein_g = Math.round(weight_kg * proteinPerKg);

  // Fat: 0.85 g/kg (middle of 0.8-0.9 range)
  const fat_g = Math.round(weight_kg * 0.85);

  // Carbs: remainder of calories
  const protein_calories = protein_g * 4;
  const fat_calories = fat_g * 9;
  const carbs_g = Math.round((calories - protein_calories - fat_calories) / 4);

  return { calories, protein_g, fat_g, carbs_g: Math.max(carbs_g, 0) };
}
