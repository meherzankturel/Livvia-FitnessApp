import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { useOnboardingStore } from "@repped/shared";
import type { Equipment } from "@repped/shared";

const options: { value: Equipment; label: string; desc: string }[] = [
  { value: "full_gym", label: "Full Gym", desc: "Barbells, dumbbells, cables, machines" },
  { value: "dumbbells_only", label: "Dumbbells Only", desc: "Home gym or hotel workout" },
  { value: "bodyweight", label: "Bodyweight", desc: "No equipment needed" },
];

export default function StepEquipment() {
  const { data, updateData } = useOnboardingStore();

  const canContinue = data.equipment !== null;

  return (
    <View style={{ flex: 1, backgroundColor: "#0C0C0F", paddingHorizontal: 24, paddingTop: 80 }}>
      <Text style={{ color: "rgba(246,245,240,0.3)", fontSize: 16, marginBottom: 8 }}>Step 5 of 7</Text>
      <Text style={{ color: "#F6F5F0", fontSize: 28, fontWeight: "700", marginBottom: 8 }}>Equipment</Text>
      <Text style={{ color: "rgba(246,245,240,0.5)", fontSize: 16, marginBottom: 32 }}>What do you have access to?</Text>

      <View style={{ gap: 16, marginBottom: 48 }}>
        {options.map((option) => {
          const isSelected = data.equipment === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => updateData({ equipment: option.value })}
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
          onPress={() => router.push("/(onboarding)/step6-schedule")}
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
