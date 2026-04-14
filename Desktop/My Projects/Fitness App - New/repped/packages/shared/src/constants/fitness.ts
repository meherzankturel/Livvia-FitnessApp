/** Activity level multipliers for TDEE calculation (Mifflin-St Jeor) */
export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9,
} as const;

/**
 * Calorie adjustments by goal — expressed as a fraction of TDEE.
 * lose_fat: 15% deficit, build_muscle: 12% surplus.
 * Scales properly for both small and large individuals.
 */
export const GOAL_CALORIE_FRACTION = {
  lose_fat: -0.15,
  maintain: 0,
  build_muscle: 0.12,
} as const;

/**
 * @deprecated Use GOAL_CALORIE_FRACTION instead — fixed offsets don't scale by body size.
 * Kept for backward compatibility.
 */
export const GOAL_CALORIE_ADJUSTMENT = {
  lose_fat: -400,
  maintain: 0,
  build_muscle: 300,
} as const;

/** Protein targets in g/kg body weight */
export const PROTEIN_RANGE = { min: 1.6, max: 2.0 } as const;

/** Fat targets in g/kg body weight */
export const FAT_RANGE = { min: 0.8, max: 0.9 } as const;

/** Progressive overload increments in kg */
export const PROGRESSION = {
  upper_body_increment: 2.5,
  lower_body_increment: 5.0,
  /** Relative increment cap: min(absolute_increment, currentWeight * relative_increment_factor) */
  relative_increment_factor: 0.05,
  /** Isolation exercises use half the increment of compound movements */
  isolation_factor: 0.5,
  /** Tiered deload reductions based on completion rate */
  deload_tier_1: 0.05, // completion < 0.65 → 5% reduction
  deload_tier_2: 0.10, // completion < 0.50 → 10% reduction
  deload_tier_3: 0.15, // completion < 0.35 → 15% reduction
  underperformance_threshold: 0.65, // below 65% of target reps = underperformance
  /** @deprecated Use underperformance_threshold instead */
  failure_threshold: 0.65,
  /** @deprecated Use tiered deload (deload_tier_1/2/3) instead */
  deload_reduction: 0.05,
} as const;

/** Mesocycle structure (weeks) */
export const MESOCYCLE = {
  length: 4,
  phases: ["intro", "build", "peak", "deload"] as const,
} as const;

/** Split recommendations by days per week */
export const SPLIT_BY_DAYS: Record<number, string> = {
  2: "full_body",
  3: "full_body",
  4: "upper_lower",
  5: "push_pull_legs",
  6: "push_pull_legs",
  7: "bro_split",
} as const;
