import { useEffect, useState } from "react";
import { Stack, router, useSegments, useRootNavigationState } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "@repped/shared";
import { supabase } from "../src/lib/supabase";

export default function RootLayout() {
  const setSession = useAuthStore((s) => s.setSession);
  const session = useAuthStore((s) => s.session);
  const loading = useAuthStore((s) => s.loading);
  const segments = useSegments();
  const navigationState = useRootNavigationState();

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
    } else if (session && inAuthGroup) {
      // Check onboarding status
      supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", session.user.id)
        .single()
        .then(({ data }) => {
          if ((data as any)?.onboarding_completed) {
            router.replace("/(app)");
          } else {
            router.replace("/(onboarding)/step1-welcome");
          }
        })
        .catch(() => {
          // No profile yet = needs onboarding
          router.replace("/(onboarding)/step1-welcome");
        });
    }
  }, [session, loading, segments, navigationState?.key]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#F6F5F0" },
          animation: "fade",
        }}
      />
    </>
  );
}
