import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { useOnboardingStore } from "@repped/shared";
import { OnboardingLayout } from "../../src/components/onboarding/OnboardingLayout";

const C = {
  earth: "#2D2A24",
  bg: "#F6F5F0",
  stone: "#EDEBE5",
  rock: "#8E8E7A",
  trail: "#34D399",
};

type GoalOption = "lose_fat" | "build_muscle" | "maintain";

const GOALS: { value: GoalOption; label: string; desc: string }[] = [
  { value: "lose_fat", label: "Lose Fat", desc: "Drop body fat while keeping muscle" },
  { value: "build_muscle", label: "Build Muscle", desc: "Get bigger and stronger" },
  { value: "maintain", label: "Stay Fit", desc: "Maintain your current physique" },
];

export default function Step3Goals() {
  const { data, updateData } = useOnboardingStore();
  const [goal, setGoal] = useState<GoalOption | null>((data.goal as GoalOption) ?? null);

  const canContinue = goal !== null;

  const handleContinue = () => {
    updateData({ goal });
    router.push("/(onboarding)/step4-experience");
  };

  return (
    <OnboardingLayout
      step={2}
      totalSteps={8}
      ctaLabel="Continue"
      ctaDisabled={!canContinue}
      onCta={handleContinue}
    >
      {/* Step label */}
      <Text
        style={{
          fontSize: 10,
          fontWeight: "700",
          color: C.rock,
          textTransform: "uppercase",
          letterSpacing: 1,
          marginTop: 16,
          marginBottom: 8,
        }}
      >
        Step 3 of 8
      </Text>

      {/* Title */}
      <Text style={{ fontSize: 28, fontWeight: "800", color: C.earth, marginBottom: 6 }}>
        What's your <Text style={{ color: C.trail }}>goal</Text>?
      </Text>

      {/* Subtitle */}
      <Text style={{ fontSize: 14, color: C.rock, marginBottom: 28, lineHeight: 20 }}>
        We'll program every workout and meal around this.
      </Text>

      {/* Option cards */}
      <View style={{ gap: 12 }}>
        {GOALS.map((opt) => {
          const selected = goal === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => setGoal(opt.value)}
              style={{
                backgroundColor: selected ? C.earth : C.stone,
                borderRadius: 16,
                borderWidth: 2,
                borderColor: selected ? C.earth : "transparent",
                paddingVertical: 18,
                paddingHorizontal: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: selected ? C.bg : C.earth,
                  marginBottom: 4,
                }}
              >
                {opt.label}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: selected ? "rgba(246,245,240,0.7)" : C.rock,
                  lineHeight: 18,
                }}
              >
                {opt.desc}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </OnboardingLayout>
  );
}
