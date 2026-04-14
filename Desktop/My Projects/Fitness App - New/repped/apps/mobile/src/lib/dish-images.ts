import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Dish Image Manager ──────────────────────────────────────────────────────
// Static mapping of 100 dish names → HD Pexels image URLs.
// Pre-fetched at build time. Instant lookup, zero runtime API calls.
// For new dishes not in the mapping, falls back to Pexels API search.

import DISH_IMAGE_MAP from "./dish-image-urls.json";

const PEXELS_API_KEY = process.env.EXPO_PUBLIC_PEXELS_API_KEY || "";
const CACHE_PREFIX = "dish_img_v3_";
const CACHE_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// ─── Get image URL for a dish (instant) ──────────────────────────────────────
export function getDishImageUrl(dishName: string): string | null {
  // 1. Check static mapping first (instant, covers all 100 dishes)
  const staticUrl = (DISH_IMAGE_MAP as Record<string, string>)[dishName];
  if (staticUrl) return staticUrl;

  // 2. Check fuzzy match — try case-insensitive, trimmed
  const lower = dishName.toLowerCase().trim();
  for (const [key, url] of Object.entries(DISH_IMAGE_MAP as Record<string, string>)) {
    if (key.toLowerCase().trim() === lower) return url;
  }

  return null;
}

// ─── Get image URL with async fallback for unknown dishes ────────────────────
export async function getDishImageUrlAsync(dishName: string): Promise<string | null> {
  // 1. Static mapping (instant)
  const staticUrl = getDishImageUrl(dishName);
  if (staticUrl) return staticUrl;

  // 2. Check AsyncStorage cache (for runtime-fetched new dishes)
  try {
    const key = CACHE_PREFIX + normalizeKey(dishName);
    const cached = await AsyncStorage.getItem(key);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_EXPIRY_MS) {
        return parsed.url;
      }
    }
  } catch {}

  // 3. Fetch from Pexels API (only for dishes NOT in static mapping)
  return fetchDishImage(dishName);
}

// ─── Fetch from Pexels for new/unknown dishes ────────────────────────────────
export async function fetchDishImage(dishName: string): Promise<string | null> {
  if (!PEXELS_API_KEY) return null;

  try {
    const query = dishName
      .replace(/\(.*?\)/g, "")
      .replace(/\+/g, " ")
      .trim();

    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      const imageUrl = data.photos[0].src.large;

      // Cache for future use
      const key = CACHE_PREFIX + normalizeKey(dishName);
      await AsyncStorage.setItem(
        key,
        JSON.stringify({ url: imageUrl, timestamp: Date.now() })
      );

      return imageUrl;
    }

    return null;
  } catch {
    return null;
  }
}

// ─── Pre-fetch images for a meal plan (only fetches unknown dishes) ──────────
export async function prefetchMealPlanImages(
  meals: { name: string }[]
): Promise<void> {
  const uniqueNames = [...new Set(meals.map((m) => m.name))];

  for (const name of uniqueNames) {
    // Skip if already in static mapping
    if (getDishImageUrl(name)) continue;

    // Fetch unknown dishes from API
    await fetchDishImage(name);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "_");
}
