import type { DietaryPreference, Goal, MeatPreference } from "../types/user";
import { meatOptions } from "../types/user";
import type { Meal } from "../types/meal";
import { MEAL_TEMPLATES } from "../constants/meals";
import { INDIAN_MEAL_TEMPLATES } from "../constants/indian-meals";
import { cuisineOptions } from "../constants/cuisines";
import { calculateMacros, type MacroTargets } from "./macros";

/** All cuisines as a plain array, used when the user has no explicit preference. */
const ALL_CUISINES: string[] = [...cuisineOptions];

/** Shuffle a copy of an array using the provided RNG. */
function shuffleWith<T>(arr: T[], rng: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

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
 * STRICT meat preference filter for non-vegetarian users.
 * If a user selects specific meats (e.g., only chicken), meals containing
 * OTHER meats are excluded. Vegetarian/vegan meals are always kept (no meat).
 * Only applies when preference is "no_preference" and meatPreferences is non-empty.
 */
const ALL_MEAT_TAGS = meatOptions as readonly string[];
// Map fish-type ingredient tags to their meat preference key
const MEAT_TAG_ALIASES: Record<string, string> = {
  salmon: "fish",
  tuna: "fish",
  cod: "fish",
  tilapia: "fish",
  hilsa_fish: "fish",
  shellfish: "shrimp",
  bacon: "pork",
  ham: "pork",
};

function filterByMeatPreference(meals: any[], meatPreferences: MeatPreference[]): any[] {
  if (!meatPreferences || meatPreferences.length === 0) return meals;

  return meals.filter((m) => {
    const ingredientTags = m.ingredient_tags as string[] | undefined;
    if (!ingredientTags || ingredientTags.length === 0) return true;

    // Find which meats this meal contains
    const meatInMeal: string[] = [];
    for (const tag of ingredientTags) {
      const t = tag.toLowerCase();
      if (ALL_MEAT_TAGS.includes(t)) {
        meatInMeal.push(t);
      } else if (MEAT_TAG_ALIASES[t]) {
        meatInMeal.push(MEAT_TAG_ALIASES[t]);
      }
    }

    // If meal has no meat (vegetarian-friendly), keep it — adds variety
    if (meatInMeal.length === 0) return true;

    // If meal contains meat, ALL meats in it must be in user's preferred list
    return meatInMeal.every((meat) => meatPreferences.includes(meat as MeatPreference));
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
      if (m.category !== "snack" && protein < 10) return false; // snacks can be lighter on protein
      if (fat > 30) return false;   // too calorie-dense for a deficit
      return true;
    });
  }
  if (goal === "build_muscle") {
    return meals.filter((m) => {
      const protein = m.protein_g || 0;
      const cal = m.calories || 0;
      // Snacks are inherently small (~10% of TDEE) and get scaled down, not up —
      // calorie/protein minimums for full meals don't apply.
      if (m.category === "snack") return true;
      if (protein < 15) return false; // not enough protein for growth
      if (cal < 200) return false;    // too small, scaling up = unrealistic
      return true;
    });
  }
  return meals; // maintain — no restrictions
}

// ─── Amount Parsing / Formatting ────────────────────────────────────────────────
// Ingredient amounts are strings: "3", "1/2", "1/3", "4-5", "pinch"
// We need to parse them to scale with the calorie factor, then format back.

const UNSCALABLE_UNITS = new Set(["pinch", "pinch each", "spray", "to taste", "dash"]);

/** Parse a string amount into a number. Handles fractions and ranges. */
function parseAmount(amount: string): number {
  const trimmed = amount.trim();

  // Fraction: "1/2", "1/3", "1/4"
  const fracMatch = trimmed.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fracMatch) return Number(fracMatch[1]) / Number(fracMatch[2]);

  // Mixed number: "1 1/2"
  const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixedMatch) return Number(mixedMatch[1]) + Number(mixedMatch[2]) / Number(mixedMatch[3]);

  // Range: "4-5" → take midpoint
  const rangeMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$/);
  if (rangeMatch) return (Number(rangeMatch[1]) + Number(rangeMatch[2])) / 2;

  // Simple number
  const num = parseFloat(trimmed);
  return isNaN(num) ? 1 : num;
}

