import { useState } from "react";
import { View, Text, Pressable, Alert, ScrollView } from "react-native";
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

const PARQ_QUESTIONS = [
  {
    id: "heart_condition",
    question: "Has a doctor ever said you have a heart condition and should only do doctor-recommended activity?",
  },
  {
    id: "chest_pain_activity",
    question: "Do you feel pain in your chest when you do physical activity?",
  },
  {
    id: "chest_pain_rest",
    question: "In the past month, have you had chest pain when not doing physical activity?",
  },
  {
    id: "dizziness",
    question: "Do you lose balance because of dizziness, or do you ever lose consciousness?",
  },
  {
    id: "bone_joint",
    question: "Do you have a bone or joint problem that could be made worse by physical activity?",
  },
  {
    id: "blood_pressure_meds",
    question: "Is your doctor currently prescribing medication for your blood pressure or heart?",
  },
  {
    id: "other_reason",
    question: "Do you know of any other reason why you should not do physical activity?",
  },
];

export default function Step3Health() {
  const { updateData } = useOnboardingStore();
  const [answers, setAnswers] = useState<Record<string, boolean>>({});

  // All questions must be answered
  const allAnswered = PARQ_QUESTIONS.every((q) => answers[q.id] !== undefined);
  const flagged = PARQ_QUESTIONS.filter((q) => answers[q.id] === true).map((q) => q.id);

  const handleContinue = () => {
    const cleared = flagged.length === 0;
    updateData({ health_conditions: flagged, health_cleared: cleared });

    if (!cleared) {
      Alert.alert(
        "We Recommend a Doctor's Check",
        "Based on your answers, we recommend consulting a doctor before starting an exercise program. You can still continue — we'll tailor your workouts to be safe and gradual.",
        [{ text: "I Understand", onPress: () => router.push("/(onboarding)/step4-goals") }]
      );
    } else {
      router.push("/(onboarding)/step4-goals");
    }
  };

  return (
    <OnboardingLayout
      step={2}
      totalSteps={9}
      ctaLabel="Continue"
      ctaDisabled={!allAnswered}
      onCta={handleContinue}
    >
      {/* Step label */}
      <Text
        style={{
          fontSize: 10,
          fontFamily: "Quicksand_700Bold", fontWeight: "700",
          color: C.rock,
          textTransform: "uppercase",
          letterSpacing: 1,
          marginTop: 16,
          marginBottom: 8,
        }}
      >
        Step 3 of 9
      </Text>

      {/* Title */}
      <Text style={{ fontSize: 28, fontFamily: "Quicksand_700Bold", fontWeight: "800", color: C.earth, marginBottom: 6 }}>
        Quick <Text style={{ color: C.trail }}>health</Text> check
      </Text>

      {/* Subtitle */}
      <Text style={{ fontSize: 14, color: C.rock, marginBottom: 24, lineHeight: 20 }}>
        Standard fitness screening to keep you safe. Answer honestly — there are no wrong answers.
      </Text>

      {/* Questions */}
      <View style={{ gap: 12 }}>
        {PARQ_QUESTIONS.map((q) => {
          const answered = answers[q.id] !== undefined;
          const isYes = answers[q.id] === true;
          const isNo = answers[q.id] === false;

          return (
            <View
              key={q.id}
              style={{
                backgroundColor: C.stone,
                borderRadius: 16,
                padding: 16,
              }}
            >
              <Text style={{ fontSize: 14, fontFamily: "Quicksand_600SemiBold", fontWeight: "600", color: C.earth, lineHeight: 20, marginBottom: 12 }}>
                {q.question}
              </Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Pressable
                  onPress={() => setAnswers((prev) => ({ ...prev, [q.id]: true }))}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 10,
                    alignItems: "center",
                    backgroundColor: isYes ? "#EF4444" : "rgba(45,42,36,0.05)",
                    borderWidth: 1.5,
                    borderColor: isYes ? "#EF4444" : "transparent",
                  }}
                >
                  <Text style={{ fontSize: 14, fontFamily: "Quicksand_700Bold", fontWeight: "700", color: isYes ? "#FFF" : C.rock }}>
                    Yes
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setAnswers((prev) => ({ ...prev, [q.id]: false }))}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 10,
                    alignItems: "center",
                    backgroundColor: isNo ? C.trail : "rgba(45,42,36,0.05)",
                    borderWidth: 1.5,
                    borderColor: isNo ? C.trail : "transparent",
                  }}
                >
                  <Text style={{ fontSize: 14, fontFamily: "Quicksand_700Bold", fontWeight: "700", color: isNo ? "#FFF" : C.rock }}>
                    No
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
    </OnboardingLayout>
  );
}
