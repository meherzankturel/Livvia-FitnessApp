import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { useOnboardingStore } from "@repped/shared";
import type { ActivityLevel } from "@repped/shared";
import { OnboardingLayout } from "../../src/components/onboarding/OnboardingLayout";

const C = {
  earth: "#2D2A24",
  bg: "#F6F5F0",
  stone: "#EDEBE5",
  rock: "#8E8E7A",
  trail: "#34D399",
};

const dayOptions = [2, 3, 4, 5, 6, 7];

// 5 levels match ACSM 2018 Mifflin-St Jeor activity multipliers (1.2 → 1.9)
const activityOptions: { value: ActivityLevel; label: string; desc: string }[] = [
  { value: "sedentary", label: "Sedentary", desc: "Desk job, minimal movement" },
  { value: "lightly_active", label: "Lightly Active", desc: "Walking, light daily activity" },
  { value: "moderately_active", label: "Moderately Active", desc: "On your feet most of the day" },
  { value: "very_active", label: "Very Active", desc: "Physical job or active lifestyle" },
  { value: "extremely_active", label: "Extremely Active", desc: "Manual labor or twice-daily training" },
];

export default function StepSchedule() {
  const { data, updateData } = useOnboardingStore();

  const canContinue = data.days_per_week !== null && data.activity_level !== null;

  return (
    <OnboardingLayout
      step={6}
      totalSteps={9}
      ctaLabel="Continue"
      ctaDisabled={!canContinue}
      onCta={() => router.push("/(onboarding)/step8-nutrition")}
    >
      <Text style={{ color: C.rock, fontSize: 14, fontFamily: "Quicksand_500Medium", fontWeight: "500", marginTop: 16, marginBottom: 6 }}>
        Step 7 of 9
      </Text>
      <Text style={{ fontSize: 26, fontWeight: "700", color: C.earth, marginBottom: 6 }}>
        Your <Text style={{ color: C.trail }}>schedule</Text>
      </Text>
      <Text style={{ fontSize: 15, color: C.rock, marginBottom: 28 }}>
        We'll build your plan around your life.
      </Text>

      {/* Days per week */}
      <Text style={{ fontSize: 15, fontFamily: "Quicksand_600SemiBold", fontWeight: "600", color: C.earth, marginBottom: 12 }}>
        Days per week you can train
      </Text>
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 28 }}>
        {dayOptions.map((day) => {
          const isSelected = data.days_per_week === day;
          return (
            <Pressable
              key={day}
              onPress={() => updateData({ days_per_week: day })}
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: isSelected ? C.earth : C.stone,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Quicksand_600SemiBold", fontWeight: "600",
                  color: isSelected ? C.bg : C.earth,
                }}
              >
                {day}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Activity level */}
      <Text style={{ fontSize: 15, fontFamily: "Quicksand_600SemiBold", fontWeight: "600", color: C.earth, marginBottom: 12 }}>
        Activity outside the gym
      </Text>
      <View style={{ gap: 12 }}>
        {activityOptions.map((option) => {
          const isSelected = data.activity_level === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => updateData({ activity_level: option.value })}
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
