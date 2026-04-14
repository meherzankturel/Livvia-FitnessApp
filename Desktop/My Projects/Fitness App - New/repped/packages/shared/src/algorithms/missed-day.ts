/**
 * Missed day handler.
 * When a user misses a scheduled workout, provides intelligent recovery options
 * instead of rigid "you missed it, too bad" behavior.
 */

import type { WorkoutDay, PlannedExercise } from "./workout-generator";

export type MissedDayStrategy = "reschedule" | "merge" | "skip";

export interface MissedDayOption {
  strategy: MissedDayStrategy;
  label: string;
  description: string;
}

export interface MissedDayResult {
  /** Updated weekly plan after applying the chosen strategy */
  updatedPlan: WorkoutDay[];
  /** Message to show the user */
  message: string;
}

/**
 * Get the available options for handling a missed workout day.
 * @param missedDay - The workout day that was missed
 * @param remainingDays - Days left in the week (including rest days)
 */
export function getMissedDayOptions(
  missedDay: WorkoutDay,
  remainingDays: WorkoutDay[]
): MissedDayOption[] {
  const options: MissedDayOption[] = [];

  // Option 1: Reschedule — only if there's a rest day or empty slot available
  const hasRestDay = remainingDays.some((d) => d.isRestDay);
  if (hasRestDay) {
    options.push({
      strategy: "reschedule",
      label: "Reschedule",
      description: `Move your ${missedDay.focus} workout to your next rest day.`,
    });
  }

  // Option 2: Merge — only if there's a training day coming up
  const nextTrainingDay = remainingDays.find((d) => !d.isRestDay);
  if (nextTrainingDay) {
    options.push({
      strategy: "merge",
      label: "Quick combo",
      description: `Add key exercises from ${missedDay.focus} into your ${nextTrainingDay.focus} session (lighter volume).`,
    });
  }

  // Option 3: Skip — always available
  options.push({
    strategy: "skip",
    label: "Skip it",
    description: "One missed day won't hurt your progress. Consistency over perfection.",
  });

  return options;
}

/**
 * Apply the chosen missed day strategy to the weekly plan.
 * @param strategy - The user's choice
 * @param missedDay - The day that was missed
 * @param weekPlan - The full 7-day plan
 */
export function handleMissedDay(
  strategy: MissedDayStrategy,
  missedDay: WorkoutDay,
  weekPlan: WorkoutDay[]
): MissedDayResult {
  const updatedPlan = weekPlan.map((d) => ({ ...d, exercises: [...d.exercises] }));
  const missedDayIndex = updatedPlan.findIndex((d) => d.day === missedDay.day);

  switch (strategy) {
    case "reschedule": {
      // Find the first rest day after the missed day
      const restDayIndex = updatedPlan.findIndex(
        (d, i) => i > missedDayIndex && d.isRestDay
      );

      if (restDayIndex !== -1) {
        // Swap: missed day becomes rest, rest day gets the workout
        updatedPlan[restDayIndex] = {
          ...updatedPlan[restDayIndex],
          focus: missedDay.focus,
          isRestDay: false,
          exercises: missedDay.exercises,
        };
        updatedPlan[missedDayIndex] = {
          ...updatedPlan[missedDayIndex],
          focus: "Rest",
          isRestDay: true,
          exercises: [],
        };

        return {
          updatedPlan,
          message: `No problem — your ${missedDay.focus} workout has been moved to Day ${updatedPlan[restDayIndex].day}. Life happens, and flexibility keeps you on track.`,
        };
      }

      // Fallback to skip if no rest day found (shouldn't happen if getMissedDayOptions was used)
      return handleMissedDay("skip", missedDay, weekPlan);
    }

    case "merge": {
      // Find the next training day after the missed day
      const nextTrainingIndex = updatedPlan.findIndex(
        (d, i) => i > missedDayIndex && !d.isRestDay
      );

      if (nextTrainingIndex !== -1) {
        // Take the top exercises from the missed day (max 2-3) with reduced volume
        const mergedExercises = missedDay.exercises.slice(0, 3).map((ex) => ({
          ...ex,
          targetSets: Math.max(2, Math.ceil(ex.targetSets * 0.6)), // 60% volume
          explainWhy: `[Carried over from missed ${missedDay.focus} day] ${ex.explainWhy}`,
        }));

        updatedPlan[nextTrainingIndex] = {
          ...updatedPlan[nextTrainingIndex],
          exercises: [...updatedPlan[nextTrainingIndex].exercises, ...mergedExercises],
        };

        // Mark missed day as rest
        updatedPlan[missedDayIndex] = {
          ...updatedPlan[missedDayIndex],
          focus: "Rest",
          isRestDay: true,
          exercises: [],
        };

        return {
          updatedPlan,
          message: `We've added ${mergedExercises.length} key exercises from your missed ${missedDay.focus} session into your ${updatedPlan[nextTrainingIndex].focus} day at lighter volume. You won't miss out.`,
        };
      }

      return handleMissedDay("skip", missedDay, weekPlan);
    }

    case "skip":
    default: {
      // Mark as rest and reassure
      updatedPlan[missedDayIndex] = {
        ...updatedPlan[missedDayIndex],
        focus: "Rest (missed)",
        isRestDay: true,
        exercises: [],
      };

      return {
        updatedPlan,
        message:
          "One missed day doesn't define your journey. The best program is the one you stick to. You'll be back stronger tomorrow.",
      };
    }
  }
}
