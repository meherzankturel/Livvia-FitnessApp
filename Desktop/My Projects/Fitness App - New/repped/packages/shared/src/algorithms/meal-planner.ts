import type { DietaryPreference, Goal } from "../types/user";
import type { Meal } from "../types/meal";
import { MEAL_TEMPLATES } from "../constants/meals";
import { INDIAN_MEAL_TEMPLATES } from "../constants/indian-meals";
import { calculateMacros, type MacroTargets } from "./macros";

/** Simple seeded random number generator for deterministic daily meals */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

/** Get a numeric seed from today's date */
function getDailySeed(): number {
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
}

/** Counter for regenerate calls — ensures each tap gives a different result */
let regenerateCounter = 0;

export interface DailyMealPlan {
  targets: MacroTargets;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

// ─── Filtering ──────────────────────────────────────────────────────────────────

/**
 * STRICT dietary preference filter.
 * If user is vegetarian/vegan/keto/pescatarian, meals MUST be explicitly tagged
 * with that preference. Meals without tags are EXCLUDED (not included).
 * A vegetarian user should NEVER see a chicken or beef meal.
 */
function filterMealsByPreference(meals: any[], preference: DietaryPreference): any[] {
  if (preference === "no_preference") return meals;
  return meals.filter((m) => {
    const tags = m.tags as string[] | undefined;
    if (!tags || tags.length === 0) return false; // no tags = cannot verify safety, exclude
    return tags.includes(preference);
  });
}

/**
 * STRICT allergen/exclusion filter.
 * If a meal has ANY ingredient matching the user's exclusions, it's removed.
 * Meals without ingredient_tags are EXCLUDED when user has active exclusions
 * (can't verify they're safe).
 */
function filterByExclusions(meals: any[], exclusions: string[]): any[] {
  if (!exclusions || exclusions.length === 0) return meals;
  return meals.filter((m) => {
    const tags = m.ingredient_tags as string[] | undefined;
    if (!tags || tags.length === 0) return false; // no ingredient info = can't verify safety, exclude
    return !tags.some((tag: string) => exclusions.includes(tag.toLowerCase()));
  });
}

/**
 * Goal-based hard filter — removes meals that are clearly inappropriate.
 * A certified dietician would never prescribe these combinations:
 *
 * LOSE FAT: Remove meals with >30g fat per serving (unscaled). High fat = 9cal/g,
 *   blows calorie budget. Also remove meals with <10g protein (not satiating).
 *
 * BUILD MUSCLE: Remove meals with <15g protein. Muscles need amino acids.
 *   Also remove very low calorie meals (<200 cal) — scaling them up creates
 *   unrealistic portions.
 *
 * MAINTAIN: No hard restrictions — variety matters most.
 */
function filterByGoal(meals: any[], goal: Goal): any[] {
  if (goal === "lose_fat") {
    return meals.filter((m) => {
      const fat = m.fat_g || 0;
      const protein = m.protein_g || 0;
      if (fat > 30) return false;   // too calorie-dense for a deficit
      if (protein < 10) return false; // not satiating enough
      return true;
    });
  }
  if (goal === "build_muscle") {
    return meals.filter((m) => {
      const protein = m.protein_g || 0;
      const cal = m.calories || 0;
      if (protein < 15) return false; // not enough protein for growth
      if (cal < 200) return false;    // too small, scaling up = unrealistic
      return true;
    });
  }
  return meals; // maintain — no restrictions
}

function scaleMeal(meal: Meal, factor: number): Meal {
  return {
    ...meal,
    calories: Math.round(meal.calories * factor),
    protein_g: Math.round(meal.protein_g * factor),
    carbs_g: Math.round(meal.carbs_g * factor),
    fat_g: Math.round(meal.fat_g * factor),
  };
}

// ─── Goal-Aware Meal Scoring ────────────────────────────────────────────────────
//
// Instead of random selection, meals are scored by how well they fit the user's goal.
// A small random factor ensures variety across days.
//
// LOSE FAT priorities:
//   - High protein density (g protein per calorie) → preserves muscle in deficit
//   - Low calorie density → user feels more full per calorie
//   - High fiber ingredients (whole grains, vegetables, legumes)
//
// BUILD MUSCLE priorities:
//   - High absolute protein → muscles need amino acids to grow
//   - Moderate-to-high calories → surplus fuels growth
//   - Balanced macros with adequate carbs → carbs fuel workouts
//
// MAINTAIN priorities:
//   - Balanced macros across all three
//   - No strong bias — meal variety matters most
//

function scoreMealForGoal(meal: any, goal: Goal): number {
  const cal = meal.calories || 1;
  const protein = meal.protein_g || 0;
  const carbs = meal.carbs_g || 0;
  const fat = meal.fat_g || 0;

  // Protein density: grams of protein per 100 calories
  const proteinDensity = (protein / cal) * 100;

  // Calorie density: calories per gram of food (approximate from macros)
  // Lower = more filling per calorie
  const totalGrams = protein + carbs + fat;
  const calDensity = totalGrams > 0 ? cal / totalGrams : 5;

  if (goal === "lose_fat") {
    let score = 0;
    // High protein density is king for fat loss (preserves muscle, most satiating macro)
    score += proteinDensity * 0.4; // 0-15 range typically
    // Penalize very high calorie density (greasy, calorie-dense foods are harder to fit in a deficit)
    score -= calDensity * 0.3;
    // Reward meals with decent protein absolute amount
    if (protein >= 25) score += 2;
    if (protein >= 35) score += 1;
    // Penalize very high fat (fat is 9cal/g, blows calorie budget fast)
    if (fat > 30) score -= 2;
    return score;
  }

  if (goal === "build_muscle") {
    let score = 0;
    // Absolute protein matters most for growth — need amino acids
    score += protein * 0.15; // 0-7 range
    // Carbs fuel workouts and aid recovery — reward them
    score += carbs * 0.05;
    // Balanced meals with all three macros score higher
    const balance = 1 - Math.abs(protein * 4 - carbs * 4) / cal;
    score += balance * 2;
    // High calorie is good — surplus drives growth
    if (cal >= 500) score += 1;
    return score;
  }

  // maintain — balanced scoring, no strong bias
  let score = 0;
  score += proteinDensity * 0.2;
  const balance = 1 - Math.abs(protein * 4 - carbs * 4) / cal;
  score += balance * 2;
  return score;
}

// ─── Meal Pool ──────────────────────────────────────────────────────────────────

function getMealPool(
  preference: DietaryPreference,
  exclusions: string[],
  cuisinePreferences?: string[],
  excludeNames?: string[],
  goal?: Goal
): any[] {
  const allTemplates = [...MEAL_TEMPLATES, ...INDIAN_MEAL_TEMPLATES];

  // 1. Strict dietary preference (vegetarian sees ONLY vegetarian-tagged meals)
  let pool = filterMealsByPreference(allTemplates, preference);

  // 2. Strict allergen exclusion (dairy allergy = zero dairy meals)
  pool = filterByExclusions(pool, exclusions);

  // 3. Goal hard filter (fat loss = no high-fat meals, muscle = no low-protein meals)
  if (goal) {
    pool = filterByGoal(pool, goal);
  }

  // 4. Cuisine preference — only show meals from selected cuisines
  if (cuisinePreferences && cuisinePreferences.length > 0) {
    const filtered = pool.filter((m: any) => {
      if (!m.cuisine) return false;
      return cuisinePreferences.includes(m.cuisine);
    });
    // Only apply if we still have enough variety (at least 1 per meal slot)
    if (filtered.length >= 4) pool = filtered;
  }

  // 5. Remove disliked/excluded meals by name
  if (excludeNames && excludeNames.length > 0) {
    pool = pool.filter((m: any) => !excludeNames.includes(m.name));
  }

  return pool;
}

// ─── Goal-Aware Selection ───────────────────────────────────────────────────────
//
// Score all meals in the pool by goal fitness, add a random factor for variety,
// then pick the highest-scoring meal. This means:
//   - Fat loss users get high-protein, low-calorie-density meals most of the time
//   - Muscle building users get high-protein, carb-rich meals
//   - But there's enough randomness that meals rotate across days
//

function selectMealForGoal(
  pool: any[],
  category: string,
  goal: Goal,
  rng: () => number
): any | null {
  const categoryMeals = pool.filter((m: any) => m.category === category);
  const source = categoryMeals.length > 0 ? categoryMeals : pool;
  if (source.length === 0) return null;

  // Score each meal by goal fitness
  const scored = source.map((m: any) => ({
    meal: m,
    score: scoreMealForGoal(m, goal),
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Pick randomly from the top tier (within 30% of best score range)
  // This ensures daily variety while keeping meals goal-appropriate
  const bestScore = scored[0].score;
  const worstScore = scored[scored.length - 1].score;
  const range = bestScore - worstScore;
  const threshold = bestScore - range * 0.3;
  const topTier = scored.filter((s) => s.score >= threshold);

  // Random pick from top tier using the daily seed
  const pick = Math.floor(rng() * topTier.length);
  return topTier[pick].meal;
}

/**
 * Pick alternatives with cuisine diversity + goal awareness.
 * Ensures at least 1 meal from each selected cuisine appears in alternatives.
 * Alternatives are also scored by goal fitness.
 */
function pickDiverseAlternatives(
  pool: any[],
  count: number,
  selectedName: string,
  cuisinePreferences: string[],
  goal: Goal,
  rng: () => number
): any[] {
  const available = pool.filter((m: any) => m.name !== selectedName);
  if (available.length === 0) return [];

  const picked: any[] = [];
  const usedNames = new Set<string>();

  // First pass: pick 1 from each cuisine to ensure diversity
  if (cuisinePreferences.length > 1) {
    for (const cuisine of cuisinePreferences) {
      if (picked.length >= count) break;
      const cuisineMeals = available.filter(
        (m: any) => m.cuisine === cuisine && !usedNames.has(m.name)
      );
      if (cuisineMeals.length > 0) {
        // Pick the best-scoring meal from this cuisine
        const scored = cuisineMeals.map((m: any) => ({
          meal: m,
          score: scoreMealForGoal(m, goal) + rng() * 2,
        }));
        scored.sort((a, b) => b.score - a.score);
        picked.push(scored[0].meal);
        usedNames.add(scored[0].meal.name);
      }
    }
  }

  // Second pass: fill remaining with goal-scored meals
  const remaining = available.filter((m: any) => !usedNames.has(m.name));
  const scored = remaining.map((m: any) => ({
    meal: m,
    score: scoreMealForGoal(m, goal) + rng() * 2,
  }));
  scored.sort((a, b) => b.score - a.score);
  for (const { meal } of scored) {
    if (picked.length >= count) break;
    picked.push(meal);
    usedNames.add(meal.name);
  }

  return picked;
}

// ─── Public API ─────────────────────────────────────────────────────────────────

export function generateDailyMealPlan(
  tdee: number,
  goal: Goal,
  weightKg: number,
  preference: DietaryPreference,
  exclusions: string[] = [],
  cuisinePreferences?: string[]
): DailyMealPlan {
  const targets = calculateMacros(tdee, goal, weightKg);
  const mealSplits = [
    { name: "breakfast", ratio: 0.25 },
    { name: "lunch", ratio: 0.35 },
    { name: "dinner", ratio: 0.3 },
    { name: "snack", ratio: 0.1 },
  ];

  const pool = getMealPool(preference, exclusions, cuisinePreferences, undefined, goal);
  const meals: Meal[] = [];
  const rng = seededRandom(getDailySeed());

  for (const split of mealSplits) {
    const selected = selectMealForGoal(pool, split.name, goal, rng);
    if (selected) {
      const targetCal = targets.calories * split.ratio;
      const factor = targetCal / selected.calories;
      meals.push(scaleMeal(selected, factor));
    }
  }

  return {
    targets,
    meals,
    totalCalories: meals.reduce((s, m) => s + m.calories, 0),
    totalProtein: meals.reduce((s, m) => s + m.protein_g, 0),
    totalCarbs: meals.reduce((s, m) => s + m.carbs_g, 0),
    totalFat: meals.reduce((s, m) => s + m.fat_g, 0),
  };
}

/**
 * Generate meal plan with cuisine-diverse alternatives.
 * Each slot gets 1 selected (goal-scored) + up to 5 alternatives.
 */
export function generateMealPlanWithAlternatives(
  tdee: number,
  goal: Goal,
  weightKg: number,
  preference: DietaryPreference,
  exclusions: string[] = [],
  excludeNames: string[] = [],
  cuisinePreferences?: string[]
): { targets: MacroTargets; slots: { selected: Meal; alternatives: Meal[] }[] } {
  const targets = calculateMacros(tdee, goal, weightKg);
  const mealSplits = [
    { name: "breakfast", ratio: 0.25 },
    { name: "lunch", ratio: 0.35 },
    { name: "dinner", ratio: 0.30 },
    { name: "snack", ratio: 0.10 },
  ];

  const pool = getMealPool(preference, exclusions, cuisinePreferences, excludeNames, goal);
  const rng = seededRandom(getDailySeed());
  const slots: { selected: Meal; alternatives: Meal[] }[] = [];

  for (const split of mealSplits) {
    const categoryMeals = pool.filter((m: any) => m.category === split.name);
    const source = categoryMeals.length > 0 ? categoryMeals : pool;
    const targetCal = targets.calories * split.ratio;

    const selected = selectMealForGoal(pool, split.name, goal, rng);

    if (!selected) {
      slots.push({
        selected: { name: "No match", description: "Try adjusting your preferences.", calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
        alternatives: [],
      });
      continue;
    }

    // Pick diverse, goal-scored alternatives
    const alts = pickDiverseAlternatives(
      source, 5, selected.name, cuisinePreferences || [], goal, rng
    );

    const factor = targetCal / selected.calories;
    slots.push({
      selected: scaleMeal(selected, factor),
      alternatives: alts.map((m: any) => {
        const f = targetCal / m.calories;
        return scaleMeal(m, f);
      }),
    });
  }

  return { targets, slots };
}

/**
 * Regenerate a single meal — always returns a DIFFERENT meal.
 * Uses goal-aware scoring so regenerated meals are still optimized.
 */
export function regenerateSingleMeal(
  category: "breakfast" | "lunch" | "dinner" | "snack",
  targetCalories: number,
  preference: DietaryPreference,
  exclusions: string[] = [],
  excludeNames: string[] = [],
  cuisinePreferences?: string[],
  goal?: Goal
): Meal {
  regenerateCounter++;
  const pool = getMealPool(preference, exclusions, cuisinePreferences, undefined, goal);
  const categoryMeals = pool.filter(
    (m: any) => m.category === category && !excludeNames.includes(m.name)
  );
  const source = categoryMeals.length > 0 ? categoryMeals : pool;

  const rng = seededRandom(getDailySeed() + regenerateCounter * 7919);

  if (source.length === 0) {
    return { name: "No match", description: "Try adjusting your preferences.", calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
  }

  // Goal-aware selection even on regenerate
  if (goal) {
    const scored = source.map((m: any) => ({
      meal: m,
      score: scoreMealForGoal(m, goal) + rng() * 4, // higher random factor on regen for more variety
    }));
    scored.sort((a, b) => b.score - a.score);
    const factor = targetCalories / scored[0].meal.calories;
    return scaleMeal(scored[0].meal, factor);
  }

  // Fallback: random (if goal not provided for backward compatibility)
  const shuffled = [...source].sort(() => rng() - 0.5);
  const factor = targetCalories / shuffled[0].calories;
  return scaleMeal(shuffled[0], factor);
}
