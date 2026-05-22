import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { useOnboardingStore } from "@repped/shared";
import type { Equipment } from "@repped/shared";
import { OnboardingLayout } from "../../src/components/onboarding/OnboardingLayout";

const C = {
  earth: "#2D2A24",
  bg: "#F6F5F0",
  stone: "#EDEBE5",
  rock: "#8E8E7A",
  trail: "#34D399",
};

const options: { value: Equipment; label: string; desc: string }[] = [
  { value: "full_gym", label: "Full Gym", desc: "Barbells, dumbbells, cables, machines \u2014 the works" },
  { value: "home_gym", label: "Home Gym", desc: "Dumbbells, bands, kettlebells, bench" },
  { value: "dumbbells_only", label: "Dumbbells Only", desc: "A pair of dumbbells and a bench" },
  { value: "bodyweight", label: "Bodyweight", desc: "No equipment needed" },
];

export default function StepEquipment() {
  const { data, updateData } = useOnboardingStore();

  const canContinue = data.equipment !== null;

  return (
    <OnboardingLayout
      step={5}
      totalSteps={9}
      ctaLabel="Continue"
      ctaDisabled={!canContinue}
      onCta={() => router.push("/(onboarding)/step7-schedule")}
    >
      <Text style={{ color: C.rock, fontSize: 14, fontFamily: "Quicksand_500Medium", fontWeight: "500", marginTop: 16, marginBottom: 6 }}>
        Step 6 of 9
      </Text>
      <Text style={{ fontSize: 26, fontWeight: "700", color: C.earth, marginBottom: 6 }}>
        Your <Text style={{ color: C.trail }}>equipment</Text>
      </Text>
      <Text style={{ fontSize: 15, color: C.rock, marginBottom: 28 }}>
        We'll only suggest exercises you can actually do.
      </Text>

      <View style={{ gap: 12 }}>
        {options.map((option) => {
          const isSelected = data.equipment === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => updateData({ equipment: option.value })}
              style={{
                borderRadius: 16,
                padding: 18,
                backgroundColor: isSelected ? C.earth : C.stone,
                borderWidth: 2,
                borderColor: isSelected ? C.earth : "transparent",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Quicksand_600SemiBold", fontWeight: "600",
                  marginBottom: 3,
                  color: isSelected ? C.bg : C.earth,
                }}
              >
                {option.label}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: isSelected ? "rgba(246,245,240,0.6)" : C.rock,
                }}
              >
                {option.desc}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </OnboardingLayout>
  );
}
