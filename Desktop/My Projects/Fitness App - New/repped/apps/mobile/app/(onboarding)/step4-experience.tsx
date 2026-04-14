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

type ExperienceOption = "beginner" | "intermediate" | "advanced";

const LEVELS: { value: ExperienceOption; label: string; desc: string }[] = [
  { value: "beginner", label: "Beginner", desc: "New to lifting or less than 6 months" },
  { value: "intermediate", label: "Intermediate", desc: "6 months to 2 years of consistent training" },
  { value: "advanced", label: "Advanced", desc: "2+ years of serious training" },
];

export default function Step4Experience() {
  const { data, updateData } = useOnboardingStore();
  const [level, setLevel] = useState<ExperienceOption | null>(
    (data.training_history as ExperienceOption) ?? null
  );

  const canContinue = level !== null;

  const handleContinue = () => {
    updateData({ training_history: level });
    router.push("/(onboarding)/step5-equipment");
  };

  return (
    <OnboardingLayout
      step={3}
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
        Step 4 of 8
      </Text>

      {/* Title */}
      <Text style={{ fontSize: 28, fontWeight: "800", color: C.earth, marginBottom: 6 }}>
        Your <Text style={{ color: C.trail }}>experience</Text>
      </Text>

      {/* Subtitle */}
      <Text style={{ fontSize: 14, color: C.rock, marginBottom: 28, lineHeight: 20 }}>
        This determines exercise difficulty and volume.
      </Text>

      {/* Option cards */}
      <View style={{ gap: 12 }}>
        {LEVELS.map((opt) => {
          const selected = level === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => setLevel(opt.value)}
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