/** Format a number back into a clean amount string. */
function formatAmount(num: number): string {
  if (num <= 0) return "1";

  // Whole numbers
  if (Math.abs(num - Math.round(num)) < 0.05) return String(Math.round(num));

  // Common fractions
  const fractions: [number, string][] = [
    [0.25, "1/4"], [0.333, "1/3"], [0.5, "1/2"], [0.667, "2/3"], [0.75, "3/4"],
  ];
  const whole = Math.floor(num);
  const frac = num - whole;
  for (const [val, str] of fractions) {
    if (Math.abs(frac - val) < 0.05) {
      return whole > 0 ? `${whole} ${str}` : str;
    }
  }

  // Fallback: 1 decimal
  return String(Math.round(num * 10) / 10);
}

// ─── Goal-based portion scaling ─────────────────────────────────────────────
// Single multiplier per user goal. Applied to recipe macros + ingredients with
// smart rounding so users see edible quantities (no fractional eggs).
const GOAL_PORTION_MULTIPLIER: Record<Goal, number> = {
  lose_fat: 0.75,        // smaller plate, calorie deficit
  maintain: 1.0,         // recipes are authored at maintain level
  build_muscle: 1.30,    // bigger plate, calorie surplus
};

// Units where the ingredient is counted (eggs, rotis, slices). Scale → integer.
const WHOLE_UNITS = new Set([
  "large", "medium", "small", "whole", "piece", "pieces",
  "slices", "slice", "leaf", "leaves", "cloves", "clove",
  "stalk", "stalks", "wedge", "wedges", "stick",
]);

/** Scale an ingredient amount by a multiplier, using rules per unit type. */
function smartScaleAmount(amount: string, unit: string, mult: number): string {
  const u = (unit || "").toLowerCase();
  if (UNSCALABLE_UNITS.has(u)) return amount;
  const value = parseAmount(amount);
  if (!value) return amount;

  const scaled = value * mult;

  // Whole-count units: round to nearest integer, never go below 1
  if (WHOLE_UNITS.has(u)) {
    return String(Math.max(1, Math.round(scaled)));
  }

  // Small spice amounts (≤ 1 tsp/tbsp): don't scale — keeps flavor consistent
  if ((u === "tsp" || u === "tbsp") && value <= 1) {
    return amount;
  }

  // Weight in grams: round to nearest 5g (cleaner numbers for users)
  if (u === "g" || u === "grams") {
    return String(Math.max(5, Math.round(scaled / 5) * 5));
  }
  if (u === "kg") {
    return String(Math.round(scaled * 10) / 10);
  }
  if (u === "ml") {
    return String(Math.max(5, Math.round(scaled / 5) * 5));
  }

  // Volume (cup, tbsp, tsp): round to nearest 1/4
  const rounded = Math.round(scaled * 4) / 4;
  return formatAmount(rounded);
}

/** Apply user-goal-based portion adjustment to a meal. Returns a new Meal
 *  with macros scaled and ingredient amounts smart-rounded. */
function applyGoalPortion(meal: Meal, goal: Goal): Meal {
  const mult = GOAL_PORTION_MULTIPLIER[goal];
  if (mult === 1) return meal;
  const mealAny = meal as any;
  const scaled: any = {
    ...meal,
    calories: Math.round(meal.calories * mult),
    protein_g: Math.round(meal.protein_g * mult),
    carbs_g: Math.round(meal.carbs_g * mult),
    fat_g: Math.round(meal.fat_g * mult),
  };
  if (mealAny.recipe?.ingredients) {
    scaled.recipe = {
      ...mealAny.recipe,
      ingredients: mealAny.recipe.ingredients.map((ing: any) => ({
        ...ing,
        amount: smartScaleAmount(ing.amount, ing.unit || "", mult),
      })),
    };
  }
  return scaled;
}

