/**
 * Generates an optional HIIT + core finisher block for each workout session.
 * Picks one HIIT exercise matched to the workout focus and 2-3 core exercises
 * from a rotating pool (avoids repeating the same combo back-to-back).
 */

import type { FinisherBlock, FinisherExercise } from "../constants/finishers";
import { HIIT_BY_FOCUS, CORE_FINISHER_POOL } from "../constants/finishers";

/**
 * Generate a finisher block for a given workout focus.
 * @param focus - The workout focus (e.g., "Push", "Legs", "Full Body A")
 * @param previousCoreNames - Names of core exercises used in the previous session (to avoid repeats)
 * @param coreCount - Number of core exercises to include (default 2-3 based on randomness)
 */
export function generateFinisher(
  focus: string,
  previousCoreNames: string[] = [],
  coreCount?: number
): FinisherBlock {
  // Pick one HIIT exercise matched to workout focus
  const hiitOptions = HIIT_BY_FOCUS[focus] || HIIT_BY_FOCUS["Full Body A"] || [];
  const hiitPick = hiitOptions.length > 0
    ? hiitOptions[Math.floor(Math.random() * hiitOptions.length)]
    : null;

  // Pick 2-3 core exercises, avoiding previous session's picks
  const count = coreCount ?? (Math.random() > 0.5 ? 3 : 2);
  const availableCore = CORE_FINISHER_POOL.filter(
    (ex) => !previousCoreNames.includes(ex.name)
  );
  // If we've filtered too many out, fall back to the full pool
  const corePool = availableCore.length >= count ? availableCore : CORE_FINISHER_POOL;
  const shuffledCore = [...corePool].sort(() => Math.random() - 0.5);
  const corePicks = shuffledCore.slice(0, count);

  // Build the finisher block
  const exercises: FinisherExercise[] = [];
  if (hiitPick) exercises.push(hiitPick);
  exercises.push(...corePicks);

  const totalDurationSeconds = exercises.reduce((sum, ex) => sum + ex.duration_seconds, 0);

  return { exercises, totalDurationSeconds };
}

/**
 * Get the names of core exercises from a finisher block (for tracking rotation).
 */
export function getFinisherCoreNames(finisher: FinisherBlock): string[] {
  return finisher.exercises
    .filter((ex) => ex.type === "core")
    .map((ex) => ex.name);
}
