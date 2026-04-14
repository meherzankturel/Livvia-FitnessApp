import type { Sex, ActivityLevel } from "../types/user";
import { ACTIVITY_MULTIPLIERS } from "../constants/fitness";

export interface TDEEResult {
  tdee: number;
  /** Lower bound accounting for ~10% metabolic variance */
  low: number;
  /** Upper bound accounting for ~10% metabolic variance */
  high: number;
}

/**
 * Calculate BMR using Mifflin-St Jeor equation
 */
export function calculateBMR(
  weight_kg: number,
  height_cm: number,
  age: number,
  sex: Sex
): number {
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure).
 * Returns the point estimate as a number for backward compatibility.
 */
export function calculateTDEE(
  weight_kg: number,
  height_cm: number,
  age: number,
  sex: Sex,
  activity_level: ActivityLevel
): number {
  const bmr = calculateBMR(weight_kg, height_cm, age, sex);
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activity_level]);
}

/**
 * Calculate TDEE with a ±10% range to account for metabolic variance.
 * Use this when the UI needs to display a range instead of a single number.
 */
export function calculateTDEERange(
  weight_kg: number,
  height_cm: number,
  age: number,
  sex: Sex,
  activity_level: ActivityLevel
): TDEEResult {
  const tdee = calculateTDEE(weight_kg, height_cm, age, sex, activity_level);
  return {
    tdee,
    low: Math.round(tdee * 0.9),
    high: Math.round(tdee * 1.1),
  };
}
