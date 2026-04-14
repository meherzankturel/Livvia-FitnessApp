import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { useOnboardingStore } from "@repped/shared";
import type { DietaryPreference } from "@repped/shared";
import { OnboardingLayout } from "../../src/components/onboarding/OnboardingLayout";

const C = {
  earth: "#2D2A24",
  bg: "#F6F5F0",
  stone: "#EDEBE5",
  rock: "#8E8E7A",
  trail: "#34D399",
};

const dietOptions: { value: DietaryPreference; label: string }[] = [
  { value: "no_preference", label: "No Preference" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "pescatarian", label: "Pescatarian" },
  { value: "keto", label: "Keto" },
];

const allergyOptions = ["Dairy", "Gluten", "Nuts", "Shellfish", "Soy", "Eggs", "Peanuts", "Fish"];

const cuisineOptions: { emoji: string; label: string; value: string }[] = [
  { emoji: "\u{1F1FA}\u{1F1F8}", label: "American", value: "american" },
  { emoji: "\u{1F1EE}\u{1F1F9}", label: "Italian", value: "italian" },
  { emoji: "\u{1F1EE}\u{1F1F3}", label: "Indian", value: "indian_north" },
  { emoji: "\u{1F1F2}\u{1F1FD}", label: "Mexican", value: "mexican" },
  { emoji: "\u{1F30A}", label: "Mediterranean", value: "mediterranean" },
  { emoji: "\u{1F962}", label: "Asian", value: "asian" },
];

export default function StepNutrition() {
  const { data, updateData } = useOnboardingStore();

  const canContinue = data.dietary_preference !== null;

  const toggleAllergy = (allergy: string) => {
    const val = allergy.toLowerCase();
    const current = data.food_exclusions;
    if (current.includes(val)) {
      updateData({ food_exclusions: current.filter((a) => a !== val) });
    } else {
      updateData({ food_exclusions: [...current, val] });
    }
  };

  const toggleCuisine = (value: string) => {
    const current = data.cuisine_preferences;
    if (current.includes(value)) {
      updateData({ cuisine_preferences: current.filter((c) => c !== value) });
    } else {
      updateData({ cuisine_preferences: [...current, value] });
    }
  };

  return (
    <OnboardingLayout
      step={6}
      totalSteps={8}
      ctaLabel="Continue"
      ctaDisabled={!canContinue}
      onCta={() => router.push("/(onboarding)/step8-injuries")}
    >
      <Text style={{ color: C.rock, fontSize: 14, fontWeight: "500", marginTop: 16, marginBottom: 6 }}>
        Step 7 of 8
      </Text>
      <Text style={{ fontSize: 26, fontWeight: "700", color: C.earth, marginBottom: 6 }}>
        Your <Text style={{ color: C.trail }}>nutrition</Text>
      </Text>
      <Text style={{ fontSize: 15, color: C.rock, marginBottom: 28 }}>
        We'll tailor meal plans to your preferences.
      </Text>

      {/* Section 1: Dietary Preference */}
      <Text style={{ fontSize: 15, fontWeight: "600", color: C.earth, marginBottom: 12 }}>
        Dietary Preference
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        {dietOptions.map((option) => {
          const isSelected = data.dietary_preference === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => updateData({ dietary_preference: option.value })}
              style={{
                borderRadius: 100,
                paddingHorizontal: 16,
                paddingVertical: 10,
                backgroundColor: isSelected ? C.earth : C.stone,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: isSelected ? C.bg : C.earth,
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: "rgba(45,42,36,0.06)", marginBottom: 24 }} />

      {/* Section 2: Allergies */}
      <Text style={{ fontSize: 15, fontWeight: "600", color: C.earth, marginBottom: 12 }}>
        Any food allergies?
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        {allergyOptions.map((allergy) => {
          const isSelected = data.food_exclusions.includes(allergy.toLowerCase());
          return (
            <Pressable
              key={allergy}
              onPress={() => toggleAllergy(allergy)}
              style={{
                borderRadius: 100,
                paddingHorizontal: 16,
                paddingVertical: 10,
                backgroundColor: isSelected ? "rgba(245,158,11,0.12)" : C.stone,
                borderWidth: isSelected ? 1 : 0,
                borderColor: isSelected ? "rgba(245,158,11,0.3)" : "transparent",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: isSelected ? "#F59E0B" : C.earth,
                }}
              >
                {allergy}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: "rgba(45,42,36,0.06)", marginBottom: 24 }} />

      {/* Section 3: Cuisine Preferences */}
      <Text style={{ fontSize: 15, fontWeight: "600", color: C.earth, marginBottom: 4 }}>
        Cuisine Preferences
      </Text>
      <Text style={{ fontSize: 13, color: C.rock, marginBottom: 14 }}>
        Pick as many as you like.
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {cuisineOptions.map((cuisine) => {
          const isSelected = data.cuisine_preferences.includes(cuisine.value);
          return (
            <Pressable
              key={cuisine.value}
              onPress={() => toggleCuisine(cuisine.value)}
              style={{
                width: "48%",
                borderRadius: 16,
                padding: 16,
                backgroundColor: isSelected ? "rgba(52,211,153,0.08)" : C.stone,
                borderWidth: 2,
                borderColor: isSelected ? C.trail : "transparent",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 20 }}>{cuisine.emoji}</Text>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "500",
                  color: C.earth,
                }}
              >
                {cuisine.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </OnboardingLayout>
  );
}
