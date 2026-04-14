export interface SetData {
  reps: number;
  weight_kg: number;
}

/** Detailed 1RM estimate with confidence range */
export interface Estimated1RMResult {
  estimated: number;
  low: number;
  high: number;
  accurate: boolean;
  note?: string;
}

/**
 * Epley formula for estimated 1 rep max
 */
function epley1RM(weightKg: number, reps: number): number {
  return weightKg * (1 + reps / 30);
}

/**
 * Brzycki formula for estimated 1 rep max
 */
function brzycki1RM(weightKg: number, reps: number): number {
  if (reps >= 37) return weightKg; // formula breaks at 37 reps
  return (weightKg * 36) / (37 - reps);
}

/**
 * Estimated 1RM using the average of Epley and Brzycki formulas.
 *
 * Returns a plain number for backward compatibility.
 * For detailed results with confidence range, use calculateDetailed1RM.
 */
export function calculateEstimated1RM(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  if (reps === 1) return weightKg;

  const avg = (epley1RM(weightKg, reps) + brzycki1RM(weightKg, reps)) / 2;
  return Math.round(avg);
}

/**
 * Detailed 1RM estimation with confidence range and accuracy flag.
 *
 * Uses the average of Epley and Brzycki formulas.
 * Flags estimates based on >10 reps as less reliable.
 *
 * @returns { estimated, low, high, accurate, note? }
 */
export function calculateDetailed1RM(
  weightKg: number,
  reps: number
): Estimated1RMResult {
  if (reps <= 0 || weightKg <= 0) {
    return { estimated: 0, low: 0, high: 0, accurate: true };
  }
  if (reps === 1) {
    return {
      estimated: weightKg,
      low: Math.round(weightKg * 0.85),
      high: Math.round(weightKg * 1.15),
      accurate: true,
    };
  }

  const avg = (epley1RM(weightKg, reps) + brzycki1RM(weightKg, reps)) / 2;
  const estimated = Math.round(avg);
  const low = Math.round(estimated * 0.85);
  const high = Math.round(estimated * 1.15);

  if (reps > 10) {
    return {
      estimated,
      low,
      high,
      accurate: false,
      note: "Estimate less reliable above 10 reps",
    };
  }

  return { estimated, low, high, accurate: true };
}

/**
 * Total volume load = sum of (weight x reps) across all sets
 */
export function calculateVolumeLoad(sets: SetData[]): number {
  return sets.reduce((total, s) => total + s.weight_kg * s.reps, 0);
}

/**
 * Count consecutive weeks with at least one completed workout.
 * Expects dates sorted descending (most recent first).
 */
export function calculateWorkoutStreak(workoutDates: string[]): number {
  if (workoutDates.length === 0) return 0;

  const now = new Date();
  let streak = 0;

  // Get the Monday of the current week
  const getWeekStart = (date: Date): string => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split("T")[0];
  };

  // Group dates by week
  const weeks = new Set<string>();
  for (const dateStr of workoutDates) {
    weeks.add(getWeekStart(new Date(dateStr)));
  }

  // Count consecutive weeks backwards from current week
  const currentWeekStart = getWeekStart(now);
  let checkWeek = new Date(currentWeekStart);

  // Allow current week to not have a workout yet
  if (!weeks.has(currentWeekStart)) {
    checkWeek.setDate(checkWeek.getDate() - 7);
  }

  while (weeks.has(checkWeek.toISOString().split("T")[0])) {
    streak++;
    checkWeek.setDate(checkWeek.getDate() - 7);
  }

  return streak;
}

/**
 * Completion rate = completed / planned workouts
 */
export function calculateCompletionRate(
  plannedWorkouts: number,
  completedWorkouts: number
): number {
  if (plannedWorkouts <= 0) return 0;
  return Math.min(1, completedWorkouts / plannedWorkouts);
}

/**
 * Check if a new set represents a personal record.
 *
 * Compares estimated 1RMs (not just raw weight) so that a set of
 * 50kg x 12 (1RM ~70kg) correctly beats 55kg x 6 (1RM ~65kg).
 *
 * @param currentBestWeight - Previous best weight lifted (for raw weight PR)
 * @param newWeight - Weight of the new set
 * @param newReps - Reps of the new set
 * @param currentBestReps - Reps achieved at currentBestWeight (defaults to 1 for backward compat)
 */
export function detectPersonalRecord(
  currentBestWeight: number | null,
  newWeight: number,
  newReps: number,
  currentBestReps?: number
): { type: "weight" | "estimated_1rm"; value: number } | null {
  const new1RM = calculateEstimated1RM(newWeight, newReps);
  const bestReps = currentBestReps ?? 1;
  const currentBest1RM = currentBestWeight
    ? calculateEstimated1RM(currentBestWeight, bestReps)
    : 0;

  // Raw weight PR — heavier weight regardless of reps
  if (newWeight > (currentBestWeight ?? 0)) {
    return { type: "weight", value: newWeight };
  }

  // Estimated 1RM PR — better calculated strength even at lighter weight
  if (new1RM > currentBest1RM && new1RM > 0) {
    return { type: "estimated_1rm", value: new1RM };
  }

  return null;
}

/**
 * Generate a weekly summary from raw data
 */
