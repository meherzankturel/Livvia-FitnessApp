import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { router } from "expo-router";
import { useOnboardingStore } from "@repped/shared";
import { OnboardingLayout } from "../../src/components/onboarding/OnboardingLayout";
import { RulerPicker } from "../../src/components/RulerPicker";

const C = {
  earth: "#2D2A24",
  bg: "#F6F5F0",
  stone: "#EDEBE5",
  rock: "#8E8E7A",
  trail: "#34D399",
};

type SexOption = "male" | "female";

export default function Step2About() {
  const { data, updateData } = useOnboardingStore();
  const [age, setAge] = useState(data.age ? String(data.age) : "25");
  const [sex, setSex] = useState<SexOption | null>(data.sex as SexOption | null);
  const [weightKg, setWeightKg] = useState(data.weight_kg ?? 0);
  const [heightCm, setHeightCm] = useState(data.height_cm ?? 0);

  const parsedAge = parseInt(age, 10) || 0;
  const canContinue = parsedAge > 0 && sex !== null && weightKg > 0 && heightCm > 0;

  const handleContinue = () => {
    updateData({
      age: parsedAge,
      sex,
      weight_kg: weightKg,
      height_cm: heightCm,
    });
    router.push("/(onboarding)/step3-health");
  };

  const sexOptions: { label: string; value: SexOption }[] = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
  ];

  return (
    <OnboardingLayout
      step={1}
      totalSteps={9}
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
        Step 2 of 9
      </Text>

      {/* Title */}
      <Text style={{ fontSize: 28, fontWeight: "800", color: C.earth, marginBottom: 6 }}>
        About <Text style={{ color: C.trail }}>You</Text>
      </Text>

      {/* Subtitle */}
      <Text style={{ fontSize: 14, color: C.rock, marginBottom: 28, lineHeight: 20 }}>
        This helps us calculate your targets and tailor your plan.
      </Text>

      {/* Row 1: Age + Sex */}
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
        {/* Age */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: C.rock,
              textTransform: "uppercase",
              letterSpacing: 0.8,
              marginBottom: 8,
            }}
          >
            Age
          </Text>
          <TextInput
            value={age}
            onChangeText={setAge}
            placeholder="25"
            placeholderTextColor={C.rock}
            keyboardType="number-pad"
            maxLength={3}
            style={{
              backgroundColor: C.stone,
              borderRadius: 14,
              height: 50,
              paddingHorizontal: 16,
              fontSize: 16,
              fontWeight: "600",
              color: C.earth,
              textAlign: "center",
            }}
          />
        </View>

        {/* Sex */}
        <View style={{ flex: 1.5 }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: C.rock,
              textTransform: "uppercase",
              letterSpacing: 0.8,
              marginBottom: 8,
            }}
          >
            Sex
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {sexOptions.map((opt) => {
              const selected = sex === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setSex(opt.value)}
                  style={{
                    flex: 1,
                    height: 50,
                    borderRadius: 14,
                    backgroundColor: selected ? C.earth : C.stone,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: selected ? C.bg : C.rock,
                    }}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* Row 2: Weight */}
      <RulerPicker
        label="Weight"
        min={30}
        max={200}
        initial={data.weight_kg ?? 70}
        unit="kg"
        altUnit="lbs"
        altMin={66}
        altMax={440}
        altInitial={154}
        convertToAlt={(val) => Math.round(val * 2.205)}
        convertFromAlt={(val) => Math.round(val / 2.205)}
        onValueChange={setWeightKg}
      />

      {/* Row 3: Height */}
      <RulerPicker
        label="Height"
        min={100}
        max={230}
        initial={data.height_cm ?? 175}
        unit="cm"
        altUnit="in"
        altMin={40}
        altMax={90}
        altInitial={69}
        convertToAlt={(val) => Math.round(val / 2.54)}
        convertFromAlt={(val) => Math.round(val * 2.54)}
        onValueChange={setHeightCm}
      />
    </OnboardingLayout>
  );
}
