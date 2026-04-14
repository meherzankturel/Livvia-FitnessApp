import { z } from "zod";

export const WorkoutPlanSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  week: z.number().int().min(1),
  day: z.number().int().min(1).max(7),
  focus: z.string(),
  is_rest_day: z.boolean(),
  created_at: z.string().datetime(),
});

export type WorkoutPlan = z.infer<typeof WorkoutPlanSchema>;

export const WorkoutPlanExerciseSchema = z.object({
  id: z.string().uuid(),
  workout_plan_id: z.string().uuid(),
  exercise_id: z.string().uuid(),
  order: z.number().int(),
  target_sets: z.number().int(),
  target_reps: z.number().int(),
  target_rpe: z.number().min(1).max(10).optional(),
  rest_seconds: z.number().int(),
  explain_why: z.string().optional(),
});

export type WorkoutPlanExercise = z.infer<typeof WorkoutPlanExerciseSchema>;

export const WorkoutLogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  workout_plan_id: z.string().uuid(),
  started_at: z.string().datetime(),
  completed_at: z.string().datetime().optional(),
  skipped: z.boolean().default(false),
  life_happened: z.boolean().default(false),
});

export type WorkoutLog = z.infer<typeof WorkoutLogSchema>;

export const SetLogSchema = z.object({
  id: z.string().uuid(),
  workout_log_id: z.string().uuid(),
  exercise_id: z.string().uuid(),
  set_number: z.number().int(),
  reps: z.number().int(),
  weight_kg: z.number(),
  rpe: z.number().min(1).max(10).optional(),
});

export type SetLog = z.infer<typeof SetLogSchema>;
