import { View, Text, Pressable, TextInput } from "react-native";
import { router } from "expo-router";
import { useOnboardingStore } from "@repped/shared";
import type { Sex } from "@repped/shared";
import { useState } from "react";

export default function StepBasics() {
  const { data, updateData } = useOnboardingStore();
  const [age, setAge] = useState(data.age?.toString() ?? "");

  const canContinue = age.length > 0 && data.sex !== null;

  const handleNext = () => {
    updateData({ age: parseInt(age, 10) });
    router.push("/(onboarding)/step2-body");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0C0C0F", paddingHorizontal: 24, paddingTop: 80 }}>
      <Text style={{ color: "rgba(246,245,240,0.3)", fontSize: 16, marginBottom: 8 }}>Step 1 of 7</Text>
      <Text style={{ color: "#F6F5F0", fontSize: 28, fontWeight: "700", marginBottom: 32 }}>About You</Text>

      <Text style={{ color: "rgba(246,245,240,0.5)", fontSize: 18, marginBottom: 12 }}>How old are you?</Text>
      <TextInput
        style={{
          backgroundColor: "rgba(246,245,240,0.06)",
          color: "#F6F5F0",
          fontSize: 20,
          borderRadius: 16,
          paddingHorizontal: 20,
          paddingVertical: 16,
          marginBottom: 32,
        }}
        placeholder="25"
        placeholderTextColor="rgba(246,245,240,0.3)"
        keyboardType="number-pad"
        value={age}
        onChangeText={setAge}
        maxLength={3}
      />

      <Text style={{ color: "rgba(246,245,240,0.5)", fontSize: 18, marginBottom: 12 }}>What's your sex?</Text>
      <Text style={{ color: "rgba(246,245,240,0.3)", fontSize: 14, marginBottom: 16 }}>
        This helps us calculate your calories accurately.
      </Text>
      <View style={{ flexDirection: "row", gap: 16, marginBottom: 48 }}>
        {(["male", "female"] as const).map((option) => {
          const isSelected = data.sex === option;
          return (
            <Pressable
              key={option}
              onPress={() => updateData({ sex: option })}
              style={{
                flex: 1,
                borderRadius: 16,
                paddingVertical: 20,
                alignItems: "center",
                backgroundColor: isSelected ? "#34D399" : "rgba(246,245,240,0.08)",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: isSelected ? "#0C0C0F" : "rgba(246,245,240,0.5)",
                }}
              >
                {option === "male" ? "Male" : "Female"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={handleNext}
        disabled={!canContinue}
        style={{
          width: "100%",
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
  );
}
