import { useEffect, useState, useCallback } from "react";
import { View } from "react-native";
import { Stack, router, useSegments, useRootNavigationState } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from "@expo-google-fonts/quicksand";
import { useAuthStore } from "@repped/shared";
import { supabase } from "../src/lib/supabase";
import { registerForPushNotifications } from "../src/lib/push-notifications";
import { SplashAnimation } from "../src/components/SplashAnimation";

// Hold the native splash open until JS has mounted and our animated splash overlay is in place.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  const setSession = useAuthStore((s) => s.setSession);
  const session = useAuthStore((s) => s.session);
  const loading = useAuthStore((s) => s.loading);
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  // Bootstrap = "all the things we wait on before showing the real app"
  const [bootstrapDone, setBootstrapDone] = useState(false);
  // Splash overlay unmounts once its exit fade completes
  const [splashUnmounted, setSplashUnmounted] = useState(false);

  // As soon as fonts are loaded, hide the native splash — our JS SplashAnimation
  // (identical cream background) takes over without flicker.
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  // Auth state — hydrate from AsyncStorage on mount, then only react to explicit
  // SIGNED_IN/SIGNED_OUT/TOKEN_REFRESHED events. We deliberately ignore null
  // sessions from INITIAL_SESSION events because they can fire before the
  // persisted session has finished loading and would falsely log the user out.
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      if (s) setSession({ user: { id: s.user.id, email: s.user.email ?? "" } });
      else setSession(null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      if (!mounted) return;
      if (event === "SIGNED_OUT") {
        setSession(null);
      } else if (s && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED")) {
        setSession({ user: { id: s.user.id, email: s.user.email ?? "" } });
      }
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Register this device for push once the user is signed in. Safe to re-run
  // (it upserts); no-ops on simulators / Expo Go. Failures are non-fatal.
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;
    registerForPushNotifications(userId).then(({ error }) => {
      if (error) console.log("[push] registration skipped:", error.message);
    });
  }, [session?.user?.id]);

  // Routing + bootstrap completion
  useEffect(() => {
    if (!fontsLoaded) return;
    if (loading) return;
    if (!navigationState?.key) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
      setBootstrapDone(true);
    } else if (session && inAuthGroup) {
      (async () => {
        try {
          const { data } = await supabase
            .from("profiles")
            .select("onboarding_completed")
            .eq("id", session.user.id)
            .single();
          if ((data as any)?.onboarding_completed) {
            router.replace("/(app)");
          } else {
            router.replace("/(onboarding)/step1-welcome");
          }
        } catch {
          router.replace("/(onboarding)/step1-welcome");
        }
        setBootstrapDone(true);
      })();
    } else {
      setBootstrapDone(true);
    }
  }, [session, loading, segments, navigationState?.key, fontsLoaded]);

  const handleSplashComplete = useCallback(() => {
    setSplashUnmounted(true);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#F5EFE3" }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#F6F5F0" },
          animation: "fade",
        }}
      />
      {!splashUnmounted && (
        <SplashAnimation ready={bootstrapDone} onComplete={handleSplashComplete} />
      )}
    </View>
  );
}
