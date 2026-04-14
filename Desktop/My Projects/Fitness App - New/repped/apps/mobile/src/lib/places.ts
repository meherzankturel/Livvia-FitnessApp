const PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ?? "";

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
  if (!PLACES_API_KEY) return [];

  const dietQuery = dietaryPreference && dietaryPreference !== "no_preference"
    ? ` ${dietaryPreference}` : "";
  const query = `${mealName}${dietQuery} restaurant`;

  try {
    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": PLACES_API_KEY,
          "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.rating,places.priceLevel,places.currentOpeningHours,places.googleMapsUri,places.photos,places.location",
        },
        body: JSON.stringify({
          textQuery: query,
          locationBias: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius: 5000.0, // 5km radius
            },
          },
          maxResultCount: 6,
        }),
      }
    );

    const data = await response.json();
    if (!data.places) return [];

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

      // Photo URL
      let photoUrl: string | null = null;
      if (place.photos?.[0]?.name) {
        photoUrl = `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxHeightPx=200&maxWidthPx=300&key=${PLACES_API_KEY}`;
      }

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
  if (!PLACES_API_KEY) return [];

  try {
    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": PLACES_API_KEY,
          "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.rating,places.priceLevel,places.currentOpeningHours,places.googleMapsUri,places.location",
        },
        body: JSON.stringify({
          textQuery: "grocery store supermarket",
          locationBias: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius: 8000.0,
            },
          },
          maxResultCount: 5,
        }),
      }
    );

    const data = await response.json();
    if (!data.places) return [];

    return data.places.map((place: any) => {
      const pLat = place.location?.latitude ?? lat;
      const pLng = place.location?.longitude ?? lng;
      const dist = getDistanceKm(lat, lng, pLat, pLng);

      const priceLevels: Record<string, string> = {
        PRICE_LEVEL_INEXPENSIVE: "$", PRICE_LEVEL_MODERATE: "$$",
        PRICE_LEVEL_EXPENSIVE: "$$$", PRICE_LEVEL_VERY_EXPENSIVE: "$$$$",
      };

      return {
        name: place.displayName?.text ?? "Unknown",
        address: place.formattedAddress ?? "",
        rating: place.rating ?? 0,
        priceLevel: priceLevels[place.priceLevel] ?? "$$",
        distance: dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`,
        isOpen: place.currentOpeningHours?.openNow ?? false,
        mapsUrl: place.googleMapsUri ?? "",
        photoUrl: null,
        type: "grocery" as const,
      };
    }).sort((a: PlaceResult, b: PlaceResult) => {
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
