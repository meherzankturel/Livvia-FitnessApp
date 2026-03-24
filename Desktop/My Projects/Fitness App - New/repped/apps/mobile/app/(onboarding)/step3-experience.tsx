import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { useOnboardingStore } from "@repped/shared";
import type { TrainingHistory } from "@repped/shared";

const options: { value: TrainingHistory; label: string; desc: string }[] = [
  { value: "beginner", label: "Beginner", desc: "New to lifting or less than 6 months" },
  { value: "intermediate", label: "Intermediate", desc: "6 months to 2 years of consistent training" },
  { value: "advanced", label: "Advanced", desc: "2+ years of serious training" },
];

export default function StepExperience() {
  const { data, updateData } = useOnboardingStore();

  const handleSelect = (value: TrainingHistory) => {
    updateData({ training_history: value });
  };

  const canContinue = data.training_history !== null;

  return (
    <View style={{ flex: 1, backgroundColor: "#0C0C0F", paddingHorizontal: 24, paddingTop: 80 }}>
      <Text style={{ color: "rgba(246,245,240,0.3)", fontSize: 16, marginBottom: 8 }}>Step 3 of 7</Text>
      <Text style={{ color: "#F6F5F0", fontSize: 28, fontWeight: "700", marginBottom: 8 }}>Experience</Text>
      <Text style={{ color: "rgba(246,245,240,0.5)", fontSize: 16, marginBottom: 32 }}>How long have you been training?</Text>

      <View style={{ gap: 16, marginBottom: 48 }}>
        {options.map((option) => {
          const isSelected = data.training_history === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => handleSelect(option.value)}
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
                  marginBottom: 4,
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
          onPress={() => router.push("/(onboarding)/step4-goals")}
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
    </View>
  );
}
