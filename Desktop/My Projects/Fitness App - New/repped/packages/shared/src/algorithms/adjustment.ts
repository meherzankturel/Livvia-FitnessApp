import type { TrainingHistory } from "../types/user";

export type DifficultyRating = "too_easy" | "just_right" | "too_hard";

export interface AdjustmentResult {
  volumeChange: number; // percentage: e.g., 0.1 = +10%
  weightChange: number; // percentage
  message: string;
  triggerDeload: boolean;
}

/**
 * Calculate workout adjustments based on weekly check-in feedback.
 */
export function calculateAdjustment(
  rating: DifficultyRating,
  currentWeek: number,
  consecutiveHardWeeks: number,
  trainingHistory: TrainingHistory
): AdjustmentResult {
  // If user reports "too hard" for 2+ consecutive weeks, trigger deload
  if (rating === "too_hard" && consecutiveHardWeeks >= 2) {
    return {
      volumeChange: -0.4,
      weightChange: -0.15,
      message:
        "Taking a deload week. You've been pushing hard — your body needs recovery to grow stronger.",
      triggerDeload: true,
    };
  }

  const adjustments: Record<DifficultyRating, AdjustmentResult> = {
    too_easy: {
      volumeChange: trainingHistory === "beginner" ? 0.05 : 0.1,
      weightChange: 0.05,
      message: "Bumping things up a notch. You're ready for more.",
      triggerDeload: false,
    },
    just_right: {
      volumeChange: 0,
      weightChange: 0,
      message: "Perfect — staying the course. Consistency wins.",
      triggerDeload: false,
    },
    too_hard: {
      volumeChange: -0.1,
      weightChange: -0.05,
      message: "Dialing it back slightly. Recovery is where the gains happen.",
      triggerDeload: false,
    },
  };

  return adjustments[rating];
}
