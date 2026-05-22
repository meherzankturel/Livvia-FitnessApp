/**
 * OAuth helpers for Apple & Google sign-in.
 *
 * Apple: expo-apple-authentication (iOS only — button hidden on Android).
 * Google: expo-auth-session/providers/google — works in Expo Go via hosted
 *         redirect. Requires three OAuth client IDs (iOS, Android, Web).
 *
 * Configure via env (apps/mobile/.env or .env.local):
 *   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
 *   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
 *   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
 *
 * Then enable Google & Apple providers in your Supabase Dashboard
 * (Authentication → Providers) with the matching client IDs.
 */

import { useEffect } from "react";
import { Platform } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "./supabase";

// Required by AuthSession to complete the redirect when control returns to the app
WebBrowser.maybeCompleteAuthSession();

// ─── Apple ──────────────────────────────────────────────────────────────────

export const APPLE_AUTH_AVAILABLE = Platform.OS === "ios";

/** Trigger Apple's native Sign in dialog and exchange the identity token with Supabase. */
export async function signInWithApple(): Promise<{ error: Error | null }> {
  if (!APPLE_AUTH_AVAILABLE) {
    return { error: new Error("Apple Sign In is only available on iOS.") };
  }
  try {
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      return { error: new Error("Apple Sign In isn't available on this device.") };
    }

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      return { error: new Error("Apple didn't return an identity token.") };
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token: credential.identityToken,
    });
    return { error: error ?? null };
  } catch (e: any) {
    if (e?.code === "ERR_REQUEST_CANCELED") return { error: null };
    return { error: e instanceof Error ? e : new Error(String(e)) };
  }
}

// ─── Google ─────────────────────────────────────────────────────────────────

/**
 * Hook for Google sign-in. Returns { promptAsync, ready, error }.
 *
 * Usage in a screen:
 *   const google = useGoogleSignIn();
 *   <Pressable disabled={!google.ready} onPress={() => google.promptAsync()}>...
 */
export function useGoogleSignIn() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId:     process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId:     process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type !== "success") return;
    const idToken = response.params?.id_token;
    if (!idToken) return;
    (async () => {
      await supabase.auth.signInWithIdToken({ provider: "google", token: idToken });
    })();
  }, [response]);

  return {
    ready: !!request,
    promptAsync,
    response,
  };
}
