import { View, Text, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { router } from "expo-router";
import { useOnboardingStore, useAuthStore, calculateTDEE, INJURY_DEFINITIONS } from "@repped/shared";
import type { DietaryPreference } from "@repped/shared";
import { useState } from "react";
import { supabase } from "../../src/lib/supabase";

const options: { value: DietaryPreference; label: string }[] = [
  { value: "no_preference", label: "No Preference" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "pescatarian", label: "Pescatarian" },
  { value: "keto", label: "Keto" },
];

export default function StepDiet() {
  const { data, updateData, reset } = useOnboardingStore();
  const session = useAuthStore((s) => s.session);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOnboardingInjuries, setSelectedOnboardingInjuries] = useState<string[]>([]);
  const toggleOnboardingInjury = (key: string) => {
    setSelectedOnboardingInjuries(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const canContinue = data.dietary_preference !== null;

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
      current_injuries: selectedOnboardingInjuries.map(key => ({ key, severity: "moderate" as const, since: new Date().toISOString().split("T")[0] })),
      tdee,
      onboarding_completed: true,
    });

    setLoading(false);

    if (dbError) {
      setError("Something went wrong. Please try again.");
      return;
    }

    reset();
    router.replace("/(app)");
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0C0C0F" }} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={{ paddingHorizontal: 24, paddingTop: 80 }}>
        <Text style={{ color: "rgba(246,245,240,0.3)", fontSize: 16, marginBottom: 8 }}>Step 7 of 7</Text>
        <Text style={{ color: "#F6F5F0", fontSize: 28, fontWeight: "700", marginBottom: 8 }}>Diet</Text>
        <Text style={{ color: "rgba(246,245,240,0.5)", fontSize: 16, marginBottom: 32 }}>
          Any dietary preferences? We'll tailor your meal suggestions.
        </Text>

        <View style={{ gap: 12, marginBottom: 24 }}>
          {options.map((option) => {
            const isSelected = data.dietary_preference === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => updateData({ dietary_preference: option.value })}
                style={{
                  borderRadius: 16,
                  padding: 20,
                  backgroundColor: isSelected ? "#34D399" : "rgba(246,245,240,0.08)",
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: isSelected ? "#0C0C0F" : "#F6F5F0",
                  }}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={{ color: "rgba(246,245,240,0.5)", fontSize: 18, marginBottom: 12, marginTop: 24 }}>
          Any current injuries?
        </Text>
        <Text style={{ color: "rgba(246,245,240,0.3)", fontSize: 14, marginBottom: 16 }}>
          We'll modify your workout plan to keep you safe.
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {INJURY_DEFINITIONS.map((def) => {
            const isSelected = selectedOnboardingInjuries.includes(def.key);
            return (
              <Pressable
                key={def.key}
                onPress={() => toggleOnboardingInjury(def.key)}
                style={{
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: isSelected ? "rgba(249,115,22,0.15)" : "rgba(246,245,240,0.08)",
                  borderWidth: isSelected ? 1 : 0,
                  borderColor: isSelected ? "rgba(249,115,22,0.5)" : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: isSelected ? "#FB923C" : "rgba(246,245,240,0.5)",
                    fontWeight: isSelected ? "600" : "400",
                  }}
                >
                  {def.icon} {def.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {error && (
          <Text style={{ color: "#EF4444", textAlign: "center", marginBottom: 16 }}>{error}</Text>
        )}

        <View style={{ flexDirection: "row", gap: 16 }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "rgba(246,245,240,0.08)",
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "rgba(246,245,240,0.5)", fontSize: 18 }}>Back</Text>
          </Pressable>
          <Pressable
            onPress={handleComplete}
            disabled={!canContinue || loading}
            style={{
              flex: 1,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
              backgroundColor: canContinue && !loading ? "#34D399" : "rgba(246,245,240,0.06)",
            }}
          >
            {loading ? (
              <ActivityIndicator color="#34D399" />
            ) : (
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: canContinue ? "#0C0C0F" : "rgba(246,245,240,0.2)",
                }}
              >
                Let's Go
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
