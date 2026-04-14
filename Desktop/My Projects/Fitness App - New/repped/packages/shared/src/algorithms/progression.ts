import { PROGRESSION } from "../constants/fitness";
import type { MuscleGroup } from "../types/exercise";

const UPPER_BODY: MuscleGroup[] = ["chest", "back", "shoulders", "biceps", "triceps"];
const LOWER_BODY: MuscleGroup[] = ["quads", "hamstrings", "glutes", "calves"];

/** Keywords that identify compound movements */
const COMPOUND_KEYWORDS = [
  "squat",
  "bench",
  "deadlift",
  "press",
  "row",
  "clean",
  "snatch",
  "thrust",
  "pull-up",
  "pullup",
  "chin-up",
  "chinup",
  "dip",
];

export interface ProgressionResult {
  newWeight: number;
  reason: string;
}

/**
 * Determine whether an exercise is a compound movement based on its name.
 * Compound movements use full increments; isolation movements use half.
 */
export function isCompoundExercise(exerciseName?: string): boolean {
  if (!exerciseName) return true; // default to compound for safety
  const lower = exerciseName.toLowerCase();
  return COMPOUND_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Calculate the weight increment for an exercise.
 *
 * Uses relative increments capped by absolute maximums to avoid
 * absurd percentage jumps on light weights (e.g. 2.5kg on a 10kg curl = 25%).
 *
 * Formula: min(absoluteMax, currentWeight * 0.05)
 * Isolation exercises get half the increment of compound movements.
 */
function calculateIncrement(
  currentWeight: number,
  muscleGroup: MuscleGroup,
  exerciseName?: string
): number {
  const isUpper = UPPER_BODY.includes(muscleGroup);
  const absoluteMax = isUpper
    ? PROGRESSION.upper_body_increment
    : PROGRESSION.lower_body_increment;

  // Relative increment: 5% of current weight, capped at the absolute max
  const relativeIncrement = Math.min(
    absoluteMax,
    currentWeight * PROGRESSION.relative_increment_factor
  );

  // Use at least a small minimum so very light weights still progress
  const baseIncrement = Math.max(relativeIncrement, 0.5);

  // Isolation exercises get half the increment
  const compound = isCompoundExercise(exerciseName);
  return compound ? baseIncrement : baseIncrement * PROGRESSION.isolation_factor;
}

/**
 * Calculate the tiered deload reduction based on completion rate.
 *
 * - completion < 0.35 → 15% reduction
 * - completion < 0.50 → 10% reduction
 * - completion < 0.65 → 5% reduction
 */
function calculateDeloadReduction(
  currentWeight: number,
  completionRate: number
): number {
  let reductionPct: number;

  if (completionRate < 0.35) {
    reductionPct = PROGRESSION.deload_tier_3; // 15%
  } else if (completionRate < 0.5) {
    reductionPct = PROGRESSION.deload_tier_2; // 10%
  } else {
    reductionPct = PROGRESSION.deload_tier_1; // 5%
  }

  return currentWeight * reductionPct;
}

/**
 * Determine the next weight for an exercise based on performance.
 *
 * Rules:
 * - All target reps completed across all sets → increase weight
 * - Less than 65% of target reps completed → decrease weight (tiered)
 * - Otherwise → keep same weight
 *
 * @param exerciseName - Optional exercise name for compound/isolation detection
 */
export function calculateProgression(
  currentWeight: number,
  targetReps: number,
  targetSets: number,
  actualReps: number[], // reps achieved per set
  muscleGroup: MuscleGroup,
  exerciseName?: string
): ProgressionResult {
  const totalTargetReps = targetReps * targetSets;
  const totalActualReps = actualReps.reduce((sum, r) => sum + r, 0);
  const completionRate = totalActualReps / totalTargetReps;

  const increment = calculateIncrement(currentWeight, muscleGroup, exerciseName);

  if (completionRate >= 1.0) {
    // All reps completed — increase weight
    const roundedIncrement = Math.round(increment * 10) / 10;
    return {
      newWeight: Math.round((currentWeight + roundedIncrement) * 10) / 10,
      reason: `You hit all your reps! Going up ${roundedIncrement}kg.`,
    };
  }

  if (completionRate < PROGRESSION.underperformance_threshold) {
    // Below threshold — tiered deload
    const reduction = calculateDeloadReduction(currentWeight, completionRate);
    const roundedReduction = Math.max(0.5, Math.round(reduction * 10) / 10);
    return {
      newWeight: Math.max(0, Math.round((currentWeight - roundedReduction) * 10) / 10),
      reason: `That was tough. Dropping ${roundedReduction}kg to nail the form.`,
    };
  }

  // Keep same weight
  return {
    newWeight: currentWeight,
    reason: `Good work. Same weight next time — let's get all the reps.`,
  };
}
