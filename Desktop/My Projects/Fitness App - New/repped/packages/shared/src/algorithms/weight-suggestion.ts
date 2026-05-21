import type { Sex, TrainingHistory } from "../types/user";
import type { MuscleGroup } from "../types/exercise";

export type EquipmentType = "barbell" | "dumbbell" | "cable" | "machine" | "bodyweight" | "other";
export type Confidence = "low" | "medium" | "high";

interface WeightSuggestionInput {
  bodyWeightKg: number;
  sex: Sex;
  trainingHistory: TrainingHistory;
  muscleGroup: MuscleGroup;
  lastLoggedWeight?: number;
  /** Number of completed sessions the user has logged for this exercise/muscle group */
  sessionCount?: number;
  /** Equipment type — affects rounding (barbell = 2.5kg, dumbbell = 1kg) */
  equipmentType?: EquipmentType;
  /**
   * Mesocycle weight scaling factor from getPeriodization().intensityMultiplier.
   * Applied ONLY when lastLoggedWeight is present — first-time body-weight-ratio
   * estimates ignore this since there's no baseline to scale.
   *   - intro (week 1):  0.9  (~10% lighter — ramp-up)
   *   - build (week 2):  1.0
   *   - peak  (week 3):  1.1  (~10% heavier — Stone et al., NSCA Essentials 4th ed.)
   *   - deload(week 4):  0.75 (~25% lighter — Bompa Periodization 6th ed.)
   * Defaults to 1.0 (no scaling).
   */
  intensityMultiplier?: number;
}

interface WeightSuggestion {
  suggestedKg: number;
  reasoning: string;
  confidence: Confidence;
}

// Body weight ratios for first-time weight estimates by muscle group and experience
const WEIGHT_RATIOS: Record<string, Record<TrainingHistory, number>> = {
  // Compound push (chest, shoulders)
  chest: { beginner: 0.4, intermediate: 0.55, advanced: 0.75 },
  shoulders: { beginner: 0.2, intermediate: 0.35, advanced: 0.5 },
  // Compound pull (back)
  back: { beginner: 0.3, intermediate: 0.5, advanced: 0.7 },
  // Lower body compounds
  quads: { beginner: 0.45, intermediate: 0.7, advanced: 1.0 },
  hamstrings: { beginner: 0.35, intermediate: 0.55, advanced: 0.75 },
  glutes: { beginner: 0.4, intermediate: 0.65, advanced: 0.9 },
  // Isolation
  biceps: { beginner: 0.13, intermediate: 0.18, advanced: 0.2 },
  triceps: { beginner: 0.13, intermediate: 0.18, advanced: 0.2 },
  calves: { beginner: 0.2, intermediate: 0.35, advanced: 0.5 },
  // Core / full body (bodyweight exercises, use low weight)
  core: { beginner: 0, intermediate: 0.05, advanced: 0.1 },
  full_body: { beginner: 0.25, intermediate: 0.4, advanced: 0.6 },
};

// Lower-body muscle groups where women have proportionally higher relative strength
const LOWER_BODY_GROUPS: ReadonlySet<string> = new Set([
  "quads",
  "hamstrings",
  "glutes",
  "calves",
]);

// Female modifiers — women are relatively stronger in lower body vs upper body
const FEMALE_MODIFIER_UPPER = 0.65;
const FEMALE_MODIFIER_LOWER = 0.55;

/** Get the rounding increment based on equipment type */
function roundingIncrement(equipmentType: EquipmentType | undefined): number {
  switch (equipmentType) {
    case "dumbbell":
      return 1;
    case "barbell":
      return 2.5;
    case "cable":
    case "machine":
      return 2.5;
    case "bodyweight":
      return 1;
    default:
      return 2.5;
  }
}

/** Determine confidence based on available data */
function determineConfidence(
  lastLoggedWeight: number | undefined,
  sessionCount: number | undefined,
): Confidence {
  if (sessionCount !== undefined && sessionCount >= 3) return "high";
  if (lastLoggedWeight !== undefined && lastLoggedWeight > 0) return "medium";
  return "low";
}

export function suggestWeight(input: WeightSuggestionInput): WeightSuggestion {
  const {
    bodyWeightKg,
    sex,
    trainingHistory,
    muscleGroup,
    lastLoggedWeight,
    sessionCount,
    equipmentType,
    intensityMultiplier = 1.0,
  } = input;

  const confidence = determineConfidence(lastLoggedWeight, sessionCount);

  // If we have previous data, use it (progression system handles increases)
  if (lastLoggedWeight !== undefined && lastLoggedWeight > 0) {
    const sessionDetail =
      sessionCount !== undefined && sessionCount >= 3
        ? `Based on ${sessionCount} logged sessions.`
        : "Based on your last workout.";

    // Apply mesocycle weight scaling — only here, never in the body-weight-ratio
    // fallback below (which is for users with no logged history yet).
    const scaled = lastLoggedWeight * intensityMultiplier;
    const increment = roundingIncrement(equipmentType);
    const suggestedKg = Math.max(0, Math.round(scaled / increment) * increment);

    let phaseNote = "";
    if (intensityMultiplier < 0.95) {
      const reductionPct = Math.round((1 - intensityMultiplier) * 100);
      phaseNote = ` Deload week — lifting ${reductionPct}% lighter so your body recovers.`;
    } else if (intensityMultiplier > 1.05) {
      const increasePct = Math.round((intensityMultiplier - 1) * 100);
      phaseNote = ` Peak week — pushing ${increasePct}% heavier than last time.`;
    } else if (intensityMultiplier < 1.0) {
      phaseNote = " Intro week — easing back in.";
    }

    return {
      suggestedKg,
      reasoning: `${sessionDetail}${phaseNote} The app will auto-adjust as you progress.`,
      confidence,
    };
  }

  // First time — estimate from body weight
  const ratio = WEIGHT_RATIOS[muscleGroup]?.[trainingHistory] ?? 0.3;
  const baseWeight = bodyWeightKg * ratio;

  // Apply sex-specific modifier with upper/lower split
  let adjustedWeight = baseWeight;
  if (sex === "female") {
    const modifier = LOWER_BODY_GROUPS.has(muscleGroup)
      ? FEMALE_MODIFIER_LOWER
      : FEMALE_MODIFIER_UPPER;
    adjustedWeight = baseWeight * modifier;
  }

  // Round to nearest increment based on equipment type
  const increment = roundingIncrement(equipmentType);
  const rounded = Math.round(adjustedWeight / increment) * increment;
  const suggestedKg = Math.max(0, rounded);

  // Build transparent reasoning
  let reasoning: string;
  if (suggestedKg === 0) {
    reasoning = "Bodyweight exercise — no additional weight needed.";
  } else {
    const sexNote = sex === "female"
      ? ` × ${LOWER_BODY_GROUPS.has(muscleGroup) ? FEMALE_MODIFIER_LOWER : FEMALE_MODIFIER_UPPER} female modifier`
      : "";
    const roundNote = increment !== 2.5
      ? ` Rounded to nearest ${increment}kg.`
      : "";
    reasoning =
      `Based on your ${bodyWeightKg}kg bodyweight × ${ratio} ratio for ${muscleGroup} (${trainingHistory})${sexNote}.${roundNote} Adjust after your first session.`;
  }

  return {
    suggestedKg,
    reasoning,
    confidence,
  };
}

export type { WeightSuggestionInput, WeightSuggestion };
