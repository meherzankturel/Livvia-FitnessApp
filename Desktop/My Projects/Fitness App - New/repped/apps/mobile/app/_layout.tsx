import { useEffect, useRef, useCallback } from "react";
import { Animated } from "react-native";
import { Stack, router, useSegments, useRootNavigationState } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useAuthStore } from "@repped/shared";
import { supabase } from "../src/lib/supabase";

// Keep splash visible while we resolve auth
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const setSession = useAuthStore((s) => s.setSession);
  const session = useAuthStore((s) => s.session);
  const loading = useAuthStore((s) => s.loading);
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const splashHidden = useRef(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const hideSplash = useCallback(() => {
    if (splashHidden.current) return;
    splashHidden.current = true;
    SplashScreen.hideAsync();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s) {
        setSession({ user: { id: s.user.id, email: s.user.email ?? "" } });
      } else {
        setSession(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s) {
        setSession({ user: { id: s.user.id, email: s.user.email ?? "" } });
      } else {
        setSession(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Wait for both auth check AND router to be ready
    if (loading) return;
    if (!navigationState?.key) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
      hideSplash();
    } else if (session && inAuthGroup) {
      // Check onboarding status
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
        hideSplash();
      })();
    } else {
      // Already on the right screen
      hideSplash();
    }
  }, [session, loading, segments, navigationState?.key]);

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#F6F5F0" },
          animation: "fade",
        }}
      />
    </Animated.View>
  );
}
