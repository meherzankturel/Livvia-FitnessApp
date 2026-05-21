/**
 * Static asset map for achievement badges.
 * React Native requires literal require() calls — paths cannot be dynamic.
 */

import type { ImageSourcePropType } from "react-native";

/** Master badge — gold shield, used as the empty-state hero image. */
export const MASTER_BADGE: ImageSourcePropType = require("../../assets/badges/master-shield-legendary.png");

export const BADGE_IMAGES: Record<string, ImageSourcePropType> = {
  // Workout
  "workout-first_rep":      require("../../assets/badges/workout-first_rep.png"),
  "workout-iron_regular":   require("../../assets/badges/workout-iron_regular.png"),
  "workout-century_club":   require("../../assets/badges/workout-century_club.png"),
  "workout-year_of_iron":   require("../../assets/badges/workout-year_of_iron.png"),
  "workout-perfect_week":   require("../../assets/badges/workout-perfect_week.png"),
  "workout-iron_month":     require("../../assets/badges/workout-iron_month.png"),

  // Streak
  "streak-warming_up":      require("../../assets/badges/streak-warming_up.png"),
  "streak-on_fire":         require("../../assets/badges/streak-on_fire.png"),
  "streak-unstoppable":     require("../../assets/badges/streak-unstoppable.png"),
  "streak-force_of_nature": require("../../assets/badges/streak-force_of_nature.png"),

  // PR
  "pr-new_heights":         require("../../assets/badges/pr-new_heights.png"),
  "pr-record_breaker":      require("../../assets/badges/pr-record_breaker.png"),
  "pr-pr_machine":          require("../../assets/badges/pr-pr_machine.png"),
  "pr-limitless":           require("../../assets/badges/pr-limitless.png"),

  // Milestone
  "milestone-plate_milestone": require("../../assets/badges/milestone-plate_milestone.png"),
  "milestone-two_plates":      require("../../assets/badges/milestone-two_plates.png"),
  "milestone-bw_bench":        require("../../assets/badges/milestone-bw_bench.png"),
  "milestone-three_plates":    require("../../assets/badges/milestone-three_plates.png"),

  // Volume
  "volume-ton_club":        require("../../assets/badges/volume-ton_club.png"),
  "volume-heavy_week":      require("../../assets/badges/volume-heavy_week.png"),
  "volume-mountain_mover":  require("../../assets/badges/volume-mountain_mover.png"),
  "volume-iron_empire":     require("../../assets/badges/volume-iron_empire.png"),

  // Nutrition
  "nutrition-first_bite":   require("../../assets/badges/nutrition-first_bite.png"),
  "nutrition-clean_week":   require("../../assets/badges/nutrition-clean_week.png"),
  "nutrition-macro_master": require("../../assets/badges/nutrition-macro_master.png"),
  "nutrition-clean_month":  require("../../assets/badges/nutrition-clean_month.png"),
  "nutrition-pristine":     require("../../assets/badges/nutrition-pristine.png"),

  // Recovery
  "recovery-self_aware":    require("../../assets/badges/recovery-self_aware.png"),
  "recovery-mind_body":     require("../../assets/badges/recovery-mind_body.png"),
  "recovery-deload_pro":    require("../../assets/badges/recovery-deload_pro.png"),
  "recovery-rest_warrior":  require("../../assets/badges/recovery-rest_warrior.png"),

  // Body Metrics
  "body-scale_check":       require("../../assets/badges/body-scale_check.png"),
  "body-measure_up":        require("../../assets/badges/body-measure_up.png"),
  "body-goal_hit":          require("../../assets/badges/body-goal_hit.png"),

  // Consistency
  "consistency-early_bird":      require("../../assets/badges/consistency-early_bird.png"),
  "consistency-night_owl":       require("../../assets/badges/consistency-night_owl.png"),
  "consistency-weekend_warrior": require("../../assets/badges/consistency-weekend_warrior.png"),
  "consistency-road_warrior":    require("../../assets/badges/consistency-road_warrior.png"),

  // Challenge
  "challenge-monthly_grind": require("../../assets/badges/challenge-monthly_grind.png"),
  "challenge-volume_month":  require("../../assets/badges/challenge-volume_month.png"),
  "challenge-thirty_day":    require("../../assets/badges/challenge-thirty_day.png"),
  "challenge-goal_crusher":  require("../../assets/badges/challenge-goal_crusher.png"),

  // Engagement
  "engagement-welcome_aboard": require("../../assets/badges/engagement-welcome_aboard.png"),
  "engagement-profile_pro":    require("../../assets/badges/engagement-profile_pro.png"),
  "engagement-first_share":    require("../../assets/badges/engagement-first_share.png"),
  "engagement-explorer":       require("../../assets/badges/engagement-explorer.png"),
  "engagement-course_complete":require("../../assets/badges/engagement-course_complete.png"),
};
