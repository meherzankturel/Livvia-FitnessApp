/**
 * Livvia Achievement System
 *
 * Badge shapes by category (inspired by Apple's multi-shape approach):
 * - workout: circle
 * - streak: hexagon
 * - progress: shield
 * - nutrition: leaf-shaped
 * - volume: diamond
 * - milestone: star
 * - recovery: circle (soft)
 * - consistency: hexagon
 * - social: circle
 * - challenge: diamond (monthly)
 *
 * Each achievement has a tier: starter | intermediate | advanced | elite
 * More tiers = more badges to chase = higher retention
 */

export type BadgeShape = "circle" | "hexagon" | "shield" | "diamond";
export type BadgeTier = "starter" | "intermediate" | "advanced" | "elite";

export interface AchievementDef {
  key: string;
  name: string;
  description: string;
  icon: string;
  category: "workout" | "streak" | "progress" | "nutrition" | "social" | "consistency" | "volume" | "milestone" | "recovery" | "challenge";
  shape: BadgeShape;
  tier: BadgeTier;
  /** Unlock hint — shown when locked */
  unlockHint: string;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDef[] = [
  // ─── WORKOUT (Circle badges) ─── Progressive milestones
  { key: "first_workout", name: "First Rep", description: "Completed your first workout", icon: "target", category: "workout", shape: "circle", tier: "starter", unlockHint: "Complete any workout to earn this" },
  { key: "10_workouts", name: "Getting Serious", description: "Completed 10 workouts", icon: "dumbbell", category: "workout", shape: "circle", tier: "starter", unlockHint: "Complete 10 workouts total" },
  { key: "25_workouts", name: "Quarter Century", description: "Completed 25 workouts", icon: "dumbbell", category: "workout", shape: "circle", tier: "intermediate", unlockHint: "Complete 25 workouts total" },
  { key: "50_workouts", name: "Iron Regular", description: "Completed 50 workouts", icon: "trophy", category: "workout", shape: "circle", tier: "advanced", unlockHint: "Complete 50 workouts total" },
  { key: "100_workouts", name: "Century Club", description: "Completed 100 workouts", icon: "crown", category: "workout", shape: "circle", tier: "elite", unlockHint: "Complete 100 workouts total" },
  { key: "perfect_week", name: "Perfect Week", description: "Hit every planned workout in a week", icon: "star", category: "workout", shape: "circle", tier: "intermediate", unlockHint: "Don't miss a single planned session this week" },

  // ─── STREAK (Hexagon badges) ─── Consistency over time
  { key: "streak_2", name: "Warming Up", description: "2-week workout streak", icon: "flame", category: "streak", shape: "hexagon", tier: "starter", unlockHint: "Work out consistently for 2 weeks" },
  { key: "streak_4", name: "On Fire", description: "4-week workout streak", icon: "flame", category: "streak", shape: "hexagon", tier: "intermediate", unlockHint: "Maintain your streak for a full month" },
  { key: "streak_8", name: "Unstoppable", description: "8-week workout streak", icon: "flame", category: "streak", shape: "hexagon", tier: "advanced", unlockHint: "Two months of unbroken consistency" },
  { key: "streak_16", name: "Force of Nature", description: "16-week workout streak", icon: "flame", category: "streak", shape: "hexagon", tier: "elite", unlockHint: "Four months without breaking your streak" },
  { key: "iron_month", name: "Iron Month", description: "Every planned day completed for a full month", icon: "calendar", category: "streak", shape: "hexagon", tier: "advanced", unlockHint: "Complete every single planned workout this month" },

  // ─── PROGRESS (Shield badges) ─── Tracking & awareness
  { key: "first_pr", name: "New Heights", description: "Set your first personal record", icon: "chart", category: "progress", shape: "shield", tier: "starter", unlockHint: "Lift more than your previous best on any exercise" },
  { key: "5_prs", name: "Record Breaker", description: "Set 5 personal records", icon: "chart", category: "progress", shape: "shield", tier: "intermediate", unlockHint: "Keep pushing — 5 PRs across any exercises" },
  { key: "20_prs", name: "PR Machine", description: "Set 20 personal records", icon: "chart", category: "progress", shape: "shield", tier: "advanced", unlockHint: "20 personal records — you're rewriting your limits" },
  { key: "weight_logged", name: "Scale Check", description: "Logged your weight for the first time", icon: "scale", category: "progress", shape: "shield", tier: "starter", unlockHint: "Log your body weight in the Progress tab" },
  { key: "measurement_logged", name: "Measure Up", description: "Logged body measurements", icon: "ruler", category: "progress", shape: "shield", tier: "starter", unlockHint: "Track your body measurements" },
  { key: "first_checkin", name: "Self-Aware", description: "Completed your first weekly check-in", icon: "check", category: "progress", shape: "shield", tier: "starter", unlockHint: "Complete a weekly check-in from Settings" },

  // ─── NUTRITION (Circle badges) ───
  { key: "wellness_streak", name: "Mind & Body", description: "Logged wellness for 7 consecutive days", icon: "heart", category: "nutrition", shape: "circle", tier: "intermediate", unlockHint: "Log your wellness check daily for a full week" },
  { key: "clean_week", name: "Clean Week", description: "7 days of on-plan nutrition", icon: "leaf", category: "nutrition", shape: "circle", tier: "intermediate", unlockHint: "Stick to your meal plan for 7 straight days" },
  { key: "clean_month", name: "Clean Machine", description: "30 days of on-plan nutrition", icon: "leaf", category: "nutrition", shape: "circle", tier: "elite", unlockHint: "A full month of clean eating — 85/15 rule mastered" },

  // ─── VOLUME (Diamond badges) ─── Weight moved
  { key: "ton_club", name: "Ton Club", description: "Lifted 1,000kg in a single session", icon: "weight", category: "volume", shape: "diamond", tier: "intermediate", unlockHint: "Move 1 metric ton of weight in one workout" },
  { key: "5_ton_week", name: "5 Ton Week", description: "Lifted 5,000kg in a single week", icon: "weight", category: "volume", shape: "diamond", tier: "advanced", unlockHint: "Total 5,000kg of volume across a week's workouts" },
  { key: "25_ton_month", name: "Iron Mover", description: "Lifted 25,000kg in a single month", icon: "weight", category: "volume", shape: "diamond", tier: "elite", unlockHint: "25 metric tons in 30 days — serious volume" },

  // ─── MILESTONE (Shield badges) ─── Strength achievements
  { key: "60kg_lift", name: "Plate Milestone", description: "Lifted 60kg on any compound", icon: "medal", category: "milestone", shape: "shield", tier: "starter", unlockHint: "Hit 60kg on bench, squat, or deadlift" },
  { key: "100_club", name: "100 Club", description: "Hit 100kg on any compound lift", icon: "medal", category: "milestone", shape: "shield", tier: "advanced", unlockHint: "Reach the 100kg mark on bench, squat, or deadlift" },
  { key: "body_weight_bench", name: "Body Weight Bench", description: "Benched your own body weight", icon: "lightning", category: "milestone", shape: "shield", tier: "elite", unlockHint: "Press your own body weight on the bench" },

  // ─── CONSISTENCY (Hexagon badges) ───
  { key: "early_bird", name: "Early Bird", description: "Worked out before 8am", icon: "sun", category: "consistency", shape: "hexagon", tier: "starter", unlockHint: "Start a workout before 8:00 AM" },
  { key: "night_owl", name: "Night Owl", description: "Worked out after 8pm", icon: "moon", category: "consistency", shape: "hexagon", tier: "starter", unlockHint: "Start a workout after 8:00 PM" },
  { key: "weekend_warrior", name: "Weekend Warrior", description: "Worked out on 4 consecutive weekends", icon: "star", category: "consistency", shape: "hexagon", tier: "intermediate", unlockHint: "Don't skip weekends — 4 in a row" },

  // ─── RECOVERY (Circle badges) ───
  { key: "deload_pro", name: "Deload Pro", description: "Completed a full deload week", icon: "shield", category: "recovery", shape: "circle", tier: "intermediate", unlockHint: "Complete a deload week — recovery is growth" },
  { key: "rest_day_warrior", name: "Rest Day Warrior", description: "Took all planned rest days for a month", icon: "heart", category: "recovery", shape: "circle", tier: "advanced", unlockHint: "Honor every rest day in your plan for 30 days" },

  // ─── SOCIAL (Circle badges) ───
  { key: "shared_workout", name: "First Share", description: "Shared a workout for the first time", icon: "share", category: "social", shape: "circle", tier: "starter", unlockHint: "Share any completed workout" },

  // ─── MONTHLY CHALLENGES (Diamond badges) ─── Rotating
  { key: "challenge_workout_15", name: "Monthly Grind", description: "Complete 15 workouts this month", icon: "calendar", category: "challenge", shape: "diamond", tier: "intermediate", unlockHint: "Finish 15 workouts within the current month" },
  { key: "challenge_volume_10k", name: "Volume Month", description: "Lift 10,000kg total this month", icon: "weight", category: "challenge", shape: "diamond", tier: "advanced", unlockHint: "Move 10,000kg of total volume this month" },
  { key: "challenge_streak_30", name: "30-Day Streak", description: "Work out every day for 30 days", icon: "flame", category: "challenge", shape: "diamond", tier: "elite", unlockHint: "No rest days for 30 days straight — ultimate test" },
];

/** Category accent colors */
export const CATEGORY_ACCENT: Record<string, string> = {
  workout: "#F97316",
  streak: "#22C55E",
  progress: "#6366F1",
  nutrition: "#84CC16",
  volume: "#EF4444",
  milestone: "#06B6D4",
  recovery: "#14B8A6",
  consistency: "#EAB308",
  social: "#A855F7",
  challenge: "#EC4899",
};

/** Category labels */
export const CATEGORY_LABELS: Record<string, string> = {
  workout: "Workout",
  streak: "Streaks",
  progress: "Progress",
  nutrition: "Nutrition",
  volume: "Volume",
  milestone: "Milestones",
  recovery: "Recovery",
  consistency: "Dedication",
  social: "Social",
  challenge: "Monthly Challenges",
};

/** Tier labels */
export const TIER_LABELS: Record<BadgeTier, { label: string; color: string }> = {
  starter: { label: "Starter", color: "#A8A8AD" },
  intermediate: { label: "Pro", color: "#6366F1" },
  advanced: { label: "Elite", color: "#F97316" },
  elite: { label: "Legendary", color: "#EAB308" },
};
