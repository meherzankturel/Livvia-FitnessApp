import { Stack } from "expo-router";
import { useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useOnboardingStore } from "@repped/shared";

const ONBOARDING_KEY = "revive_onboarding_progress";

export default function OnboardingLayout() {
  const hydrate = useOnboardingStore((s) => s.hydrate);
  const getSnapshot = useOnboardingStore((s) => s.getSnapshot);
  const hydrated = useRef(false);

  // Restore saved progress on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (stored && !hydrated.current) {
          const parsed = JSON.parse(stored);
          hydrate(parsed);
        }
      } catch {}
      hydrated.current = true;
    })();
  }, []);

  // Auto-save progress whenever store changes
  useEffect(() => {
    if (!hydrated.current) return;
    const unsub = useOnboardingStore.subscribe(() => {
      const snapshot = getSnapshot();
      AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(snapshot)).catch(() => {});
    });
    return unsub;
  }, []);

  return <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />;
}
