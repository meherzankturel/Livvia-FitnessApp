import { useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { Alert } from "react-native";
import type { TrainingHistory, Equipment } from "@repped/shared";
import { useAuthStore } from "@repped/shared";
import { useProfile } from "../../src/hooks/useProfile";
import {
  SubScreenLayout,
  FormLabel,
  SubSection,
} from "../../src/components/account/SubScreenLayout";
import { FormGroup } from "../../src/components/account/FormGroup";
import { InputRow } from "../../src/components/account/InputRow";
import { PickerSheet } from "../../src/components/account/PickerSheet";
import { ConfirmModal, type DiffItem } from "../../src/components/account/ConfirmModal";
import {
  EXPERIENCE_LABELS,
  EQUIPMENT_LABELS,
  INJURY_LABELS,
  labelMulti,
} from "../../src/lib/account-labels";
import { regenerateWorkoutPlan } from "../../src/lib/regenerate-plan";

const EXPERIENCE_OPTIONS: { value: TrainingHistory; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const EQUIPMENT_OPTIONS: { value: Equipment; label: string }[] = [
  { value: "full_gym", label: "Full Gym" },
  { value: "dumbbells_only", label: "Dumbbells Only" },
  { value: "home_gym", label: "Home Gym" },
  { value: "bodyweight", label: "Bodyweight" },
];

const DAYS_OPTIONS = [2, 3, 4, 5, 6, 7].map((n) => ({ value: n, label: String(n) }));

const INJURY_OPTIONS = Object.entries(INJURY_LABELS).map(([value, label]) => ({ value, label }));

type Field = "experience" | "equipment" | "days" | "injuries" | null;

export default function AccountTraining() {
  const { profile, updateProfile } = useProfile();
  const userId = useAuthStore((s) => s.session?.user?.id);

  const [experience, setExperience] = useState<TrainingHistory>("intermediate");
  const [equipment, setEquipment] = useState<Equipment>("full_gym");
  const [days, setDays] = useState(5);
  const [injuries, setInjuries] = useState<string[]>([]);

  const [original, setOriginal] = useState({
    experience: "intermediate" as TrainingHistory,
    equipment: "full_gym" as Equipment,
    days: 5,
    injuries: [] as string[],
  });

  const [openPicker, setOpenPicker] = useState<Field>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      const exp = (profile.training_history as TrainingHistory) ?? "intermediate";
      const eq = (profile.equipment as Equipment) ?? "full_gym";
      const d = profile.days_per_week ?? 5;
      const inj = (profile.current_injuries ?? []).map((x) => x.key);
      setExperience(exp);
      setEquipment(eq);
      setDays(d);
      setInjuries(inj);
      setOriginal({ experience: exp, equipment: eq, days: d, injuries: inj });
    }
  }, [profile]);

  const diff: DiffItem[] = useMemo(() => {
    const changes: DiffItem[] = [];
    if (experience !== original.experience) {
      changes.push({
        label: "Experience",
        from: EXPERIENCE_LABELS[original.experience],
        to: EXPERIENCE_LABELS[experience],
      });
    }
    if (equipment !== original.equipment) {
      changes.push({
        label: "Equipment",
        from: EQUIPMENT_LABELS[original.equipment],
        to: EQUIPMENT_LABELS[equipment],
      });
    }
    if (days !== original.days) {
      changes.push({ label: "Days per week", from: String(original.days), to: String(days) });
    }
    const sortedOrig = [...original.injuries].sort().join(",");
    const sortedCur = [...injuries].sort().join(",");
    if (sortedOrig !== sortedCur) {
      changes.push({
        label: "Injuries",
        from: labelMulti(original.injuries, INJURY_LABELS),
        to: labelMulti(injuries, INJURY_LABELS),
      });
    }
    return changes;
  }, [experience, equipment, days, injuries, original]);

  const handleSave = () => {
    if (diff.length === 0) {
      router.replace("/(app)/settings" as any);
      return;
    }
    setConfirmOpen(true);
  };

  const doSave = async () => {
    if (saving || !userId) return;
    setSaving(true);
    const err = await updateProfile({
      training_history: experience,
      equipment: equipment,
      days_per_week: days,
      current_injuries: injuries.map((key) => ({ key, severity: "moderate", since: new Date().toISOString().split("T")[0] })),
    });
    if (err) {
      setSaving(false);
      Alert.alert("Couldn't save", err.message);
      return;
    }
    // Plan-affecting changes → regenerate immediately (Phase 1 behavior).
    await regenerateWorkoutPlan(userId);
    setSaving(false);
    setConfirmOpen(false);
    router.replace("/(app)/settings" as any);
  };

  const hasPlanFields = diff.some((d) => d.label !== "Injuries");
  const hasInjuryFields = diff.some((d) => d.label === "Injuries");
  const effects: string[] = [];
  if (hasPlanFields) {
    effects.push("New plan rebuilds on save");
    effects.push("Logged history preserved");
  }
  if (hasInjuryFields) {
    effects.push("Injury filter applies to your next workout");
  }
  effects.push("Current training phase continues");

  return (
    <SubScreenLayout title="Training" onSave={handleSave} saveDisabled={saving}>
      <SubSection>
        <FormLabel>Training</FormLabel>
        <FormGroup>
          <InputRow
            variant="tappable"
            label="Experience"
            value={EXPERIENCE_LABELS[experience]}
            onPress={() => setOpenPicker("experience")}
            isFirst
          />
          <InputRow
            variant="tappable"
            label="Equipment"
            value={EQUIPMENT_LABELS[equipment]}
            onPress={() => setOpenPicker("equipment")}
          />
          <InputRow
            variant="tappable"
            label="Days per week"
            value={String(days)}
            onPress={() => setOpenPicker("days")}
          />
          <InputRow
            variant="tappable"
            label="Injuries"
            value={labelMulti(injuries, INJURY_LABELS)}
            onPress={() => setOpenPicker("injuries")}
          />
        </FormGroup>
      </SubSection>

      <SubSection>
        <FormLabel>Plan</FormLabel>
        <FormGroup>
          <InputRow
            variant="custom"
            label="Regenerate workout plan"
            isFirst
            right={null}
          />
        </FormGroup>
      </SubSection>

      <PickerSheet
        visible={openPicker === "experience"}
        title="Experience"
        options={EXPERIENCE_OPTIONS}
        current={experience}
        onCancel={() => setOpenPicker(null)}
        onSingleSelect={(v) => {
          setExperience(v as TrainingHistory);
          setOpenPicker(null);
        }}
      />
      <PickerSheet
        visible={openPicker === "equipment"}
        title="Equipment"
        options={EQUIPMENT_OPTIONS}
        current={equipment}
        onCancel={() => setOpenPicker(null)}
        onSingleSelect={(v) => {
          setEquipment(v as Equipment);
          setOpenPicker(null);
        }}
      />
      <PickerSheet
        visible={openPicker === "days"}
        title="Days per week"
        options={DAYS_OPTIONS}
        current={days}
        onCancel={() => setOpenPicker(null)}
        onSingleSelect={(v) => {
          setDays(v as number);
          setOpenPicker(null);
        }}
      />
      <PickerSheet
        visible={openPicker === "injuries"}
        title="Injuries"
        options={INJURY_OPTIONS}
        current={injuries}
        multi
        compact
        onCancel={() => setOpenPicker(null)}
        onMultiSelect={(vals) => {
          setInjuries(vals as string[]);
          setOpenPicker(null);
        }}
      />

      <ConfirmModal
        visible={confirmOpen}
        title="Update training settings?"
        diffs={diff}
        effects={effects}
        cancelLabel="Cancel"
        applyLabel="Update plan"
        onCancel={() => setConfirmOpen(false)}
        onApply={() => { void doSave(); }}
      />
    </SubScreenLayout>
  );
}