function scaleMeal(meal: Meal, factor: number): Meal {
  const scaled: any = {
    ...meal,
    calories: Math.round(meal.calories * factor),
    protein_g: Math.round(meal.protein_g * factor),
    carbs_g: Math.round(meal.carbs_g * factor),
    fat_g: Math.round(meal.fat_g * factor),
  };

  // Scale recipe ingredients if present (templates carry recipe via spread)
  const mealAny = meal as any;
  if (mealAny.recipe?.ingredients) {
    scaled.recipe = {
      ...mealAny.recipe,
      ingredients: mealAny.recipe.ingredients.map((ing: any) => {
        if (UNSCALABLE_UNITS.has(ing.unit?.toLowerCase())) return { ...ing };
        return {
          ...ing,
          amount: formatAmount(parseAmount(ing.amount) * factor),
        };
      }),
    };
  }

  return scaled;
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
  goal?: Goal,
  meatPreferences?: MeatPreference[]
): any[] {
  const allTemplates = [...MEAL_TEMPLATES, ...INDIAN_MEAL_TEMPLATES];

  // 1. Strict dietary preference (vegetarian sees ONLY vegetarian-tagged meals)
  let pool = filterMealsByPreference(allTemplates, preference);

  // 2. Strict allergen exclusion (dairy allergy = zero dairy meals)
  pool = filterByExclusions(pool, exclusions);

  // 3. Meat preference filter (non-veg users who only want specific meats)
  if (preference === "no_preference" && meatPreferences && meatPreferences.length > 0) {
    pool = filterByMeatPreference(pool, meatPreferences);
  }

  // 4. Goal hard filter (fat loss = no high-fat meals, muscle = no low-protein meals)
  if (goal) {
    pool = filterByGoal(pool, goal);
  }

  // 5. Cuisine preference — only show meals from selected cuisines
  if (cuisinePreferences && cuisinePreferences.length > 0) {
    const filtered = pool.filter((m: any) => {
      if (!m.cuisine) return false;
      return cuisinePreferences.includes(m.cuisine);
    });
    // Only apply if we still have enough variety (at least 1 per meal slot)
    if (filtered.length >= 4) pool = filtered;
  }

  // 6. Remove disliked/excluded meals by name
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
  // STRICT category enforcement — never silently return a meal from a different
  // category (e.g. a dinner for a snack slot). Caller decides how to handle null.
  const categoryMeals = pool.filter((m: any) => m.category === category);
  if (categoryMeals.length === 0) return null;

  // Score each meal by goal fitness
  const scored = categoryMeals.map((m: any) => ({
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

  // Treat empty preference as "all cuisines" so a default user sees a balanced
  // sample instead of whatever cuisine dominates the data by volume.
  const effectiveCuisines = cuisinePreferences.length > 0
    ? cuisinePreferences
    : ALL_CUISINES;

  // First pass: pick 1 from each cuisine to ensure diversity (shuffled so the
  // same cuisine doesn't anchor slot 1 every call).
  if (effectiveCuisines.length > 1) {
    for (const cuisine of shuffleWith(effectiveCuisines, rng)) {
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
  cuisinePreferences?: string[],
  meatPreferences?: MeatPreference[],
  dayOffset: number = 0
): DailyMealPlan {
  const targets = calculateMacros(tdee, goal, weightKg);
  const mealSplits = [
    { name: "breakfast", ratio: 0.25 },
    { name: "lunch", ratio: 0.35 },
    { name: "dinner", ratio: 0.3 },
    { name: "snack", ratio: 0.1 },
  ];

  const pool = getMealPool(preference, exclusions, cuisinePreferences, undefined, goal, meatPreferences);
  const meals: Meal[] = [];
  const rng = seededRandom(getDailySeed() + dayOffset);

  for (const split of mealSplits) {
    const selected = selectMealForGoal(pool, split.name, goal, rng);
    if (selected) {
      // Apply user-goal portion adjustment (see applyGoalPortion).
      meals.push(applyGoalPortion(selected, goal));
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
 * Generate a full 7-day meal plan with ingredient overlap optimization.
 * Days 1-6 get a small scoring bonus for meals that share ingredients with
 * earlier days — this reduces grocery waste and cost without forcing identical meals.
 */
export function generateWeeklyMealPlan(
  tdee: number,
  goal: Goal,
  weightKg: number,
  preference: DietaryPreference,
  exclusions: string[] = [],
  cuisinePreferences?: string[],
  meatPreferences?: MeatPreference[]
): DailyMealPlan[] {
  const targets = calculateMacros(tdee, goal, weightKg);
  const mealSplits = [
    { name: "breakfast", ratio: 0.25 },
    { name: "lunch", ratio: 0.35 },
    { name: "dinner", ratio: 0.3 },
    { name: "snack", ratio: 0.1 },
  ];

  const pool = getMealPool(preference, exclusions, cuisinePreferences, undefined, goal, meatPreferences);
  const baseSeed = getDailySeed();
  const usedIngredients = new Set<string>();
  const weekPlans: DailyMealPlan[] = [];

  for (let day = 0; day < 7; day++) {
    const rng = seededRandom(baseSeed + day);
    const meals: Meal[] = [];

    for (const split of mealSplits) {
      const categoryMeals = pool.filter((m: any) => m.category === split.name);
      const source = categoryMeals.length > 0 ? categoryMeals : pool;
      if (source.length === 0) continue;

      // Score each meal: goal fitness + ingredient overlap bonus
      const scored = source.map((m: any) => {
        let score = scoreMealForGoal(m, goal) + rng() * 2;

        // On days 1+, add a bonus for meals that reuse ingredients from earlier days
        if (day > 0 && m.recipe?.ingredients) {
          const overlap = m.recipe.ingredients.filter(
            (ing: any) => usedIngredients.has(ing.name.toLowerCase())
          ).length;
          score += overlap * 1.5;
        }

        return { meal: m, score };
      });

      scored.sort((a, b) => b.score - a.score);

      // Pick from top tier for variety
      const bestScore = scored[0].score;
      const worstScore = scored[scored.length - 1].score;
      const range = bestScore - worstScore;
      const threshold = bestScore - range * 0.3;
      const topTier = scored.filter((s) => s.score >= threshold);
      const pick = Math.floor(rng() * topTier.length);
      const selected = topTier[pick].meal;

      // Apply user-goal portion adjustment (see applyGoalPortion).
      meals.push(applyGoalPortion(selected, goal));

      // Track ingredients for overlap scoring on subsequent days
      if (selected.recipe?.ingredients) {
        for (const ing of selected.recipe.ingredients) {
          usedIngredients.add(ing.name.toLowerCase());
        }
      }
    }

    weekPlans.push({
      targets,
      meals,
      totalCalories: meals.reduce((s, m) => s + m.calories, 0),
      totalProtein: meals.reduce((s, m) => s + m.protein_g, 0),
      totalCarbs: meals.reduce((s, m) => s + m.carbs_g, 0),
      totalFat: meals.reduce((s, m) => s + m.fat_g, 0),
    });
  }

  return weekPlans;
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
  cuisinePreferences?: string[],
  meatPreferences?: MeatPreference[]
): { targets: MacroTargets; slots: { selected: Meal; alternatives: Meal[] }[] } {
  const targets = calculateMacros(tdee, goal, weightKg);
  const mealSplits = [
    { name: "breakfast", ratio: 0.25 },
    { name: "lunch", ratio: 0.35 },
    { name: "dinner", ratio: 0.30 },
    { name: "snack", ratio: 0.10 },
  ];

  const pool = getMealPool(preference, exclusions, cuisinePreferences, excludeNames, goal, meatPreferences);
  const rng = seededRandom(getDailySeed());
  const slots: { selected: Meal; alternatives: Meal[] }[] = [];

  // Find a category-appropriate pool by progressively relaxing constraints.
  // Snack pool is small and may be wiped out by cuisine/goal filters — never let
  // the snack slot show a dinner meal.
  const poolForCategory = (category: string): any[] => {
    const inMain = pool.filter((m: any) => m.category === category);
    if (inMain.length > 0) return inMain;
    // Drop cuisine filter (e.g. user picked Italian only — has no snacks)
    const noCuisine = getMealPool(preference, exclusions, undefined, excludeNames, goal, meatPreferences)
      .filter((m: any) => m.category === category);
    if (noCuisine.length > 0) return noCuisine;
    // Drop goal filter (e.g. build_muscle wiped out the snack pool)
    return getMealPool(preference, exclusions, undefined, excludeNames, undefined, meatPreferences)
      .filter((m: any) => m.category === category);
  };

  // Distribute the 4 meal slots across different cuisines when the user has
  // multi-cuisine appetite (either explicit ≥2 or no preference). Each slot
  // gets its own cuisine assignment; if that cuisine has no meals for the
  // category, we fall back to the unfiltered source for that slot only.
  const effectiveCuisines = (cuisinePreferences && cuisinePreferences.length > 0)
    ? cuisinePreferences
    : ALL_CUISINES;
  const shouldDistribute = effectiveCuisines.length > 1;
  const slotCuisines: (string | null)[] = shouldDistribute
    ? shuffleWith(effectiveCuisines, rng).slice(0, mealSplits.length)
    : mealSplits.map(() => null);
  // If we have fewer cuisines than slots, repeat (rare — 4 slots, ≥2 cuisines)
  while (slotCuisines.length < mealSplits.length) {
    slotCuisines.push(slotCuisines[slotCuisines.length % effectiveCuisines.length] || null);
  }

  mealSplits.forEach((split, i) => {
    const baseSource = poolForCategory(split.name);
    const assigned = slotCuisines[i];
    // Apply per-slot cuisine filter only if the assigned cuisine has meals in
    // this category. Otherwise use the broader category pool.
    const cuisineFiltered = assigned
      ? baseSource.filter((m: any) => m.cuisine === assigned)
      : baseSource;
    const source = cuisineFiltered.length > 0 ? cuisineFiltered : baseSource;
    const targetCal = targets.calories * split.ratio;

    const selected = selectMealForGoal(source, split.name, goal, rng);

    if (!selected) {
      slots.push({
        selected: { name: "No match", description: "Try adjusting your preferences.", calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
        alternatives: [],
      });
      return;
    }

    // Alternatives draw from the full category pool (not per-slot cuisine),
    // so the user can swap across cuisines if they want.
    const alts = pickDiverseAlternatives(
      baseSource, 5, selected.name, cuisinePreferences || [], goal, rng
    );

    // Apply user-goal portion adjustment (lose_fat 0.75× · maintain 1.0× ·
    // build_muscle 1.30×). Recipes are AUTHORED at maintain — this scales
    // each meal's macros + ingredient amounts (with smart rounding so we
    // never show fractional eggs or 0.3 rotis).
    slots.push({
      selected: applyGoalPortion(selected, goal),
      alternatives: alts.map((m) => applyGoalPortion(m, goal)),
    });
  });

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
  goal?: Goal,
  meatPreferences?: MeatPreference[]
): Meal {
  regenerateCounter++;

  // Find meals in the requested category by progressively relaxing constraints.
  // We NEVER fall back to a different category — a snack swap must yield a snack.
  const buildSource = (): any[] => {
    // Tier 1: full filters (cuisine + goal) + exclusions
    let pool = getMealPool(preference, exclusions, cuisinePreferences, undefined, goal, meatPreferences);
    let categoryMeals = pool.filter(
      (m: any) => m.category === category && !excludeNames.includes(m.name)
    );
    if (categoryMeals.length > 0) return categoryMeals;

    // Tier 2: drop exclusions (user has cycled through every fresh option in this category — allow repeats)
    categoryMeals = pool.filter((m: any) => m.category === category);
    if (categoryMeals.length > 0) return categoryMeals;

    // Tier 3: drop cuisine filter (user picked cuisines that have no meals in this category)
    pool = getMealPool(preference, exclusions, undefined, undefined, goal, meatPreferences);
    categoryMeals = pool.filter((m: any) => m.category === category);
    if (categoryMeals.length > 0) return categoryMeals;

    // Tier 4: drop goal filter (goal restrictions wiped out the whole category)
    pool = getMealPool(preference, exclusions, undefined, undefined, undefined, meatPreferences);
    return pool.filter((m: any) => m.category === category);
  };

  const source = buildSource();
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
    return applyGoalPortion(scored[0].meal, goal);
  }

  // Fallback: random (if goal not provided for backward compatibility)
  const shuffled = [...source].sort(() => rng() - 0.5);
  return shuffled[0];
}
