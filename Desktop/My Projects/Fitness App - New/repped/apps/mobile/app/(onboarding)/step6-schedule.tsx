import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { useOnboardingStore } from "@repped/shared";
import type { ActivityLevel } from "@repped/shared";

const dayOptions = [2, 3, 4, 5, 6];

const activityOptions: { value: ActivityLevel; label: string; desc: string }[] = [
  { value: "sedentary", label: "Sedentary", desc: "Desk job, minimal movement" },
  { value: "lightly_active", label: "Lightly Active", desc: "Walking, light daily activity" },
  { value: "moderately_active", label: "Moderately Active", desc: "On your feet most of the day" },
  { value: "very_active", label: "Very Active", desc: "Physical job or active lifestyle" },
];

export default function StepSchedule() {
  const { data, updateData } = useOnboardingStore();

  const canContinue = data.days_per_week !== null && data.activity_level !== null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#0C0C0F" }}
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40 }}
    >
      <Text style={{ color: "rgba(246,245,240,0.3)", fontSize: 16, marginBottom: 8 }}>Step 6 of 7</Text>
      <Text style={{ color: "#F6F5F0", fontSize: 28, fontWeight: "700", marginBottom: 8 }}>Schedule</Text>
      <Text style={{ color: "rgba(246,245,240,0.5)", fontSize: 16, marginBottom: 32 }}>
        We'll build your plan around your life.
      </Text>

      <Text style={{ color: "rgba(246,245,240,0.5)", fontSize: 18, marginBottom: 16 }}>
        Days per week you can train
      </Text>
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 40 }}>
        {dayOptions.map((day) => {
          const isSelected = data.days_per_week === day;
          return (
            <Pressable
              key={day}
              onPress={() => updateData({ days_per_week: day })}
              style={{
                flex: 1,
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
                backgroundColor: isSelected ? "#34D399" : "rgba(246,245,240,0.08)",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: isSelected ? "#0C0C0F" : "rgba(246,245,240,0.5)",
                }}
              >
                {day}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={{ color: "rgba(246,245,240,0.5)", fontSize: 18, marginBottom: 16 }}>
        How active are you outside the gym?
      </Text>
      <View style={{ gap: 12, marginBottom: 40 }}>
        {activityOptions.map((option) => {
          const isSelected = data.activity_level === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => updateData({ activity_level: option.value })}
              style={{
                borderRadius: 16,
                padding: 16,
                backgroundColor: isSelected ? "#34D399" : "rgba(246,245,240,0.08)",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: isSelected ? "#0C0C0F" : "#F6F5F0",
                }}
              >
                {option.label}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: isSelected ? "rgba(12,12,15,0.7)" : "rgba(246,245,240,0.5)",
                }}
              >
                {option.desc}
              </Text>
            </Pressable>
          );
        })}
      </View>

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
          onPress={() => router.push("/(onboarding)/step7-diet")}
          disabled={!canContinue}
          style={{
            flex: 1,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
            backgroundColor: canContinue ? "#34D399" : "rgba(246,245,240,0.06)",
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: canContinue ? "#0C0C0F" : "rgba(246,245,240,0.2)",
            }}
          >
            Continue
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
