import { MESOCYCLE } from "../constants/fitness";

export type PhaseName = "intro" | "build" | "peak" | "deload";

export interface PeriodizationConfig {
  week: number; // 1-4 within mesocycle
  phase: PhaseName;
  phaseName: PhaseName; // UI-friendly alias for phase
  volumeMultiplier: number;
  /** Applies to WEIGHT, not reps — tells the weight suggestion system to scale load */
  intensityMultiplier: number;
  rpeAdjust: number;
}

/**
 * Get periodization config for a given week number.
 * Repeats in 4-week mesocycles.
 */
export function getPeriodization(weekNumber: number): PeriodizationConfig {
  const weekInCycle = ((weekNumber - 1) % MESOCYCLE.length) + 1;
  const phase = MESOCYCLE.phases[weekInCycle - 1];

  const configs: Record<string, Omit<PeriodizationConfig, "week" | "phase" | "phaseName">> = {
    intro: { volumeMultiplier: 0.85, intensityMultiplier: 0.9, rpeAdjust: -1.5 },
    build: { volumeMultiplier: 1.0, intensityMultiplier: 1.0, rpeAdjust: 0 },
    // Peak: fewer total sets, heavier weight — intensityMultiplier applies to WEIGHT not reps
    peak: { volumeMultiplier: 0.9, intensityMultiplier: 1.1, rpeAdjust: 0.5 },
    // Deload: true recovery — 0.5 × 0.75 = 37.5% of normal training stress
    deload: { volumeMultiplier: 0.5, intensityMultiplier: 0.75, rpeAdjust: -2 },
  };

  return { week: weekInCycle, phase, phaseName: phase, ...configs[phase] };
}

/**
 * Apply periodization to a set of workout parameters.
 * Note: intensityMultiplier is NOT applied to reps — it applies to weight
 * via the weight suggestion system. Reps stay at base during all phases.
 */
export function applyPeriodization(
  baseSets: number,
  baseReps: number,
  baseRpe: number,
  weekNumber: number
): { sets: number; reps: number; rpe: number; phaseName: PhaseName } {
  const config = getPeriodization(weekNumber);

  return {
    sets: Math.max(2, Math.round(baseSets * config.volumeMultiplier)),
    reps: baseReps, // reps stay constant — intensity is expressed via weight
    rpe: Math.min(10, Math.max(5, baseRpe + config.rpeAdjust)),
    phaseName: config.phaseName,
  };
}
