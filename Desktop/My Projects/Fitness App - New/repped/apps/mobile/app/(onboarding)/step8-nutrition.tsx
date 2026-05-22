import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { useOnboardingStore } from "@repped/shared";
import type { DietaryPreference, MeatPreference } from "@repped/shared";
import { OnboardingLayout } from "../../src/components/onboarding/OnboardingLayout";

const C = {
  earth: "#2D2A24",
  bg: "#F6F5F0",
  stone: "#EDEBE5",
  rock: "#8E8E7A",
  trail: "#34D399",
};

const dietOptions: { value: DietaryPreference; label: string }[] = [
  { value: "no_preference", label: "Non-Veg" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "pescatarian", label: "Pescatarian" },
  { value: "keto", label: "Keto" },
];

const allergyOptions = ["Dairy", "Gluten", "Nuts", "Shellfish", "Soy", "Eggs", "Peanuts", "Fish"];

type MeatPresetId = "any" | "chicken" | "beef" | "white" | "no_pork_beef";

// Each preset maps to a structured meat_preferences array used by the
// meal-planner. Letting the user pick a preset instead of every individual
// meat keeps the onboarding short.
const MEAT_PRESETS: { id: MeatPresetId; label: string; meats: MeatPreference[] }[] = [
  { id: "any",          label: "Any meat",                       meats: ["chicken", "turkey", "beef", "lamb", "pork", "fish", "shrimp"] },
  { id: "chicken",      label: "Chicken only",                   meats: ["chicken"] },
  { id: "beef",         label: "Beef / Steak focused",           meats: ["beef", "lamb", "chicken"] },
  { id: "white",        label: "White meat only (no red meat)",  meats: ["chicken", "turkey", "fish"] },
  { id: "no_pork_beef", label: "No pork or beef",                meats: ["chicken", "turkey", "lamb", "fish", "shrimp"] },
];

// Auto-derive sensible meat defaults from dietary preference. The Non-Veg
// branch is overridden by the preset dropdown below.
function defaultMeatsFor(diet: DietaryPreference): MeatPreference[] {
  if (diet === "vegetarian" || diet === "vegan") return [];
  if (diet === "pescatarian") return ["fish", "shrimp"];
  // no_preference / keto: common everyday proteins (Non-Veg preset will refine)
  return ["chicken", "turkey", "beef", "fish"];
}

