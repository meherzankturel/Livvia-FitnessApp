/**
 * Revive Achievement System — 47 badges across 11 categories × 4 tiers.
 *
 * Each badge has a unique 3D image asset (see apps/mobile/src/lib/badge-assets.ts).
 * The `imageKey` field maps to the BADGE_IMAGES asset map.
 */

export type BadgeTier = "starter" | "pro" | "elite" | "legendary";

export type BadgeCategory =
  | "workout"
  | "streak"
  | "pr"
  | "milestone"
  | "volume"
  | "nutrition"
  | "recovery"
  | "body"
  | "consistency"
  | "challenge"
  | "engagement";

export interface AchievementDef {
  key: string;
  name: string;
  description: string;
  category: BadgeCategory;
  tier: BadgeTier;
  imageKey: string;
  unlockHint: string;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDef[] = [
  // Workout (6)
  { key: "first_rep",       name: "First Rep",        description: "Completed your first workout. Every journey starts with one rep.",          category: "workout",     tier: "starter",   imageKey: "workout-first_rep",       unlockHint: "Complete any workout." },
  { key: "iron_regular",    name: "Iron Regular",     description: "Completed 50 workouts. You're a serious athlete now.",                       category: "workout",     tier: "pro",       imageKey: "workout-iron_regular",    unlockHint: "Complete 50 workouts total." },
  { key: "century_club",    name: "Century Club",     description: "Completed 100 workouts. Welcome to the century club.",                       category: "workout",     tier: "elite",     imageKey: "workout-century_club",    unlockHint: "Complete 100 workouts total." },
  { key: "year_of_iron",    name: "Year of Iron",     description: "A full year of training. Iron discipline.",                                   category: "workout",     tier: "legendary", imageKey: "workout-year_of_iron",    unlockHint: "Complete 365 workouts." },
  { key: "perfect_week",    name: "Perfect Week",     description: "Hit every planned workout in a single week.",                                category: "workout",     tier: "pro",       imageKey: "workout-perfect_week",    unlockHint: "Complete every workout you scheduled in one week." },
  { key: "iron_month",      name: "Iron Month",       description: "Every planned workout for 30 straight days.",                                category: "workout",     tier: "legendary", imageKey: "workout-iron_month",      unlockHint: "Hit every scheduled workout for a full month." },

  // Streak (4)
  { key: "warming_up",      name: "Warming Up",       description: "A 2-week workout streak. You've built momentum.",                            category: "streak",      tier: "starter",   imageKey: "streak-warming_up",       unlockHint: "Maintain your streak for 2 weeks." },
  { key: "on_fire",         name: "On Fire",          description: "A 4-week workout streak. Habits are forming.",                               category: "streak",      tier: "pro",       imageKey: "streak-on_fire",          unlockHint: "Maintain your streak for a full month." },
  { key: "unstoppable",     name: "Unstoppable",      description: "An 8-week streak. Two months unbroken.",                                      category: "streak",      tier: "elite",     imageKey: "streak-unstoppable",      unlockHint: "Maintain your streak for 8 weeks." },
  { key: "force_of_nature", name: "Force of Nature",  description: "16-week workout streak. Four months without breaking your streak.",          category: "streak",      tier: "legendary", imageKey: "streak-force_of_nature",  unlockHint: "Maintain your streak for 16 weeks." },

  // PR (4)
  { key: "new_heights",     name: "New Heights",      description: "Set your first personal record. The first of many.",                         category: "pr",          tier: "starter",   imageKey: "pr-new_heights",          unlockHint: "Lift more than your previous best on any exercise." },
  { key: "record_breaker",  name: "Record Breaker",   description: "Set 5 personal records. You're rewriting your limits.",                      category: "pr",          tier: "pro",       imageKey: "pr-record_breaker",       unlockHint: "Set 5 PRs across any exercises." },
  { key: "pr_machine",      name: "PR Machine",       description: "20 PRs. You're a PR machine.",                                                category: "pr",          tier: "elite",     imageKey: "pr-pr_machine",           unlockHint: "Set 20 personal records." },
  { key: "limitless",       name: "Limitless",        description: "50 personal records. There's no ceiling.",                                    category: "pr",          tier: "legendary", imageKey: "pr-limitless",            unlockHint: "Set 50 personal records." },

  // Strength Milestones (4)
  { key: "plate_milestone", name: "Plate Milestone",  description: "Lifted 60kg on a compound lift.",                                             category: "milestone",   tier: "starter",   imageKey: "milestone-plate_milestone", unlockHint: "Hit 60kg on bench, squat, or deadlift." },
  { key: "two_plates",      name: "Two Plates",       description: "Lifted 100kg on a compound lift.",                                            category: "milestone",   tier: "pro",       imageKey: "milestone-two_plates",      unlockHint: "Hit 100kg on bench, squat, or deadlift." },
  { key: "bw_bench",        name: "Bodyweight Bench", description: "Benched your own body weight.",                                               category: "milestone",   tier: "elite",     imageKey: "milestone-bw_bench",        unlockHint: "Press your body weight on the bench." },
  { key: "three_plates",    name: "Three Plates",     description: "Lifted 140kg on a compound. Serious strength.",                               category: "milestone",   tier: "legendary", imageKey: "milestone-three_plates",    unlockHint: "Hit 140kg on bench, squat, or deadlift." },

  // Volume (4)
  { key: "ton_club",        name: "Ton Club",         description: "Moved 1,000kg in a single session.",                                          category: "volume",      tier: "starter",   imageKey: "volume-ton_club",         unlockHint: "Total 1,000kg of volume in one workout." },
  { key: "heavy_week",      name: "Heavy Week",       description: "5,000kg in a single week.",                                                   category: "volume",      tier: "pro",       imageKey: "volume-heavy_week",       unlockHint: "Move 5,000kg of volume across one week." },
  { key: "mountain_mover",  name: "Mountain Mover",   description: "25,000kg in a single month.",                                                 category: "volume",      tier: "elite",     imageKey: "volume-mountain_mover",   unlockHint: "Move 25,000kg in 30 days." },
  { key: "iron_empire",     name: "Iron Empire",      description: "100,000kg lifetime volume. Iron empire.",                                     category: "volume",      tier: "legendary", imageKey: "volume-iron_empire",      unlockHint: "Move 100,000kg across all your training." },

  // Nutrition (5)
  { key: "first_bite",      name: "First Bite",       description: "Logged your first meal.",                                                     category: "nutrition",   tier: "starter",   imageKey: "nutrition-first_bite",    unlockHint: "Log any meal in the app." },
  { key: "clean_week",      name: "Clean Week",       description: "7 days of on-plan nutrition.",                                                category: "nutrition",   tier: "pro",       imageKey: "nutrition-clean_week",    unlockHint: "Stick to your meal plan for 7 days." },
  { key: "macro_master",    name: "Macro Master",     description: "Hit macro targets for 7 days.",                                               category: "nutrition",   tier: "pro",       imageKey: "nutrition-macro_master",  unlockHint: "Hit your macros for a week straight." },
  { key: "clean_month",     name: "Clean Month",      description: "30 days of on-plan nutrition.",                                               category: "nutrition",   tier: "elite",     imageKey: "nutrition-clean_month",   unlockHint: "Stick to your meal plan for 30 days." },
  { key: "pristine",        name: "Pristine",         description: "90 days of clean eating. Mastery.",                                           category: "nutrition",   tier: "legendary", imageKey: "nutrition-pristine",      unlockHint: "Stay on plan for 90 straight days." },

  // Recovery (4)
  { key: "self_aware",      name: "Self-Aware",       description: "Completed your first weekly check-in.",                                       category: "recovery",    tier: "starter",   imageKey: "recovery-self_aware",     unlockHint: "Do a weekly check-in from Settings." },
  { key: "mind_body",       name: "Mind & Body",      description: "Logged wellness 7 days straight.",                                            category: "recovery",    tier: "pro",       imageKey: "recovery-mind_body",      unlockHint: "Log a wellness check daily for a week." },
  { key: "deload_pro",      name: "Deload Pro",       description: "Completed a full deload week.",                                               category: "recovery",    tier: "pro",       imageKey: "recovery-deload_pro",     unlockHint: "Complete a planned deload week." },
  { key: "rest_warrior",    name: "Rest Day Warrior", description: "Honored every planned rest day for 30 days.",                                 category: "recovery",    tier: "elite",     imageKey: "recovery-rest_warrior",   unlockHint: "Take every rest day for a month." },

  // Body Metrics (3)
  { key: "scale_check",     name: "Scale Check",      description: "Logged your weight for the first time.",                                      category: "body",        tier: "starter",   imageKey: "body-scale_check",        unlockHint: "Log your body weight." },
  { key: "measure_up",      name: "Measure Up",       description: "Logged body measurements.",                                                   category: "body",        tier: "starter",   imageKey: "body-measure_up",         unlockHint: "Track your body measurements." },
  { key: "goal_hit",        name: "Goal Hit",         description: "Reached a body-weight goal you set.",                                         category: "body",        tier: "elite",     imageKey: "body-goal_hit",           unlockHint: "Hit your target weight goal." },

  // Consistency (4)
  { key: "early_bird",      name: "Early Bird",       description: "Worked out before 8 AM.",                                                     category: "consistency", tier: "starter",   imageKey: "consistency-early_bird",      unlockHint: "Start a workout before 8 AM." },
  { key: "night_owl",       name: "Night Owl",        description: "Worked out after 8 PM.",                                                      category: "consistency", tier: "starter",   imageKey: "consistency-night_owl",       unlockHint: "Start a workout after 8 PM." },
  { key: "weekend_warrior", name: "Weekend Warrior",  description: "Worked out on 4 consecutive weekends.",                                       category: "consistency", tier: "pro",       imageKey: "consistency-weekend_warrior", unlockHint: "Don't skip 4 weekends in a row." },
  { key: "road_warrior",    name: "Road Warrior",     description: "Worked out in 3 different time slots.",                                       category: "consistency", tier: "pro",       imageKey: "consistency-road_warrior",    unlockHint: "Train in AM, midday, and PM." },

  // Challenges (4)
  { key: "monthly_grind",   name: "Monthly Grind",    description: "Complete 15 workouts in a calendar month.",                                   category: "challenge",   tier: "pro",       imageKey: "challenge-monthly_grind", unlockHint: "Finish 15 workouts within the current month." },
  { key: "volume_month",    name: "Volume Month",     description: "10,000kg of volume in one calendar month.",                                   category: "challenge",   tier: "elite",     imageKey: "challenge-volume_month",  unlockHint: "Move 10,000kg this month." },
  { key: "thirty_day",      name: "30-Day Streak",    description: "Work out every day for 30 straight days.",                                    category: "challenge",   tier: "legendary", imageKey: "challenge-thirty_day",    unlockHint: "No rest days for 30 days." },
  { key: "goal_crusher",    name: "Goal Crusher",     description: "Hit weekly target 4 weeks in a row.",                                         category: "challenge",   tier: "pro",       imageKey: "challenge-goal_crusher",  unlockHint: "Hit your weekly goal 4 weeks straight." },

  // Engagement (5)
  { key: "welcome_aboard",  name: "Welcome Aboard",   description: "Completed onboarding. Welcome to Revive.",                                    category: "engagement",  tier: "starter",   imageKey: "engagement-welcome_aboard",  unlockHint: "Finish onboarding." },
  { key: "profile_pro",     name: "Profile Pro",      description: "Filled in all profile fields.",                                               category: "engagement",  tier: "starter",   imageKey: "engagement-profile_pro",     unlockHint: "Complete your profile." },
  { key: "first_share",     name: "First Share",      description: "Shared a workout for the first time.",                                        category: "engagement",  tier: "starter",   imageKey: "engagement-first_share",     unlockHint: "Share any completed workout." },
  { key: "explorer",        name: "Explorer",         description: "Tried 3 different workout types.",                                            category: "engagement",  tier: "pro",       imageKey: "engagement-explorer",        unlockHint: "Try 3 different workout types." },
  { key: "course_complete", name: "Course Complete",  description: "Completed your first training block.",                                       category: "engagement",  tier: "pro",       imageKey: "engagement-course_complete", unlockHint: "Finish a training block." },
];

export const CATEGORY_LABELS: Record<BadgeCategory, string> = {
  workout:     "Workout",
  streak:      "Streaks",
  pr:          "Personal Records",
  milestone:   "Strength",
  volume:      "Volume",
  nutrition:   "Nutrition",
  recovery:    "Recovery",
  body:        "Body Metrics",
  consistency: "Consistency",
  challenge:   "Challenges",
  engagement:  "Engagement",
};

export const CATEGORY_ACCENT: Record<BadgeCategory, string> = {
  workout:     "#F97316",
  streak:      "#22C55E",
  pr:          "#6366F1",
  milestone:   "#06B6D4",
  volume:      "#EF4444",
  nutrition:   "#84CC16",
  recovery:    "#14B8A6",
  body:        "#8b5cf6",
  consistency: "#EAB308",
  challenge:   "#EC4899",
  engagement:  "#A855F7",
};

export const TIER_LABELS: Record<BadgeTier, { label: string; color: string }> = {
  starter:   { label: "Starter",   color: "#A8A8AD" },
  pro:       { label: "Pro",       color: "#B58563" },
  elite:     { label: "Elite",     color: "#E68A6F" },
  legendary: { label: "Legendary", color: "#EAB308" },
};

/** Category display order on the achievements screen */
export const CATEGORY_ORDER: BadgeCategory[] = [
  "workout",
  "streak",
  "pr",
  "milestone",
  "volume",
  "nutrition",
  "recovery",
  "body",
  "consistency",
  "challenge",
  "engagement",
];
