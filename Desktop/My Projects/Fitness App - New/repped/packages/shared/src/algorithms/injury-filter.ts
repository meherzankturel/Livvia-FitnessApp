import type { Exercise } from "../types/exercise";
import { INJURY_DEFINITIONS, shouldAvoidExercise, type UserInjury } from "../constants/injuries";

/**
 * Filter exercises based on user's current injuries.
 * - Mild: allow but suggest lower weight
 * - Moderate: swap to alternatives
 * - Severe: skip exercises for that area entirely
 */
export function filterExercisesForInjuries(
  exercises: { exerciseId: string; exerciseName: string; muscleGroup: string; [key: string]: any }[],
  injuries: UserInjury[],
  _exerciseLibrary: Exercise[]
): { exerciseId: string; exerciseName: string; muscleGroup: string; modified: boolean; injuryNote: string; [key: string]: any }[] {
  if (!injuries || injuries.length === 0) return exercises.map(e => ({ ...e, modified: false, injuryNote: "" }));

  const result: any[] = [];

  for (const ex of exercises) {
    const check = shouldAvoidExercise(ex.exerciseName, ex.muscleGroup, injuries);

    if (check.avoid) {
      continue; // Remove from workout entirely
    }

    result.push({
      ...ex,
      modified: check.reason !== "",
      injuryNote: check.reason,
    });
  }

  return result;
}
