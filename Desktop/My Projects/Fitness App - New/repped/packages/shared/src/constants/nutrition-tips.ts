/**
 * Goal-based nutrition guidance.
 * Simple, directional tips — no calorie counting required.
 * Combines Magnus Method's 85/15 rule with Cavaliere's plate method.
 */

import type { Goal } from "../types/user";

export interface NutritionGuidance {
  /** The user's goal */
  goal: Goal;
  /** One-line headline */
  headline: string;
  /** The plate method breakdown */
  plateMethod: {
    vegetables: string;
    protein: string;
    carbs: string;
    description: string;
  };
  /** Key principles (3-5 per goal) */
  principles: string[];
  /** The 85/15 rule explanation */
  consistencyRule: string;
  /** Quick meal examples */
  quickMealIdeas: string[];
  /** What to avoid */
  avoid: string[];
}

export const NUTRITION_GUIDANCE: Record<Goal, NutritionGuidance> = {
  lose_fat: {
    goal: "lose_fat",
    headline: "Eat smart, not less. Prioritize protein and vegetables.",
    plateMethod: {
      vegetables: "Half your plate",
      protein: "Quarter of your plate",
      carbs: "Quarter of your plate (smaller portion)",
      description: "Fill your plate with vegetables first (the biggest portion), then protein, then a small portion of starchy carbs. This naturally reduces calories without counting.",
    },
    principles: [
      "Protein at every meal — it keeps you full and preserves muscle while losing fat.",
      "Eat vegetables first. They fill you up with minimal calories.",
      "Reduce starchy carbs (rice, bread, pasta) but don't eliminate them — just eat smaller portions.",
      "Drink water before meals. Often what feels like hunger is actually thirst.",
      "Avoid liquid calories — sodas, juices, and fancy coffee drinks add up fast.",
    ],
    consistencyRule: "Follow the 85/15 rule: 17 out of 20 meals should be on-plan. The other 3? Enjoy guilt-free. This isn't a prison — it's a lifestyle. Perfect diets fail because no one can sustain them.",
    quickMealIdeas: [
      "Grilled chicken + huge salad + small portion of rice",
      "Eggs + sautéed vegetables + one slice of toast",
      "Fish + steamed broccoli + sweet potato (half)",
      "Greek yogurt + berries + a handful of nuts",
    ],
    avoid: [
      "Sugary drinks and juices",
      "Fried foods as a daily habit",
      "Skipping meals (leads to overeating later)",
      "Extreme diets — they always backfire",
    ],
  },
  maintain: {
    goal: "maintain",
    headline: "Balanced eating. No extremes. Fuel your training.",
    plateMethod: {
      vegetables: "Third of your plate",
      protein: "Third of your plate",
      carbs: "Third of your plate",
      description: "Equal portions of vegetables, protein, and carbs. You're not trying to lose or gain — just fuel your body well and keep performing.",
    },
    principles: [
      "Eat enough protein to maintain muscle — roughly a palm-sized portion at each meal.",
      "Don't fear carbs — they fuel your workouts. Eat them around training.",
      "Keep meals varied. Eat different colors, different proteins, different grains.",
      "Listen to your body. Eat when hungry, stop when satisfied.",
      "Stay hydrated — 2-3 liters of water daily, more on training days.",
    ],
    consistencyRule: "Follow the 85/15 rule: eat well most of the time, enjoy life the rest. You're maintaining — this should feel sustainable and easy, not restrictive.",
    quickMealIdeas: [
      "Chicken stir-fry with rice and mixed vegetables",
      "Salmon + quinoa + roasted vegetables",
      "Pasta with lean meat sauce and a side salad",
      "Omelette with vegetables + toast + fruit",
    ],
    avoid: [
      "Overthinking your food choices",
      "Skipping meals regularly",
      "Relying on processed foods as your main diet",
      "Extreme restriction or binge cycles",
    ],
  },
  build_muscle: {
    goal: "build_muscle",
    headline: "Eat big to get big. Protein is king, carbs are fuel.",
    plateMethod: {
      vegetables: "Quarter of your plate",
      protein: "Third of your plate (generous portion)",
      carbs: "Rest of your plate (largest portion)",
      description: "Carbs take center stage — they fuel hard training and recovery. Protein is generous. Vegetables are still there, but you need the calories from carbs and protein more.",
    },
    principles: [
      "Protein at every meal — aim for a palm-and-a-half sized portion. This is non-negotiable for muscle growth.",
      "Carbs are your best friend. Eat more rice, potatoes, oats, and bread — especially around workouts.",
      "Eat before and after training. Pre-workout carbs fuel performance; post-workout protein + carbs fuel recovery.",
      "If you're not gaining weight, eat more. Add an extra snack or make portions bigger.",
      "Healthy fats matter — nuts, avocado, olive oil. They support hormones that build muscle.",
    ],
    consistencyRule: "Follow the 85/15 rule: eat big and clean most of the time. Your 15% can be pizza, burgers, whatever — extra calories actually help when bulking. Just don't make junk food your primary fuel.",
    quickMealIdeas: [
      "Double chicken breast + large portion of rice + vegetables",
      "4-egg omelette + oats + banana + peanut butter",
      "Steak + baked potato + broccoli + butter",
      "Protein shake + banana + oats + peanut butter (post-workout)",
    ],
    avoid: [
      "Undereating — the #1 reason people fail to build muscle",
      "Skipping post-workout meals",
      "Avoiding carbs (you need them to grow)",
      "Dirty bulking (all junk food) — you'll gain more fat than muscle",
    ],
  },
};

/**
 * Get nutrition guidance for a user's goal.
 */
export function getNutritionGuidance(goal: Goal): NutritionGuidance {
  return NUTRITION_GUIDANCE[goal];
}
