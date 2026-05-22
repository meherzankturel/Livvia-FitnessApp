import { useState } from "react";
import { router } from "expo-router";
import { View, Text, Pressable } from "react-native";
import {
  SubScreenLayout,
  FormLabel,
  SubSection,
} from "../../src/components/account/SubScreenLayout";
import { FormGroup } from "../../src/components/account/FormGroup";
import { InputRow } from "../../src/components/account/InputRow";

const C = { earth: "#1A1A1A", sand: "#F6F5F0", stone: "#EDEBE5", trail: "#34D399" };

/** Tiny segmented control reused inline for units. */
function Segmented({
  value, options, onPick,
}: { value: string; options: { value: string; label: string }[]; onPick: (v: string) => void }) {
  return (
    <View style={{ flexDirection: "row", backgroundColor: C.sand, padding: 3, borderRadius: 10, width: 130 }}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onPick(opt.value)}
            style={{
              flex: 1,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: active ? C.earth : "transparent",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 12, fontFamily: "Quicksand_600SemiBold", fontWeight: "600", color: active ? "#FFFFFF" : "#9A9A92" }}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Switch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <Pressable
      onPress={onToggle}
      style={{
        width: 44, height: 26, borderRadius: 13,
        backgroundColor: on ? C.trail : C.stone,
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: 22, height: 22, borderRadius: 11,
          backgroundColor: "#FFFFFF",
          marginLeft: on ? 20 : 2,
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 6,
          elevation: 2,
        }}
      />
    </Pressable>
  );
}

export default function AccountPreferences() {
  // Preferences are client-side for now (no profile columns yet). When backend lands, swap to useProfile.
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [heightUnit, setHeightUnit] = useState<"cm" | "in">("cm");
  const [workoutNotif, setWorkoutNotif] = useState(true);
  const [mealNotif, setMealNotif] = useState(true);
  const [summaryNotif, setSummaryNotif] = useState(true);

  return (
    <SubScreenLayout
      title="Preferences"
      onSave={() => router.replace("/(app)/settings" as any)}
    >
      <SubSection>
        <FormLabel>Units</FormLabel>
        <FormGroup>
          <InputRow
            variant="custom"
            label="Weight"
            isFirst
            right={
              <Segmented
                value={weightUnit}
                options={[{ value: "kg", label: "Kg" }, { value: "lbs", label: "Lbs" }]}
                onPick={(v) => setWeightUnit(v as "kg" | "lbs")}
              />
            }
          />
          <InputRow
            variant="custom"
            label="Height"
            right={
              <Segmented
                value={heightUnit}
                options={[{ value: "cm", label: "Cm" }, { value: "in", label: "In" }]}
                onPick={(v) => setHeightUnit(v as "cm" | "in")}
              />
            }
          />
        </FormGroup>
      </SubSection>

      <SubSection>
        <FormLabel>Notifications</FormLabel>
        <FormGroup>
          <InputRow
            variant="custom"
            label="Workout reminders"
            isFirst
            right={<Switch on={workoutNotif} onToggle={() => setWorkoutNotif(!workoutNotif)} />}
          />
          <InputRow
            variant="custom"
            label="Meal reminders"
            right={<Switch on={mealNotif} onToggle={() => setMealNotif(!mealNotif)} />}
          />
          <InputRow
            variant="custom"
            label="Weekly summary"
            right={<Switch on={summaryNotif} onToggle={() => setSummaryNotif(!summaryNotif)} />}
          />
        </FormGroup>
      </SubSection>
    </SubScreenLayout>
  );
}
