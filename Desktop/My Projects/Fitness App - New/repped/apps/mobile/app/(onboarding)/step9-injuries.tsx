import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useOnboardingStore, useAuthStore, calculateTDEE, INJURY_DEFINITIONS } from "@repped/shared";
import { OnboardingLayout } from "../../src/components/onboarding/OnboardingLayout";
import { supabase } from "../../src/lib/supabase";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const C = {
  earth: "#2D2A24",
  bg: "#F6F5F0",
  stone: "#EDEBE5",
  rock: "#8E8E7A",
  trail: "#34D399",
};

const injuryOptions = INJURY_DEFINITIONS.map((def) => ({
  key: def.key,
  label: def.label,
  icon: def.icon,
}));

export default function StepInjuries() {
  const { data, updateData, reset } = useOnboardingStore();
  const session = useAuthStore((s) => s.session);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedKeys = data.current_injuries.map((i) => i.key);

  const toggleInjury = (key: string) => {
    if (selectedKeys.includes(key)) {
      updateData({ current_injuries: data.current_injuries.filter((i) => i.key !== key) });
    } else {
      updateData({
        current_injuries: [
          ...data.current_injuries,
          { key, severity: "moderate" as const, since: new Date().toISOString().split("T")[0] },
        ],
      });
    }
  };

  const handleComplete = async () => {
    if (!session?.user?.id) return;
    if (!data.age || !data.weight_kg || !data.height_cm || !data.sex || !data.activity_level) return;

    setLoading(true);
    setError(null);

    const tdee = calculateTDEE(
      data.weight_kg,
      data.height_cm,
      data.age,
      data.sex,
      data.activity_level
    );

    const { error: dbError } = await supabase.from("profiles").upsert({
      id: session.user.id,
      display_name: data.display_name,
      age: data.age,
      weight_kg: data.weight_kg,
      height_cm: data.height_cm,
      sex: data.sex,
      activity_level: data.activity_level,
      training_history: data.training_history!,
      goal: data.goal!,
      equipment: data.equipment!,
      days_per_week: data.days_per_week!,
      dietary_preference: data.dietary_preference!,
      food_exclusions: data.food_exclusions,
      cuisine_preferences: data.cuisine_preferences,
      current_injuries: data.current_injuries,
      tdee,
      // Health screening (PAR-Q+)
      health_conditions: data.health_conditions,
      health_cleared: data.health_cleared,
      health_screening_completed: true,
      // Training phase (NASM OPT)
      training_phase: data.training_history === "beginner" ? "stabilization" : "hypertrophy",
      phase_start_date: new Date().toISOString().split("T")[0],
      phase_week: 1,
      onboarding_completed: true,
    });

    setLoading(false);

    if (dbError) {
      console.error("Onboarding save error:", dbError.message, dbError.details, dbError.hint);
      setError("Something went wrong. Please try again.");
      return;
    }

    reset();
    await AsyncStorage.removeItem("livvia_onboarding_progress");
    router.replace("/(app)");
  };

  return (
    <OnboardingLayout
      step={8}
      totalSteps={9}
      ctaLabel={loading ? "Saving..." : "Let\u2019s Go"}
      ctaDisabled={loading}
      onCta={handleComplete}
      skipLabel="Skip — no injuries"
      onSkip={handleComplete}
    >
      <Text style={{ color: C.rock, fontSize: 14, fontWeight: "500", marginTop: 16, marginBottom: 6 }}>
        Step 9 of 9
      </Text>
      <Text style={{ fontSize: 26, fontWeight: "700", color: C.earth, marginBottom: 6 }}>
        Any <Text style={{ color: C.trail }}>injuries</Text>?
      </Text>
      <Text style={{ fontSize: 15, color: C.rock, marginBottom: 28 }}>
        We'll modify exercises to keep you safe. Skip if none.
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {injuryOptions.map((injury) => {
          const isSelected = selectedKeys.includes(injury.key);
          return (
            <Pressable
              key={injury.key}
              onPress={() => toggleInjury(injury.key)}
              style={{
                borderRadius: 100,
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: isSelected ? "rgba(245,158,11,0.12)" : C.stone,
                borderWidth: isSelected ? 1 : 0,
                borderColor: isSelected ? "rgba(245,158,11,0.3)" : "transparent",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: isSelected ? "600" : "500",
                  color: isSelected ? "#F59E0B" : C.earth,
                }}
              >
                {injury.icon} {injury.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error && (
        <Text style={{ color: "#EF4444", textAlign: "center", marginTop: 20, fontSize: 14 }}>
          {error}
        </Text>
      )}
    </OnboardingLayout>
  );
}
