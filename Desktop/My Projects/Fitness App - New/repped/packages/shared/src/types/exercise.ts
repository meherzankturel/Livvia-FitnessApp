import { z } from "zod";

export const muscleGroups = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "quads",
  "hamstrings",
  "glutes",
  "calves",
  "core",
  "full_body",
] as const;
export type MuscleGroup = (typeof muscleGroups)[number];

export const difficultyLevels = ["beginner", "intermediate", "advanced"] as const;
export type Difficulty = (typeof difficultyLevels)[number];

export const ExerciseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  muscle_group: z.enum(muscleGroups),
  equipment: z.array(z.string()),
  difficulty: z.enum(difficultyLevels),
  instructions: z.string(),
  explain_eli5: z.string(),
  default_sets: z.number().int(),
  default_reps: z.number().int(),
  default_rest_seconds: z.number().int(),
  animation_url: z.string().url().nullable().optional(),
  secondary_muscles: z.array(z.string()).default([]),
});

export type Exercise = z.infer<typeof ExerciseSchema>;
