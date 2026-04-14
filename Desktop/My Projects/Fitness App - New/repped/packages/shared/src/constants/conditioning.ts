/**
 * Conditioning day templates.
 * For users training 4+ days/week, 1-2 days can be dedicated conditioning.
 * Follows Cavaliere's 60/40 strength-to-cardio ratio recommendation.
 */

import type { Equipment } from "../types/user";

export interface ConditioningExercise {
  name: string;
  duration_seconds: number;
  instructions: string;
  type: "hiit" | "steady_state" | "circuit";
}

export interface ConditioningDay {
  name: string;
  description: string;
  exercises: ConditioningExercise[];
  totalDurationMinutes: number;
}

const CONDITIONING_TEMPLATES: Record<Equipment, ConditioningDay[]> = {
  full_gym: [
    {
      name: "HIIT Circuit",
      description: "High-intensity intervals alternating between cardio machines and bodyweight exercises.",
      totalDurationMinutes: 25,
      exercises: [
        { name: "Rowing Machine Intervals", duration_seconds: 180, instructions: "30 sec sprint, 30 sec easy. 3 rounds.", type: "hiit" },
        { name: "Kettlebell Swings", duration_seconds: 120, instructions: "20 swings, rest 30 sec, repeat 3 times.", type: "hiit" },
        { name: "Battle Ropes", duration_seconds: 120, instructions: "30 sec alternating waves, 30 sec rest. 3 rounds.", type: "hiit" },
        { name: "Box Jumps", duration_seconds: 120, instructions: "10 jumps, rest 30 sec. 3 rounds.", type: "hiit" },
        { name: "Assault Bike", duration_seconds: 180, instructions: "20 sec all-out, 40 sec easy. 5 rounds.", type: "hiit" },
        { name: "Farmer's Walk", duration_seconds: 120, instructions: "Heavy carry for 30 meters. Rest 30 sec. 4 rounds.", type: "circuit" },
        { name: "Plank Shoulder Taps", duration_seconds: 90, instructions: "Alternate tapping opposite shoulder from plank. 45 sec work, 15 rest. 2 rounds.", type: "circuit" },
        { name: "Cool-Down Walk", duration_seconds: 180, instructions: "Easy treadmill walk to bring heart rate down.", type: "steady_state" },
      ],
    },
    {
      name: "Cardio Endurance",
      description: "Moderate-intensity steady-state cardio with core work.",
      totalDurationMinutes: 30,
      exercises: [
        { name: "Incline Treadmill Walk", duration_seconds: 600, instructions: "10 minutes at 10-15% incline, 3.5-4 mph. Builds leg endurance without impact.", type: "steady_state" },
        { name: "Stairmaster", duration_seconds: 300, instructions: "5 minutes at moderate pace. Don't lean on the handles.", type: "steady_state" },
        { name: "Plank Hold", duration_seconds: 60, instructions: "60-second plank. Brace hard.", type: "circuit" },
        { name: "Dead Bugs", duration_seconds: 60, instructions: "Slow controlled reps for 60 seconds.", type: "circuit" },
        { name: "Elliptical Intervals", duration_seconds: 480, instructions: "1 min fast, 1 min easy. 4 rounds.", type: "hiit" },
        { name: "Stretching", duration_seconds: 300, instructions: "5 minutes of full-body static stretches. Hold each 30 seconds.", type: "steady_state" },
      ],
    },
  ],
  dumbbells_only: [
    {
      name: "Dumbbell Conditioning Circuit",
      description: "Full-body conditioning using only dumbbells and bodyweight.",
      totalDurationMinutes: 25,
      exercises: [
        { name: "Dumbbell Thrusters", duration_seconds: 120, instructions: "Squat + overhead press in one motion. 10 reps, rest 30 sec. 3 rounds.", type: "circuit" },
        { name: "Renegade Rows", duration_seconds: 120, instructions: "Plank position, row one dumbbell at a time. 8 each side, 3 rounds.", type: "circuit" },
        { name: "Dumbbell Swings", duration_seconds: 90, instructions: "Hinge at hips, swing one dumbbell between legs. 15 reps, 3 rounds.", type: "hiit" },
        { name: "Burpees", duration_seconds: 120, instructions: "Full burpees. 45 sec work, 15 rest. 3 rounds.", type: "hiit" },
        { name: "Mountain Climbers", duration_seconds: 90, instructions: "Fast mountain climbers. 30 sec on, 15 rest. 3 rounds.", type: "hiit" },
        { name: "Dumbbell Farmer's Walk", duration_seconds: 120, instructions: "Walk with heavy dumbbells. 30 sec walk, 30 rest. 3 rounds.", type: "circuit" },
        { name: "Plank to Push-Up", duration_seconds: 90, instructions: "Forearm plank, push up to hands, back down. 30 sec work, 15 rest. 3 rounds.", type: "circuit" },
        { name: "Cool-Down Walk", duration_seconds: 180, instructions: "Easy walk to bring heart rate down.", type: "steady_state" },
      ],
    },
  ],
  home_gym: [
    {
      name: "Home Gym Conditioning Circuit",
      description: "Full-body conditioning using dumbbells, kettlebells, and bodyweight.",
      totalDurationMinutes: 25,
      exercises: [
        { name: "Kettlebell Swings", duration_seconds: 120, instructions: "Hinge at hips, swing kettlebell to chest height. 15 reps, rest 30 sec. 3 rounds.", type: "hiit" },
        { name: "Dumbbell Thrusters", duration_seconds: 120, instructions: "Squat + overhead press in one motion. 10 reps, rest 30 sec. 3 rounds.", type: "circuit" },
        { name: "Renegade Rows", duration_seconds: 120, instructions: "Plank position, row one dumbbell at a time. 8 each side, 3 rounds.", type: "circuit" },
        { name: "Burpees", duration_seconds: 120, instructions: "Full burpees. 45 sec work, 15 rest. 3 rounds.", type: "hiit" },
        { name: "Mountain Climbers", duration_seconds: 90, instructions: "Fast mountain climbers. 30 sec on, 15 rest. 3 rounds.", type: "hiit" },
        { name: "Dumbbell Farmer's Walk", duration_seconds: 120, instructions: "Walk with heavy dumbbells. 30 sec walk, 30 rest. 3 rounds.", type: "circuit" },
        { name: "Plank to Push-Up", duration_seconds: 90, instructions: "Forearm plank, push up to hands, back down. 30 sec work, 15 rest. 3 rounds.", type: "circuit" },
        { name: "Cool-Down Walk", duration_seconds: 180, instructions: "Easy walk to bring heart rate down.", type: "steady_state" },
      ],
    },
  ],
  bodyweight: [
    {
      name: "Bodyweight HIIT",
      description: "No equipment needed. High-intensity bodyweight circuit.",
      totalDurationMinutes: 20,
      exercises: [
        { name: "Burpees", duration_seconds: 120, instructions: "Full burpees. 40 sec work, 20 rest. 3 rounds.", type: "hiit" },
        { name: "Jump Squats", duration_seconds: 90, instructions: "Explosive squat jumps. 30 sec on, 15 rest. 3 rounds.", type: "hiit" },
        { name: "Mountain Climbers", duration_seconds: 90, instructions: "Fast pace. 30 sec on, 15 rest. 3 rounds.", type: "hiit" },
        { name: "High Knees", duration_seconds: 90, instructions: "Drive knees high. 30 sec on, 15 rest. 3 rounds.", type: "hiit" },
        { name: "Push-Up Variations", duration_seconds: 90, instructions: "Regular, wide, diamond — switch every 10 reps.", type: "circuit" },
        { name: "Plank Jacks", duration_seconds: 60, instructions: "In plank, jump feet wide and back. 30 sec on, 15 rest. 2 rounds.", type: "hiit" },
        { name: "Bear Crawl", duration_seconds: 90, instructions: "Forward and backward, 15 sec each direction. 3 rounds.", type: "circuit" },
        { name: "Cool-Down Walk", duration_seconds: 120, instructions: "Easy walk to bring heart rate down.", type: "steady_state" },
      ],
    },
  ],
};

/**
 * Get conditioning day templates for a given equipment level.
 */
export function getConditioningTemplates(equipment: Equipment): ConditioningDay[] {
  return CONDITIONING_TEMPLATES[equipment] || CONDITIONING_TEMPLATES.bodyweight;
}

/**
 * Calculate how many conditioning days to include per week.
 * Follows 60/40 strength-to-cardio ratio.
 * @param daysPerWeek - Total training days per week
 * @returns Number of conditioning days (0 for ≤3 days, 1 for 4, 2 for 5+)
 */
export function getConditioningDayCount(daysPerWeek: number): number {
  if (daysPerWeek <= 3) return 0; // All strength for low-frequency trainers
  if (daysPerWeek === 4) return 1; // 3 strength + 1 conditioning
  return 2; // 3-4 strength + 2 conditioning for 5+ days
}