export function generateWeeklySummary(data: {
  setLogs: SetData[];
  workoutCount: number;
  plannedWorkouts: number;
  workoutDates: string[];
  prs: { exerciseName: string; value: number; type: string }[];
  weightEntries: number[];
  wellnessLogs: { sleep: number | null; energy: number | null; soreness: number | null }[];
}): {
  totalVolume: number;
  totalWorkouts: number;
  completionRate: number;
  workoutStreak: number;
  personalRecords: { exerciseName: string; value: number; type: string }[];
  weightTrend: number | null;
  avgSleep: number | null;
  avgEnergy: number | null;
  avgSoreness: number | null;
} {
  const totalVolume = calculateVolumeLoad(data.setLogs);
  const completionRate = calculateCompletionRate(data.plannedWorkouts, data.workoutCount);
  const workoutStreak = calculateWorkoutStreak(data.workoutDates);

  // Weight trend
  let weightTrend: number | null = null;
  if (data.weightEntries.length >= 2) {
    weightTrend = data.weightEntries[0] - data.weightEntries[data.weightEntries.length - 1];
  }

  // Wellness averages
  const avg = (nums: (number | null)[]) => {
    const valid = nums.filter((n): n is number => n !== null);
    return valid.length > 0 ? Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10 : null;
  };

  return {
    totalVolume: Math.round(totalVolume),
    totalWorkouts: data.workoutCount,
    completionRate: Math.round(completionRate * 100),
    workoutStreak,
    personalRecords: data.prs,
    weightTrend: weightTrend !== null ? Math.round(weightTrend * 10) / 10 : null,
    avgSleep: avg(data.wellnessLogs.map((w) => w.sleep)),
    avgEnergy: avg(data.wellnessLogs.map((w) => w.energy)),
    avgSoreness: avg(data.wellnessLogs.map((w) => w.soreness)),
  };
}

/**
 * Calculate exercise progress trend over time.
 * Shows how an exercise's weight/volume has changed across sessions.
 */
export interface ExerciseProgressPoint {
  date: string;
  weight_kg: number;
  bestSetReps: number;
  totalVolume: number;
  estimated1RM: number;
}

export function calculateExerciseProgress(
  sessions: { date: string; sets: SetData[] }[]
): ExerciseProgressPoint[] {
  return sessions.map((session) => {
    const bestSet = session.sets.reduce(
      (best, s) => (s.weight_kg > best.weight_kg ? s : best),
      session.sets[0]
    );
    return {
      date: session.date,
      weight_kg: bestSet.weight_kg,
      bestSetReps: bestSet.reps,
      totalVolume: calculateVolumeLoad(session.sets),
      estimated1RM: calculateEstimated1RM(bestSet.weight_kg, bestSet.reps),
    };
  });
}

/**
 * Calculate workout session summary for the journal/history view.
 */
export interface WorkoutSessionSummary {
  date: string;
  focus: string;
  durationMinutes: number;
  exerciseCount: number;
  totalVolume: number;
  totalSets: number;
  prsAchieved: number;
  notes?: string;
}

export function summarizeWorkoutSession(data: {
  date: string;
  focus: string;
  startedAt: string;
  completedAt: string;
  exercises: { name: string; sets: SetData[] }[];
  prsAchieved: number;
  notes?: string;
}): WorkoutSessionSummary {
  const started = new Date(data.startedAt);
  const completed = new Date(data.completedAt);
  const durationMinutes = Math.round((completed.getTime() - started.getTime()) / 60000);

  const allSets = data.exercises.flatMap((ex) => ex.sets);

  return {
    date: data.date,
    focus: data.focus,
    durationMinutes: Math.max(1, durationMinutes),
    exerciseCount: data.exercises.length,
    totalVolume: calculateVolumeLoad(allSets),
    totalSets: allSets.length,
    prsAchieved: data.prsAchieved,
    notes: data.notes,
  };
}

/**
 * Calculate muscle group volume distribution across a week.
 * Useful for showing users which muscles got the most work.
 */
export interface MuscleGroupVolume {
  muscleGroup: string;
  totalSets: number;
  totalVolume: number;
  percentage: number;
}

export function calculateMuscleGroupDistribution(
  exercises: { muscleGroup: string; sets: SetData[] }[]
): MuscleGroupVolume[] {
  const groups = new Map<string, { totalSets: number; totalVolume: number }>();

  for (const ex of exercises) {
    const existing = groups.get(ex.muscleGroup) || { totalSets: 0, totalVolume: 0 };
    existing.totalSets += ex.sets.length;
    existing.totalVolume += calculateVolumeLoad(ex.sets);
    groups.set(ex.muscleGroup, existing);
  }

  const grandTotalVolume = [...groups.values()].reduce((sum, g) => sum + g.totalVolume, 0);

  return [...groups.entries()]
    .map(([muscleGroup, data]) => ({
      muscleGroup,
      totalSets: data.totalSets,
      totalVolume: Math.round(data.totalVolume),
      percentage: grandTotalVolume > 0 ? Math.round((data.totalVolume / grandTotalVolume) * 100) : 0,
    }))
    .sort((a, b) => b.totalVolume - a.totalVolume);
}

/**
 * Calculate strength milestones relative to body weight.
 * Shows users how their lifts compare to common strength standards.
 */
export type StrengthLevel = "beginner" | "novice" | "intermediate" | "advanced" | "elite";

export function getStrengthLevel(
  estimated1RM: number,
  bodyWeight: number,
  exercise: "bench_press" | "squat" | "deadlift" | "overhead_press"
): StrengthLevel {
  const ratio = estimated1RM / bodyWeight;

  // Approximate strength standards (male, rough averages; female ~0.6x)
  const standards: Record<string, number[]> = {
    bench_press: [0.5, 0.75, 1.0, 1.5, 2.0],
    squat: [0.75, 1.0, 1.5, 2.0, 2.5],
    deadlift: [1.0, 1.25, 1.75, 2.5, 3.0],
    overhead_press: [0.35, 0.5, 0.75, 1.0, 1.25],
  };

  const levels: StrengthLevel[] = ["beginner", "novice", "intermediate", "advanced", "elite"];
  const thresholds = standards[exercise] || standards.bench_press;

  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (ratio >= thresholds[i]) return levels[i];
  }

  return "beginner";
}
