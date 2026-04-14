import { z } from "zod";

export const sexOptions = ["male", "female"] as const;
export type Sex = (typeof sexOptions)[number];

export const activityLevels = [
  "sedentary",
  "lightly_active",
  "moderately_active",
  "very_active",
  "extremely_active",
] as const;
export type ActivityLevel = (typeof activityLevels)[number];

export const trainingHistoryOptions = [
  "beginner",
  "intermediate",
  "advanced",
] as const;
export type TrainingHistory = (typeof trainingHistoryOptions)[number];

export const goalOptions = ["lose_fat", "maintain", "build_muscle"] as const;
export type Goal = (typeof goalOptions)[number];

export const equipmentOptions = [
  "full_gym",
  "dumbbells_only",
  "home_gym",
  "bodyweight",
] as const;
export type Equipment = (typeof equipmentOptions)[number];

export const dietaryPreferences = [
  "no_preference",
  "vegetarian",
  "vegan",
  "pescatarian",
  "keto",
] as const;
export type DietaryPreference = (typeof dietaryPreferences)[number];

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  age: z.number().int().min(13).max(100),
  weight_kg: z.number().positive(),
  height_cm: z.number().positive(),
  sex: z.enum(sexOptions),
  activity_level: z.enum(activityLevels),
  training_history: z.enum(trainingHistoryOptions),
  goal: z.enum(goalOptions),
  equipment: z.enum(equipmentOptions),
  days_per_week: z.number().int().min(2).max(7),
  dietary_preference: z.enum(dietaryPreferences),
  tdee: z.number().positive().optional(),
  onboarding_completed: z.boolean().default(false),
  food_exclusions: z.array(z.string()).default([]),
  cuisine_preferences: z.array(z.string()).default(["american"]),
  apple_health_connected: z.boolean().default(false),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