export default function StepNutrition() {
  const { data, updateData } = useOnboardingStore();
  const [presetOpen, setPresetOpen] = useState(false);

  const canContinue = data.dietary_preference !== null;
  const isNonVeg = data.dietary_preference === "no_preference";
  const currentPreset = MEAT_PRESETS.find((p) => p.id === data.meat_preset) ?? MEAT_PRESETS[0];

  const selectDiet = (diet: DietaryPreference) => {
    // When switching to Non-Veg, apply the current meat preset.
    // Otherwise, use the dietary-derived defaults.
    const meats = diet === "no_preference"
      ? (MEAT_PRESETS.find((p) => p.id === data.meat_preset) ?? MEAT_PRESETS[0]).meats
      : defaultMeatsFor(diet);
    updateData({
      dietary_preference: diet,
      meat_preferences: meats,
      cuisine_preferences: data.cuisine_preferences.length > 0
        ? data.cuisine_preferences
        : ["american"],
    });
    // Close the preset dropdown if the user switched away from Non-Veg
    if (diet !== "no_preference") setPresetOpen(false);
  };

  const selectPreset = (id: MeatPresetId) => {
    const preset = MEAT_PRESETS.find((p) => p.id === id) ?? MEAT_PRESETS[0];
    updateData({ meat_preset: id, meat_preferences: preset.meats });
    setPresetOpen(false);
  };

  const toggleAllergy = (allergy: string) => {
    const val = allergy.toLowerCase();
    const current = data.food_exclusions;
    if (current.includes(val)) {
      updateData({ food_exclusions: current.filter((a) => a !== val) });
    } else {
      updateData({ food_exclusions: [...current, val] });
    }
  };

  return (
    <OnboardingLayout
      step={7}
      totalSteps={9}
      ctaLabel="Continue"
      ctaDisabled={!canContinue}
      onCta={() => router.push("/(onboarding)/step9-injuries")}
    >
      <Text style={{ color: C.rock, fontSize: 14, fontFamily: "Quicksand_500Medium", fontWeight: "500", marginTop: 16, marginBottom: 6 }}>
        Step 8 of 9
      </Text>
      <Text style={{ fontSize: 26, fontWeight: "700", color: C.earth, marginBottom: 6 }}>
        Your <Text style={{ color: C.trail }}>nutrition</Text>
      </Text>
      <Text style={{ fontSize: 15, color: C.rock, marginBottom: 28 }}>
        We'll tailor meal plans to your preferences.
      </Text>

      {/* Section 1: Dietary Preference */}
      <Text style={{ fontSize: 15, fontFamily: "Quicksand_600SemiBold", fontWeight: "600", color: C.earth, marginBottom: 12 }}>
        Dietary Preference
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {dietOptions.map((option) => {
          const isSelected = data.dietary_preference === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => selectDiet(option.value)}
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
                  fontFamily: "Quicksand_500Medium", fontWeight: "500",
                  color: isSelected ? C.bg : C.earth,
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Section 1b: Meat preset dropdown — only when Non-Veg is selected */}
      {isNonVeg && (
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 11, fontFamily: "Quicksand_700Bold", fontWeight: "700", color: C.rock, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 8 }}>
            Meat preference
          </Text>
          <Pressable
            onPress={() => setPresetOpen((v) => !v)}
            style={{
              backgroundColor: C.stone,
              borderRadius: 14,
              height: 48,
              paddingHorizontal: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderWidth: 1.5,
              borderColor: presetOpen ? C.earth : "transparent",
            }}
          >
            <Text style={{ fontSize: 14, fontFamily: "Quicksand_600SemiBold", fontWeight: "600", color: C.earth }}>
              {currentPreset.label}
            </Text>
            <Text style={{ fontSize: 14, fontWeight: "700", color: C.rock, transform: [{ rotate: presetOpen ? "180deg" : "0deg" }] }}>
              ▾
            </Text>
          </Pressable>
          {presetOpen && (
            <View style={{ marginTop: 8, backgroundColor: C.stone, borderRadius: 14, overflow: "hidden" }}>
              {MEAT_PRESETS.map((p, idx) => {
                const active = data.meat_preset === p.id;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => selectPreset(p.id)}
                    style={{
                      paddingVertical: 14,
                      paddingHorizontal: 16,
                      backgroundColor: active ? "rgba(52,211,153,0.12)" : "transparent",
                      borderTopWidth: idx === 0 ? 0 : 1,
                      borderTopColor: "rgba(45,42,36,0.06)",
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: active ? "700" : "500", color: active ? C.trail : C.earth }}>
                      {p.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: "rgba(45,42,36,0.06)", marginTop: 24, marginBottom: 24 }} />

      {/* Section 2: Allergies */}
      <Text style={{ fontSize: 15, fontFamily: "Quicksand_600SemiBold", fontWeight: "600", color: C.earth, marginBottom: 4 }}>
        Any food allergies?
      </Text>
      <Text style={{ fontSize: 13, color: C.rock, marginBottom: 12 }}>
        Tap any that apply. Skip if none.
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
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
                  fontFamily: "Quicksand_500Medium", fontWeight: "500",
                  color: isSelected ? "#F59E0B" : C.earth,
                }}
              >
                {allergy}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={{ fontSize: 12, color: C.rock, marginTop: 20, lineHeight: 18 }}>
        You can refine cuisine preferences later in the Meals tab.
      </Text>
    </OnboardingLayout>
  );
}
