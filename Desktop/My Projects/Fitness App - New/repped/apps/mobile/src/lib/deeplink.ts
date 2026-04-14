import { Linking, Platform } from "react-native";

/**
 * Smart deep linking — tries native app first, falls back to browser.
 *
 * Strategy: Try openURL with app scheme directly. If it fails (app not installed),
 * catch the error and fall back to web URL. This works in Expo Go where
 * canOpenURL returns false for custom schemes.
 */

/** Open YouTube search */
export async function openYouTube(searchQuery: string): Promise<void> {
  const encoded = encodeURIComponent(searchQuery);
  const webUrl = `https://www.youtube.com/results?search_query=${encoded}`;

  if (Platform.OS === "ios") {
    // On iOS, just use the universal link — iOS will open YouTube app if installed
    await Linking.openURL(webUrl);
  } else {
    await openWithFallback(
      `vnd.youtube://results?search_query=${encoded}`,
      webUrl
    );
  }
}

/** Open UberEats search */
export async function openUberEats(query: string): Promise<void> {
  const encoded = encodeURIComponent(query);
  // Use universal link — iOS opens the app if installed
  await Linking.openURL(`https://www.ubereats.com/search?q=${encoded}`);
}

/** Open DoorDash search */
export async function openDoorDash(query: string): Promise<void> {
  const encoded = encodeURIComponent(query);
  await Linking.openURL(`https://www.doordash.com/search/store/${encoded}`);
}

/** Open Google Maps search */
export async function openMaps(query: string, lat?: number, lng?: number): Promise<void> {
  const encoded = encodeURIComponent(query);

  if (Platform.OS === "ios") {
    // Apple Maps universal link — always works on iOS
    const appleMapsUrl = `https://maps.apple.com/?q=${encoded}${lat ? `&ll=${lat},${lng}` : ""}`;
    await Linking.openURL(appleMapsUrl);
  } else {
    const webUrl = lat
      ? `https://www.google.com/maps/search/${encoded}/@${lat},${lng},14z`
      : `https://www.google.com/maps/search/${encoded}`;
    await Linking.openURL(webUrl);
  }
}

/** Open a specific Google Maps URL (from Places API) */
export async function openMapsUrl(mapsUrl: string): Promise<void> {
  if (Platform.OS === "ios") {
    // Convert Google Maps URL to Apple Maps if possible
    // Extract the place name from the URL for Apple Maps
    try {
      const url = new URL(mapsUrl);
      const pathParts = url.pathname.split("/");
      const placeIdx = pathParts.indexOf("place");
      if (placeIdx !== -1 && pathParts[placeIdx + 1]) {
        const placeName = decodeURIComponent(pathParts[placeIdx + 1].replace(/\+/g, " "));
        await Linking.openURL(`https://maps.apple.com/?q=${encodeURIComponent(placeName)}`);
        return;
      }
    } catch {
      // URL parsing failed — fall through
    }
  }

  // Fallback: open the URL directly (works for Google Maps links)
  await Linking.openURL(mapsUrl);
}

/**
 * Try app URL, fall back to web on failure. (Android only)
 */
async function openWithFallback(appUrl: string, webUrl: string): Promise<void> {
  try {
    const canOpen = await Linking.canOpenURL(appUrl);
    if (canOpen) {
      await Linking.openURL(appUrl);
      return;
    }
  } catch {
    // App not installed
  }
  await Linking.openURL(webUrl);
}
