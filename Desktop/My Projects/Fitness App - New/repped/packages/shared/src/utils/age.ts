/**
 * Compute current age in years from a date of birth.
 * @param dob ISO date string (YYYY-MM-DD) or Date object
 */
export function calcAge(dob: string | Date | null | undefined): number {
  if (!dob) return 0;
  const birth = typeof dob === "string" ? new Date(dob) : dob;
  if (isNaN(birth.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDelta = today.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Format a DOB string (YYYY-MM-DD) into a human-readable display.
 * Example: "1997-06-15" → "Jun 15, 1997"
 */
export function formatDOB(dob: string | null | undefined): string {
  if (!dob) return "";
  const d = new Date(dob);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Minimum allowed age (years). Matches PAR-Q+ screening eligibility. */
export const MIN_AGE = 13;
/** Maximum allowed age (years). */
export const MAX_AGE = 100;
