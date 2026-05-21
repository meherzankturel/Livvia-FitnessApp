import { useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { View, Text, Alert } from "react-native";
import type { Goal } from "@repped/shared";
import { useProfile } from "../../src/hooks/useProfile";
import {
  SubScreenLayout,
  FormLabel,
  SubSection,
} from "../../src/components/account/SubScreenLayout";
import { FormGroup } from "../../src/components/account/FormGroup";
import { InputRow } from "../../src/components/account/InputRow";
import { PickerSheet } from "../../src/components/account/PickerSheet";
import { ConfirmModal } from "../../src/components/account/ConfirmModal";
import { GOAL_LABELS } from "../../src/lib/account-labels";
import { validateGoalTarget } from "../../src/lib/account-validation";
import { regenerateWorkoutPlan } from "../../src/lib/regenerate-plan";
import { useAuthStore } from "@repped/shared";

const GOAL_OPTIONS = [
  { value: "lose_fat" as Goal, label: "Lose Fat" },
  { value: "build_muscle" as Goal, label: "Build Muscle" },
  { value: "maintain" as Goal, label: "Stay Fit" },
];

export default function AccountGoal() {
  const { profile, updateProfile } = useProfile();
  const userId = useAuthStore((s) => s.session?.user?.id);

  const [goal, setGoal] = useState<Goal>("maintain");
  const [originalGoal, setOriginalGoal] = useState<Goal>("maintain");
  const [targetWeight, setTargetWeight] = useState(0);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      const g = (profile.goal as Goal) ?? "maintain";
      setGoal(g);
      setOriginalGoal(g);
      setTargetWeight(profile.target_weight_kg ?? profile.weight_kg ?? 70);
    }
  }, [profile]);

  const currentWeight = profile?.weight_kg ?? 0;
  const heightCm = profile?.height_cm ?? 0;

  const validation = useMemo(() => {
    if (!currentWeight || !heightCm || !targetWeight) return { severity: "ok" as const, message: null };
    return validateGoalTarget({ goal, currentWeightKg: currentWeight, targetWeightKg: targetWeight, heightCm });
  }, [goal, currentWeight, targetWeight, heightCm]);

  const togo = targetWeight - currentWeight;
  const togoLabel = togo >= 0 ? `+${togo} kg` : `${togo} kg`;

  const goalChanged = goal !== originalGoal;

  const handleSave = () => {
    if (validation.severity === "error") {
      Alert.alert("Can't save", validation.message ?? "Fix the goal mismatch first.");
      return;
    }
    if (goalChanged) {
      setConfirmOpen(true);
      return;
    }
    void doSave();
  };

  const doSave = async () => {
    if (saving) return;
    setSaving(true);
    const err = await updateProfile({ goal: goal, target_weight_kg: targetWeight });
    if (err) {
      setSaving(false);
      Alert.alert("Couldn't save", err.message);
      return;
    }
    // Goal change → regenerate plan (current immediate-wipe behavior; boundary-aware comes in Phase 2).
    if (goalChanged && userId) {
      await regenerateWorkoutPlan(userId);
    }
    setSaving(false);
    setConfirmOpen(false);
    router.replace("/(app)/settings" as any);
  };

  return (
    <SubScreenLayout title="Your Goal" onSave={handleSave} saveDisabled={saving}>
      <SubSection>
        <FormLabel>Goal</FormLabel>
        <FormGroup>
          <InputRow
            variant="tappable"
            label="Type"
            value={GOAL_LABELS[goal]}
            onPress={() => setPickerOpen(true)}
            isFirst
          />
          <InputRow
            variant="number-input"
            label="Target weight (kg)"
            value={targetWeight}
            onChangeNumber={setTargetWeight}
            min={30}
            max={200}
          />
        </FormGroup>
        {validation.message && (
          <View
            style={{
              marginTop: 8,
              padding: 12,
              borderRadius: 14,
              backgroundColor: validation.severity === "error"
                ? "rgba(239,68,68,0.08)"
                : "rgba(245,158,11,0.10)",
              borderWidth: 1,
              borderColor: validation.severity === "error"
                ? "rgba(239,68,68,0.25)"
                : "rgba(245,158,11,0.25)",
              flexDirection: "row",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "700", color: validation.severity === "error" ? "#EF4444" : "#F59E0B" }}>!</Text>
            <Text style={{ flex: 1, fontSize: 12, color: "#1A1A1A", lineHeight: 17 }}>
              {validation.message}
            </Text>
          </View>
        )}
      </SubSection>

      <SubSection>
        <FormLabel>Progress</FormLabel>
        <FormGroup>
          <InputRow
            variant="readonly"
            label="Current weight"
            value={currentWeight ? `${currentWeight} kg` : "—"}
            isFirst
          />
          <InputRow
            variant="readonly"
            label="To go"
            value={currentWeight ? togoLabel : "—"}
          />
        </FormGroup>
      </SubSection>

      <PickerSheet
        visible={pickerOpen}
        title="Goal"
        options={GOAL_OPTIONS}
        current={goal}
        onCancel={() => setPickerOpen(false)}
        onSingleSelect={(v) => {
          setGoal(v as Goal);
          setPickerOpen(false);
        }}
      />

      <ConfirmModal
        visible={confirmOpen}
        title={`Switch to ${GOAL_LABELS[goal]}?`}
        diffs={[
          { label: "Goal", from: GOAL_LABELS[originalGoal], to: GOAL_LABELS[goal] },
        ]}
        effects={[
          "Macros recalculate today",
          "Plan rebuilds on save",
          "Logged history preserved",
        ]}
        cancelLabel="Cancel"
        applyLabel="Update goal"
        onCancel={() => setConfirmOpen(false)}
        onApply={() => { void doSave(); }}
      />
    </SubScreenLayout>
  );
}
