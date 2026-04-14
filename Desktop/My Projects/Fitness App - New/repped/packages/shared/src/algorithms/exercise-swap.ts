import type { Exercise, MuscleGroup } from "../types/exercise";
import { inferMovementPattern } from "../constants/movement-patterns";

// Compound detection — same keywords as workout-generator
const COMPOUND_KEYWORDS = [
  "squat", "deadlift", "bench press", "overhead press", "military press",
  "row", "pull-up", "pullup", "chin-up", "chinup", "dip", "lunge",
  "hip thrust", "leg press", "clean", "snatch", "push-up", "pushup",
  "romanian", "rdl", "front squat", "goblet", "split squat",
];
const COMPOUND_PATTERNS = COMPOUND_KEYWORDS.map(
  (kw) => new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i")
);
function isCompound(name: string): boolean {
  return COMPOUND_PATTERNS.some((p) => p.test(name));
}

/**
 * Find alternative exercises for the same muscle group and compatible equipment.
 * Ranked by:
 *   1. Same movement pattern (e.g., horizontal press → horizontal press)
 *   2. Same compound/isolation type (compound → compound, isolation → isolation)
 *   3. Same difficulty level
 *   4. Different equipment from current (user likely wants a different setup)
 *
 * Returns up to 5 ranked alternatives.
 */
export function findAlternatives(
  currentExerciseId: string,
  muscleGroup: MuscleGroup,
  availableEquipment: string[],
  difficulty: string,
  library: Exercise[],
  currentExerciseName?: string
): Exercise[] {
  const currentPattern = currentExerciseName
    ? inferMovementPattern(currentExerciseName)
    : null;
  const currentIsCompound = currentExerciseName
    ? isCompound(currentExerciseName)
    : null;

  return library
    .filter((ex) => {
      if (ex.id === currentExerciseId) return false;
      if (ex.muscle_group !== muscleGroup) return false;
      return ex.equipment.some((eq) => availableEquipment.includes(eq));
    })
    .map((ex) => {
      let score = 0;

      // +3 — same movement pattern (most important: preserves training stimulus)
      if (currentPattern && inferMovementPattern(ex.name) === currentPattern) {
        score += 3;
      }

      // +2 — same compound/isolation type (preserves metabolic intent)
      if (currentIsCompound !== null && isCompound(ex.name) === currentIsCompound) {
        score += 2;
      }

      // +1 — same difficulty
      if (ex.difficulty === difficulty) {
        score += 1;
      }

      return { exercise: ex, score };
    })
    .sort((a, b) => b.score - a.score) // highest score first
    .slice(0, 5)
    .map((item) => item.exercise);
}
