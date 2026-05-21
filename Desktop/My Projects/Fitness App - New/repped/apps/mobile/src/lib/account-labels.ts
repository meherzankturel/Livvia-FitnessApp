/** Human-readable labels for picker values across all Account sub-screens. */

export const GOAL_LABELS: Record<string, string> = {
  lose_fat: "Lose Fat",
  maintain: "Stay Fit",
  build_muscle: "Build Muscle",
};

export const EXPERIENCE_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const EQUIPMENT_LABELS: Record<string, string> = {
  full_gym: "Full Gym",
  dumbbells_only: "Dumbbells Only",
  home_gym: "Home Gym",
  bodyweight: "Bodyweight",
};

export const DIET_LABELS: Record<string, string> = {
  no_preference: "Non-Veg",
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  pescatarian: "Pescatarian",
  keto: "Keto",
};

export const MEAT_LABELS: Record<string, string> = {
  any: "Any",
  chicken: "Chicken Only",
  beef: "Beef Only",
  white: "White Meat Only",
  no_pork_beef: "No Pork or Beef",
};

export const INJURY_LABELS: Record<string, string> = {
  shoulder: "Shoulder",
  lower_back: "Lower Back",
  knee: "Knee",
  wrist: "Wrist",
  elbow: "Elbow",
};

/** Common food allergens. Stored as strings in profile.food_exclusions. */
export const ALLERGEN_LABELS: Record<string, string> = {
  dairy: "Dairy",
  gluten: "Gluten",
  nuts: "Nuts",
  shellfish: "Shellfish",
  eggs: "Eggs",
};

export const CUISINE_LABELS: Record<string, string> = {
  indian: "🇮🇳 Indian",
  mediterranean: "🫒 Mediterranean",
  east_asian: "🥢 East Asian",
  mexican: "🌮 Mexican",
  american: "🥗 American",
  middle_eastern: "🧆 Middle Eastern",
};

export function labelMulti<T extends string>(
  values: T[] | null | undefined,
  labels: Record<string, string>,
  emptyLabel = "None"
): string {
  if (!values || values.length === 0) return emptyLabel;
  if (values.length === 1) return labels[values[0]] ?? values[0];
  return `${values.length} selected`;
}
