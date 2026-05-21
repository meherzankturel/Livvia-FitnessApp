/**
 * Goal-aware target-weight validation.
 *
 * BMI on its own is a population screening tool and fights muscle-gain goals
 * (a natural lifter at "healthy" BMI cusp gets flagged for any reasonable bulk).
 * So we apply different thresholds per goal:
 *   - Build Muscle: BMI 18.5–29.9 is normal; only flag past delta 15kg / BMI 30+
 *   - Lose Fat:     standard BMI ranges apply
 *   - Stay Fit:     only flag if current is itself far outside healthy range
 */

import type { Goal } from "@repped/shared";

export interface GoalValidation {
  severity: "ok" | "warn" | "error";
  message: string | null;
}

export function validateGoalTarget(args: {
  goal: Goal;
  currentWeightKg: number;
  targetWeightKg: number;
  heightCm: number;
}): GoalValidation {
  const { goal, currentWeightKg, targetWeightKg, heightCm } = args;
  const heightM = heightCm / 100;
  const bmi = targetWeightKg / (heightM * heightM);
  const delta = targetWeightKg - currentWeightKg;

  // ─── Direction mismatch — hard errors ───
  if (goal === "lose_fat" && targetWeightKg >= currentWeightKg) {
    return { severity: "error", message: `Target should be below your current weight (${currentWeightKg} kg).` };
  }
  if (goal === "build_muscle" && targetWeightKg <= currentWeightKg) {
    return { severity: "error", message: `Target should be above your current weight (${currentWeightKg} kg).` };
  }
  if (goal === "maintain" && Math.abs(delta) > 3) {
    return { severity: "error", message: "That's a real change. Switch to Lose Fat or Build Muscle." };
  }

  // ─── Build Muscle: BMI 18.5–29.9 is the muscle-gain zone, no warning ───
  if (goal === "build_muscle") {
    if (delta > 25) return { severity: "error", message: "That's too much to gain. Try a smaller target." };
    if (bmi >= 35) return { severity: "error", message: "Too heavy for your height. Try a smaller target." };
    if (delta > 15) return { severity: "warn", message: "That's a lot to gain — expect a couple of years." };
    if (bmi >= 30) return { severity: "warn", message: "You may gain some fat alongside muscle at this size." };
  }

  // ─── Lose Fat: standard BMI checks ───
  if (goal === "lose_fat") {
    if (bmi < 17) return { severity: "error", message: "Too thin for your height. Talk to a doctor first." };
    if (bmi < 18.5) return { severity: "warn", message: "Target is on the thin side." };
    if (Math.abs(delta) > 30) return { severity: "warn", message: "That's a lot to lose. Try an interim target first." };
  }

  // ─── Maintain / Stay Fit: only flag extreme current weight ───
  if (goal === "maintain") {
    if (bmi < 17 || bmi >= 35) {
      return { severity: "warn", message: "You're outside the healthy range. Try Lose Fat or Build Muscle." };
    }
  }

  return { severity: "ok", message: null };
}
