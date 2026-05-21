/**
 * Cuisine system for meal planning. 8 cuisines total.
 * Asian is a unified bucket (Thai / Chinese / Japanese / Korean / Vietnamese).
 * Italian and French are first-class options. Mediterranean stays separate.
 */

export const cuisineOptions = [
  "indian",
  "asian",
  "mediterranean",
  "italian",
  "french",
  "mexican",
  "american",
  "middle_eastern",
] as const;

export type CuisinePreference = (typeof cuisineOptions)[number];

export const cuisineLabels: Record<CuisinePreference, string> = {
  indian: "Indian",
  asian: "Asian",
  mediterranean: "Mediterranean",
  italian: "Italian",
  french: "French",
  mexican: "Mexican / Latin",
  american: "American / Western",
  middle_eastern: "Middle Eastern",
};

export const cuisineDescriptions: Record<CuisinePreference, string> = {
  indian: "Curries, breads, rice, dosa, dhokla, momos — all regional Indian dishes",
  asian: "Stir-fry, sushi, ramen, pad thai, bibimbap — all East and Southeast Asian dishes",
  mediterranean: "Olive oil, hummus, grilled fish, fresh vegetables",
  italian: "Pasta, risotto, frittata, bruschetta — classic Italian cooking",
  french: "Omelettes, ratatouille, salade niçoise — refined French staples",
  mexican: "Beans, rice, grilled meats, fresh salsa — fiber-rich",
  american: "Grilled chicken, oats, salads, wraps — classic gym food",
  middle_eastern: "Hummus, falafel, shawarma, tabbouleh — protein-rich",
};

export const cuisineEmojis: Record<CuisinePreference, string> = {
  indian: "🇮🇳",
  asian: "🥢",
  mediterranean: "🫒",
  italian: "🍝",
  french: "🥐",
  mexican: "🌮",
  american: "🥗",
  middle_eastern: "🧆",
};
