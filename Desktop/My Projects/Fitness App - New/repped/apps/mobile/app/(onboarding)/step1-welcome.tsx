import { useState } from "react";
import { View, Text, TextInput, Image } from "react-native";
import { router } from "expo-router";
import { useOnboardingStore } from "@repped/shared";
import { OnboardingLayout } from "../../src/components/onboarding/OnboardingLayout";
import { ReviveWordmark } from "../../src/components/ReviveWordmark";

const C = {
  earth: "#2D2A24",
  bg: "#F6F5F0",
  stone: "#EDEBE5",
  rock: "#8E8E7A",
  trail: "#34D399",
};

export default function Step1Welcome() {
  const { data, updateData } = useOnboardingStore();
  const [name, setName] = useState(data.display_name ?? "");

  const canContinue = name.trim().length > 0;

  const handleContinue = () => {
    updateData({ display_name: name.trim() });
    router.push("/(onboarding)/step2-about");
  };

  return (
    <OnboardingLayout
      step={0}
      totalSteps={9}
      ctaLabel="Continue"
      ctaDisabled={!canContinue}
      onCta={handleContinue}
    >
      {/* Hero image with bottom fade */}
      <View style={{ marginHorizontal: -24, marginTop: -8 }}>
        <Image
          source={require("../../assets/onboarding-hero.jpeg")}
          style={{ width: "100%", height: 260 }}
          resizeMode="cover"
        />
        {/* Bottom fade gradient into bg */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
          }}
        >
          <View style={{ flex: 1, backgroundColor: C.bg, opacity: 0 }} />
          <View style={{ flex: 1, backgroundColor: C.bg, opacity: 0.15 }} />
          <View style={{ flex: 1, backgroundColor: C.bg, opacity: 0.3 }} />
          <View style={{ flex: 1, backgroundColor: C.bg, opacity: 0.5 }} />
          <View style={{ flex: 1, backgroundColor: C.bg, opacity: 0.7 }} />
          <View style={{ flex: 1, backgroundColor: C.bg, opacity: 0.85 }} />
          <View style={{ flex: 1, backgroundColor: C.bg, opacity: 1 }} />
        </View>
      </View>

      {/* Step label */}
      <Text
        style={{
          fontSize: 10,
          fontFamily: "Quicksand_700Bold", fontWeight: "700",
          color: C.rock,
          textTransform: "uppercase",
          letterSpacing: 1,
          marginTop: 24,
          marginBottom: 8,
        }}
      >
        Step 1 of 9
      </Text>

      {/* Title — brand wordmark */}
      <View style={{ alignSelf: "flex-start", marginBottom: 6 }}>
        <ReviveWordmark size={42} />
      </View>

      {/* Tagline */}
      <Text style={{ fontSize: 15, color: C.rock, marginBottom: 28 }}>
        Fitness that adapts to you.
      </Text>

      {/* Subtitle */}
      <Text
        style={{
          fontSize: 15,
          fontFamily: "Quicksand_500Medium", fontWeight: "500",
          color: C.earth,
          marginBottom: 16,
          lineHeight: 22,
        }}
      >
        Let's personalize your journey. What should we call you?
      </Text>

      {/* Name input */}
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        placeholderTextColor={C.rock}
        autoCapitalize="words"
        autoCorrect={false}
        style={{
          backgroundColor: C.stone,
          borderRadius: 14,
          height: 50,
          paddingHorizontal: 16,
          fontSize: 16,
          fontFamily: "Quicksand_500Medium", fontWeight: "500",
          color: C.earth,
        }}
      />
    </OnboardingLayout>
  );
}
