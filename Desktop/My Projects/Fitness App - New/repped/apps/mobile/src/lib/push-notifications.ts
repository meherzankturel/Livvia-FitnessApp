/**
 * Push notifications: register the device with Expo's push service and save the
 * resulting token to Supabase so the backend can send "Revive" notifications.
 *
 * Flow:
 *   app launch (signed in) → ask permission → get Expo push token
 *     → upsert into `push_tokens` (user_id, expo_token, platform)
 *   Backend Edge Function reads that token and calls the Expo Push API.
 *
 * Only works on a real device in a dev/TestFlight/production build — NOT Expo Go
 * (remote push was removed from Expo Go in SDK 53+).
 */

import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { supabase } from "./supabase";

// Foreground behaviour: still show the banner + play sound when the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** EAS project id is injected into the config once `eas init`/`build:configure` runs. */
function getProjectId(): string | undefined {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    (Constants as any).easConfig?.projectId
  );
}

/**
 * Request permission, fetch the Expo push token, and store it against the user.
 * Safe to call on every launch — it upserts. No-ops on simulators / Expo Go.
 */
export async function registerForPushNotifications(
  userId: string
): Promise<{ token: string | null; error: Error | null }> {
  try {
    if (!Device.isDevice) {
      return { token: null, error: new Error("Push needs a physical device.") };
    }

    // Android requires a channel for notifications to display.
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== "granted") {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== "granted") {
      return { token: null, error: new Error("Notification permission denied.") };
    }

    const projectId = getProjectId();
    if (!projectId) {
      return { token: null, error: new Error("Missing EAS projectId in app config.") };
    }

    const { data: expoToken } = await Notifications.getExpoPushTokenAsync({ projectId });

    // `push_tokens` is a new table not yet in the generated DB types — cast until
    // types are regenerated (`supabase gen types`) after the migration is applied.
    const { error } = await (supabase as any).from("push_tokens").upsert(
      {
        user_id: userId,
        expo_token: expoToken,
        platform: Platform.OS,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "expo_token" }
    );
    if (error) return { token: expoToken, error: new Error(error.message) };

    return { token: expoToken, error: null };
  } catch (e) {
    return { token: null, error: e instanceof Error ? e : new Error(String(e)) };
  }
}
