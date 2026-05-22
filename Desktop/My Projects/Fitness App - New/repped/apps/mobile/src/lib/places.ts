// Google Places is called through the authenticated `ext-proxy` Edge Function. The
// API key lives server-side; the proxy also resolves each place's photo to a keyless
// public Google CDN URL (`photoUri`) so no key is ever needed on the device.
import { callProxy } from "./ai-proxy";

export interface PlaceResult {
  name: string;
  address: string;
  rating: number;
  priceLevel: string;
  distance: string;
  isOpen: boolean;
  mapsUrl: string;
  photoUrl: string | null;
  type: "restaurant" | "grocery";
}

/**
 * Search for nearby restaurants serving a specific dish using Google Places Text Search
 */
export async function findNearbyRestaurants(
  mealName: string,
  lat: number,
  lng: number,
  dietaryPreference?: string
): Promise<PlaceResult[]> {
  const dietQuery = dietaryPreference && dietaryPreference !== "no_preference"
    ? ` ${dietaryPreference}` : "";
  const query = `${mealName}${dietQuery} restaurant`;

  try {
    const data = await callProxy<{ places: any[] }>("places-search", {
      textQuery: query,
      lat,
      lng,
      radius: 5000,
      maxResultCount: 6,
    });
    if (!data?.places) return [];

    return data.places.filter((place: any) => {
      // Only show restaurants that are currently open
      const isOpen = place.currentOpeningHours?.openNow ?? true; // default true if unknown
      return isOpen;
    }).map((place: any) => {
      // Calculate rough distance
      const pLat = place.location?.latitude ?? lat;
      const pLng = place.location?.longitude ?? lng;
      const dist = getDistanceKm(lat, lng, pLat, pLng);

      // Price level mapping
      const priceLevels: Record<string, string> = {
        PRICE_LEVEL_FREE: "Free",
        PRICE_LEVEL_INEXPENSIVE: "$",
        PRICE_LEVEL_MODERATE: "$$",
        PRICE_LEVEL_EXPENSIVE: "$$$",
        PRICE_LEVEL_VERY_EXPENSIVE: "$$$$",
      };

      // Keyless photo URL resolved server-side by the proxy.
      const photoUrl: string | null = place.photoUri ?? null;

      return {
        name: place.displayName?.text ?? "Unknown",
        address: place.formattedAddress ?? "",
        rating: place.rating ?? 0,
        priceLevel: priceLevels[place.priceLevel] ?? "$$",
        distance: dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`,
        isOpen: place.currentOpeningHours?.openNow ?? false,
        mapsUrl: place.googleMapsUri ?? `https://www.google.com/maps/search/${encodeURIComponent(place.displayName?.text)}/@${lat},${lng},14z`,
        photoUrl,
        type: "restaurant" as const,
      };
    });
  } catch (error) {
    console.warn("Places API restaurant search failed:", error);
    return [];
  }
}

/**
 * Search for nearby grocery stores
 */
export async function findNearbyGroceryStores(
  lat: number,
  lng: number
): Promise<PlaceResult[]> {
  try {
    const data = await callProxy<{ places: any[] }>("places-search", {
      textQuery: "grocery store supermarket",
      lat,
      lng,
      radius: 8000,
      maxResultCount: 5,
    });
    if (!data?.places) return [];

    return data.places.map((place: any): PlaceResult | null => {
      // Skip places with missing location data
      if (!place.location?.latitude || !place.location?.longitude) return null;

      const pLat = place.location.latitude;
      const pLng = place.location.longitude;
      const dist = getDistanceKm(lat, lng, pLat, pLng);

      const priceLevels: Record<string, string> = {
        PRICE_LEVEL_INEXPENSIVE: "$", PRICE_LEVEL_MODERATE: "$$",
        PRICE_LEVEL_EXPENSIVE: "$$$", PRICE_LEVEL_VERY_EXPENSIVE: "$$$$",
      };

      const photoUrl: string | null = place.photoUri ?? null;

      return {
        name: place.displayName?.text ?? "Unknown",
        address: place.formattedAddress ?? "",
        rating: place.rating ?? 0,
        priceLevel: priceLevels[place.priceLevel] ?? "$$",
        distance: dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`,
        isOpen: place.currentOpeningHours?.openNow ?? false,
        mapsUrl: place.googleMapsUri ?? `https://www.google.com/maps/search/${encodeURIComponent(place.displayName?.text ?? "grocery store")}/@${lat},${lng},14z`,
        photoUrl,
        type: "grocery" as const,
      };
    }).filter((p): p is PlaceResult => p !== null).sort((a: PlaceResult, b: PlaceResult) => {
      // Sort by distance (nearest first) — convert everything to meters
      const toMeters = (d: string): number => {
        const num = parseFloat(d) || 999;
        if (d.includes("km")) return num * 1000;
        return num; // already in meters
      };
      return toMeters(a.distance) - toMeters(b.distance);
    });
  } catch (error) {
    console.warn("Places API grocery search failed:", error);
    return [];
  }
}

/** Haversine distance in km */
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
