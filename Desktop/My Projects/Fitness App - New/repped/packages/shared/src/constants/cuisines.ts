/**
 * Cuisine system for meal planning.
 * Deep focus on all regions of India + global cuisines.
 */

export const cuisineOptions = [
  "indian_north",
  "indian_south",
  "indian_west",
  "indian_east",
  "mediterranean",
  "east_asian",
  "mexican",
  "american",
  "middle_eastern",
] as const;

export type CuisinePreference = (typeof cuisineOptions)[number];

export const cuisineLabels: Record<CuisinePreference, string> = {
  indian_north: "North Indian",
  indian_south: "South Indian",
  indian_west: "West Indian",
  indian_east: "East Indian",
  mediterranean: "Mediterranean",
  east_asian: "East Asian",
  mexican: "Mexican / Latin",
  american: "American / Western",
  middle_eastern: "Middle Eastern",
};

export const cuisineDescriptions: Record<CuisinePreference, string> = {
  indian_north: "Dal, roti, paneer, tandoori — Punjab, UP, Delhi, Rajasthan",
  indian_south: "Idli, dosa, sambar, rasam — Tamil Nadu, Kerala, Karnataka, AP",
  indian_west: "Dhokla, thepla, poha, vada pav — Gujarat, Maharashtra, Goa",
  indian_east: "Machher jhol, luchi, momos, thukpa — Bengal, Odisha, Assam, NE",
  mediterranean: "Olive oil, hummus, grilled fish, fresh vegetables",
  east_asian: "Stir-fry, tofu, rice bowls, miso — clean and balanced",
  mexican: "Beans, rice, grilled meats, fresh salsa — fiber-rich",
  american: "Grilled chicken, oats, salads, wraps — classic gym food",
  middle_eastern: "Hummus, falafel, shawarma, tabbouleh — protein-rich",
};

export const cuisineEmojis: Record<CuisinePreference, string> = {
  indian_north: "🇮🇳",
  indian_south: "🇮🇳",
  indian_west: "🇮🇳",
  indian_east: "🇮🇳",
  mediterranean: "🫒",
  east_asian: "🥢",
  mexican: "🌮",
  american: "🥗",
  middle_eastern: "🧆",
};
