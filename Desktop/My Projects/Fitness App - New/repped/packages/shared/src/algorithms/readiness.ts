/**
 * Pre-workout readiness check.
 * Adjusts today's session based on how the user feels before starting.
 * Two consecutive "exhausted" days triggers a suggested rest day.
 */

export type ReadinessLevel = "fresh" | "okay" | "sore" | "exhausted";

export interface ReadinessResult {
  /** Multiplier to apply to today's volume (sets) */
  volumeMultiplier: number;
  /** Multiplier to apply to today's weight suggestions */
  weightMultiplier: number;
  /** RPE adjustment (added to target RPE) */
  rpeAdjust: number;
  /** Extra rest seconds to add between sets */
  extraRestSeconds: number;
  /** Whether to suggest skipping today entirely */
  suggestRest: boolean;
  /** Message to show the user */
  message: string;
}

/**
 * Calculate workout adjustments based on pre-workout readiness.
 * @param readiness - How the user feels right now
 * @param consecutiveExhaustedDays - How many days in a row they've reported "exhausted"
 */
export function calculateReadiness(
  readiness: ReadinessLevel,
  consecutiveExhaustedDays: number = 0
): ReadinessResult {
  // Two or more exhausted days in a row → suggest rest
  if (readiness === "exhausted" && consecutiveExhaustedDays >= 1) {
    return {
      volumeMultiplier: 0,
      weightMultiplier: 0,
      rpeAdjust: 0,
      extraRestSeconds: 0,
      suggestRest: true,
      message:
        "You've been feeling exhausted for multiple days. Your body is telling you something — take a rest day. Recovery is where gains happen.",
    };
  }

  const adjustments: Record<ReadinessLevel, ReadinessResult> = {
    fresh: {
      volumeMultiplier: 1.0,
      weightMultiplier: 1.0,
      rpeAdjust: 0,
      extraRestSeconds: 0,
      suggestRest: false,
      message: "You're feeling great — let's push it today. Full intensity.",
    },
    okay: {
      volumeMultiplier: 1.0,
      weightMultiplier: 1.0,
      rpeAdjust: 0,
      extraRestSeconds: 0,
      suggestRest: false,
      message: "Solid day ahead. Stick to the plan and trust the process.",
    },
    sore: {
      volumeMultiplier: 0.85,
      weightMultiplier: 0.9,
      rpeAdjust: -1,
      extraRestSeconds: 15,
      suggestRest: false,
      message:
        "Feeling a bit beat up? We've dialed back today's volume and weight slightly. Focus on form and listen to your body.",
    },
    exhausted: {
      volumeMultiplier: 0.7,
      weightMultiplier: 0.8,
      rpeAdjust: -2,
      extraRestSeconds: 30,
      suggestRest: false,
      message:
        "Rough day — we've cut today's load significantly. A lighter session is still better than no session. If you'd rather rest, that's okay too.",
    },
  };

  return adjustments[readiness];
}

/**
 * Apply readiness adjustments to planned workout parameters.
 */
export function applyReadiness(
  targetSets: number,
  targetReps: number,
  targetRpe: number,
  restSeconds: number,
  suggestedWeight: number,
  readiness: ReadinessResult
): {
  adjustedSets: number;
  adjustedReps: number;
  adjustedRpe: number;
  adjustedRestSeconds: number;
  adjustedWeight: number;
} {
  return {
    adjustedSets: Math.max(1, Math.round(targetSets * readiness.volumeMultiplier)),
    adjustedReps: targetReps, // keep reps the same, adjust weight/volume instead
    adjustedRpe: Math.max(4, Math.min(10, targetRpe + readiness.rpeAdjust)),
    adjustedRestSeconds: restSeconds + readiness.extraRestSeconds,
    adjustedWeight: Math.round(suggestedWeight * readiness.weightMultiplier * 4) / 4, // round to 0.25kg
  };
}
