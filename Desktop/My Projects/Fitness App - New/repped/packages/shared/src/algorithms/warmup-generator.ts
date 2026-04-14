import type { WarmUpExercise, CoolDownExercise } from "../types/warmup";
import { WARMUP_BY_FOCUS, COOLDOWN_BY_FOCUS } from "../constants/warmups";

/**
 * Generate a warm-up routine based on workout focus (e.g., "Push", "Legs", "Full Body A")
 */
export function generateWarmup(focus: string): WarmUpExercise[] {
  // Direct match
  if (WARMUP_BY_FOCUS[focus]) {
    return WARMUP_BY_FOCUS[focus];
  }

  // Fallback: try to match partial focus names
  const key = Object.keys(WARMUP_BY_FOCUS).find(
    (k) => focus.toLowerCase().includes(k.toLowerCase())
  );

  if (key) return WARMUP_BY_FOCUS[key];

  // Default full body warm-up
  return WARMUP_BY_FOCUS["Full Body A"] || [];
}

/**
 * Generate a cool-down routine based on workout focus
 */
export function generateCooldown(focus: string): CoolDownExercise[] {
  if (COOLDOWN_BY_FOCUS[focus]) {
    return COOLDOWN_BY_FOCUS[focus];
  }

  const key = Object.keys(COOLDOWN_BY_FOCUS).find(
    (k) => focus.toLowerCase().includes(k.toLowerCase())
  );

  if (key) return COOLDOWN_BY_FOCUS[key];

  return COOLDOWN_BY_FOCUS["Full Body A"] || [];
}

/**
 * Calculate total warm-up duration in seconds
 */
export function getWarmupDuration(exercises: WarmUpExercise[]): number {
  return exercises.reduce((total, ex) => total + ex.duration_seconds, 0);
}

/**
 * Calculate total cool-down duration in seconds
 */
export function getCooldownDuration(exercises: CoolDownExercise[]): number {
  return exercises.reduce((total, ex) => total + ex.hold_seconds, 0);
}

/**
 * Verify all warmup exercises are dynamic (safety check).
 * Static stretching before lifting reduces muscle performance.
 * This should always return true if warmup data is correct.
 */
export function validateWarmupTypes(exercises: WarmUpExercise[]): boolean {
  return exercises.every((ex) => ex.stretchType === "dynamic");
}

/**
 * Verify all cooldown exercises are static (safety check).
 * Static/deep stretches are appropriate after training for flexibility and recovery.
 */
export function validateCooldownTypes(exercises: CoolDownExercise[]): boolean {
  return exercises.every((ex) => ex.stretchType === "static");
}
