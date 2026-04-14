import { z } from "zod";

export const HealthDataSchema = z.object({
  steps: z.number().optional(),
  activeCalories: z.number().optional(),
  restingHeartRate: z.number().optional(),
  sleepHours: z.number().optional(),
  workoutMinutes: z.number().optional(),
  lastSynced: z.string().datetime().optional(),
});

export type HealthData = z.infer<typeof HealthDataSchema>;

/** Readiness score based on health data (0-100) */
export function calculateHealthReadiness(data: Partial<HealthData>): {
  score: number;
  factors: { label: string; status: "good" | "fair" | "poor" }[];
} {
  const factors: { label: string; status: "good" | "fair" | "poor" }[] = [];
  let score = 70; // baseline

  if (data.sleepHours !== undefined) {
    if (data.sleepHours >= 7) {
      score += 10;
      factors.push({ label: "Sleep", status: "good" });
    } else if (data.sleepHours >= 5.5) {
      factors.push({ label: "Sleep", status: "fair" });
    } else {
      score -= 15;
      factors.push({ label: "Sleep", status: "poor" });
    }
  }

  if (data.restingHeartRate !== undefined) {
    if (data.restingHeartRate < 65) {
      score += 10;
      factors.push({ label: "Heart Rate", status: "good" });
    } else if (data.restingHeartRate < 75) {
      factors.push({ label: "Heart Rate", status: "fair" });
    } else {
      score -= 10;
      factors.push({ label: "Heart Rate", status: "poor" });
    }
  }

  if (data.steps !== undefined) {
    if (data.steps > 8000) {
      score += 5;
      factors.push({ label: "Activity", status: "good" });
    } else if (data.steps > 4000) {
      factors.push({ label: "Activity", status: "fair" });
    } else {
      score -= 5;
      factors.push({ label: "Activity", status: "poor" });
    }
  }

  return { score: Math.max(0, Math.min(100, score)), factors };
}
