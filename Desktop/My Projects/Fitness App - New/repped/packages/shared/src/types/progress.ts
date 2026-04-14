import { z } from "zod";

export const BodyMeasurementSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  date: z.string(),
  waist_cm: z.number().positive().nullable(),
  chest_cm: z.number().positive().nullable(),
  left_arm_cm: z.number().positive().nullable(),
  right_arm_cm: z.number().positive().nullable(),
  left_thigh_cm: z.number().positive().nullable(),
  right_thigh_cm: z.number().positive().nullable(),
  notes: z.string().nullable(),
});
export type BodyMeasurement = z.infer<typeof BodyMeasurementSchema>;

export const PersonalRecordSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  exercise_id: z.string().uuid(),
  record_type: z.enum(["weight", "estimated_1rm", "volume"]),
  value: z.number().positive(),
  achieved_at: z.string().datetime(),
  workout_log_id: z.string().uuid().nullable(),
});
export type PersonalRecord = z.infer<typeof PersonalRecordSchema>;

export const WellnessLogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  date: z.string(),
  sleep_quality: z.number().int().min(1).max(5).nullable(),
  energy_level: z.number().int().min(1).max(5).nullable(),
  soreness_level: z.number().int().min(1).max(5).nullable(),
  nutrition_adherence: z.enum(["yes", "mostly", "no"]).nullable(),
});
export type WellnessLog = z.infer<typeof WellnessLogSchema>;

export const AchievementSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  category: z.enum(["workout", "streak", "progress", "nutrition"]),
});
export type Achievement = z.infer<typeof AchievementSchema>;

export const UserAchievementSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  achievement_id: z.string().uuid(),
  achieved_at: z.string().datetime(),
});
export type UserAchievement = z.infer<typeof UserAchievementSchema>;

export interface WeeklySummary {
  totalVolume: number;
  totalWorkouts: number;
  completionRate: number;
  workoutStreak: number;
  personalRecords: { exerciseName: string; value: number; type: string }[];
  weightTrend: number | null;
  avgSleep: number | null;
  avgEnergy: number | null;
  avgSoreness: number | null;
}
