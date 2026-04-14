/**
 * Format weight with unit
 */
export function formatWeight(kg: number, unit: "kg" | "lbs" = "kg"): string {
  if (unit === "lbs") {
    return `${Math.round(kg * 2.20462)} lbs`;
  }
  return `${kg} kg`;
}

/**
 * Format calories
 */
export function formatCalories(cal: number): string {
  return `${Math.round(cal)} cal`;
}

/**
 * Format duration in seconds to MM:SS
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
