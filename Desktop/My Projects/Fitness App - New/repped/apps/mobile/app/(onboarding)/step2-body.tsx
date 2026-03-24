import { View, Text, Pressable, TextInput } from "react-native";
import { router } from "expo-router";
import { useOnboardingStore } from "@repped/shared";
import { useState } from "react";

export default function StepBody() {
  const { data, updateData } = useOnboardingStore();
  const [weight, setWeight] = useState(data.weight_kg?.toString() ?? "");
  const [height, setHeight] = useState(data.height_cm?.toString() ?? "");

  const canContinue = weight.length > 0 && height.length > 0;

  const handleNext = () => {
    updateData({
      weight_kg: parseFloat(weight),
      height_cm: parseFloat(height),
    });
    router.push("/(onboarding)/step3-experience");
  };

  const inputStyle = {
    backgroundColor: "rgba(246,245,240,0.06)",
    color: "#F6F5F0" as const,
    fontSize: 20,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 32,
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0C0C0F", paddingHorizontal: 24, paddingTop: 80 }}>
      <Text style={{ color: "rgba(246,245,240,0.3)", fontSize: 16, marginBottom: 8 }}>Step 2 of 7</Text>
      <Text style={{ color: "#F6F5F0", fontSize: 28, fontWeight: "700", marginBottom: 32 }}>Your Body</Text>

      <Text style={{ color: "rgba(246,245,240,0.5)", fontSize: 18, marginBottom: 12 }}>Weight (kg)</Text>
      <TextInput
        style={inputStyle}
        placeholder="70"
        placeholderTextColor="rgba(246,245,240,0.3)"
        keyboardType="decimal-pad"
        value={weight}
        onChangeText={setWeight}
      />

      <Text style={{ color: "rgba(246,245,240,0.5)", fontSize: 18, marginBottom: 12 }}>Height (cm)</Text>
      <TextInput
        style={inputStyle}
        placeholder="175"
        placeholderTextColor="rgba(246,245,240,0.3)"
        keyboardType="decimal-pad"
        value={height}
        onChangeText={setHeight}
      />

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
          onPress={handleNext}
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
