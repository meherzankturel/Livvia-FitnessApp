import { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
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

type GoalOption = "lose_fat" | "build_muscle" | "maintain";

const GOALS: { value: GoalOption; label: string; desc: string }[] = [
  { value: "lose_fat", label: "Lose Fat", desc: "Drop body fat while keeping muscle" },
  { value: "build_muscle", label: "Build Muscle", desc: "Get bigger and stronger" },
  { value: "maintain", label: "Stay Fit", desc: "Maintain your current physique" },
];

// Defaults for the target weight slider — typical 12-week recomp magnitudes.
// Users adjust via the RulerPicker; this just seeds it.
function defaultTarget(goal: GoalOption, currentKg: number): number {
  if (goal === "lose_fat") return Math.max(35, Math.round(currentKg - 5));
  if (goal === "build_muscle") return Math.min(180, Math.round(currentKg + 3));
  return currentKg;
}

export default function Step4Goals() {
  const { data, updateData } = useOnboardingStore();
  const [goal, setGoal] = useState<GoalOption | null>((data.goal as GoalOption) ?? null);

  const currentKg = data.weight_kg ?? 70;
  const needsTarget = goal === "lose_fat" || goal === "build_muscle";

  // Whenever the goal changes, seed target_weight_kg if it isn't set yet for
  // this goal. Switching between lose_fat / build_muscle / maintain resets.
  useEffect(() => {
    if (!goal) return;
    if (!needsTarget) {
      if (data.target_weight_kg !== null) updateData({ target_weight_kg: null });
      return;
    }
    // If user switched goal direction, re-seed the target
    const seed = defaultTarget(goal, currentKg);
    if (data.target_weight_kg === null) {
      updateData({ target_weight_kg: seed });
      return;
    }
    // If current target is in the wrong direction for this goal, re-seed
    if (goal === "lose_fat" && data.target_weight_kg >= currentKg) {
      updateData({ target_weight_kg: seed });
    } else if (goal === "build_muscle" && data.target_weight_kg <= currentKg) {
      updateData({ target_weight_kg: seed });
    }
  }, [goal]);

  const canContinue = goal !== null && (!needsTarget || data.target_weight_kg !== null);

  const handleContinue = () => {
    updateData({ goal });
    router.push("/(onboarding)/step5-experience");
  };

  // Delta hint shown live below the ruler
  const target = data.target_weight_kg;
  let deltaHint: string | null = null;
  if (needsTarget && target != null) {
    const delta = target - currentKg;
    const absKg = Math.abs(delta);
    if (delta === 0) {
      deltaHint = "Already at your target weight.";
    } else if (goal === "lose_fat") {
      if (delta > 0) {
        deltaHint = "Target is heavier than your current weight — switch to Build Muscle if that's your goal.";
      } else {
        deltaHint = `Lose ${absKg} kg from your current weight.`;
      }
    } else if (goal === "build_muscle") {
      if (delta < 0) {
        deltaHint = "Target is lighter than your current weight — switch to Lose Fat if that's your goal.";
      } else {
        deltaHint = `Gain ${absKg} kg from your current weight.`;
      }
    }
  }

  return (
    <OnboardingLayout
      step={3}
      totalSteps={9}
      ctaLabel="Continue"
      ctaDisabled={!canContinue}
      onCta={handleContinue}
    >
      <Text style={{ fontSize: 10, fontFamily: "Quicksand_700Bold", fontWeight: "700", color: C.rock, textTransform: "uppercase", letterSpacing: 1, marginTop: 16, marginBottom: 8 }}>
        Step 4 of 9
      </Text>
      <Text style={{ fontSize: 28, fontWeight: "800", color: C.earth, marginBottom: 6 }}>
        What's your <Text style={{ color: C.trail }}>goal</Text>?
      </Text>
      <Text style={{ fontSize: 14, color: C.rock, marginBottom: 28, lineHeight: 20 }}>
        We'll program every workout and meal around this.
      </Text>

      <View style={{ gap: 12 }}>
        {GOALS.map((opt) => {
          const selected = goal === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => setGoal(opt.value)}
              style={{
                backgroundColor: selected ? C.earth : C.stone,
                borderRadius: 16,
                borderWidth: 2,
                borderColor: selected ? C.earth : "transparent",
                paddingVertical: 18,
                paddingHorizontal: 20,
              }}
            >
              <Text style={{ fontSize: 16, fontFamily: "Quicksand_700Bold", fontWeight: "700", color: selected ? C.bg : C.earth, marginBottom: 4 }}>
                {opt.label}
              </Text>
              <Text style={{ fontSize: 13, color: selected ? "rgba(246,245,240,0.7)" : C.rock, lineHeight: 18 }}>
                {opt.desc}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Target weight — appears for Lose Fat and Build Muscle */}
      {needsTarget && (
        <View style={{ marginTop: 24 }}>
          <Text style={{ fontSize: 14, fontFamily: "Quicksand_600SemiBold", fontWeight: "600", color: C.earth, marginBottom: 10 }}>
            Target weight
          </Text>
          <RulerPicker
            label="Goal"
            min={30}
            max={200}
            initial={data.target_weight_kg ?? defaultTarget(goal!, currentKg)}
            unit="kg"
            altUnit="lbs"
            altMin={66}
            altMax={440}
            altInitial={Math.round((data.target_weight_kg ?? defaultTarget(goal!, currentKg)) * 2.20462)}
            convertToAlt={(val) => Math.round(val * 2.20462)}
            convertFromAlt={(val) => Math.round(val / 2.20462)}
            onValueChange={(v) => updateData({ target_weight_kg: v })}
          />
          {deltaHint && (
            <Text style={{ fontSize: 12, color: C.rock, marginTop: 6, lineHeight: 18 }}>
              {deltaHint}
            </Text>
          )}
        </View>
      )}
    </OnboardingLayout>
  );
}
