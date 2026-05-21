import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Alert } from "react-native";
import type { DietaryPreference } from "@repped/shared";
import { useProfile } from "../../src/hooks/useProfile";
import {
  SubScreenLayout,
  FormLabel,
  SubSection,
} from "../../src/components/account/SubScreenLayout";
import { FormGroup } from "../../src/components/account/FormGroup";
import { InputRow } from "../../src/components/account/InputRow";
import { PickerSheet } from "../../src/components/account/PickerSheet";
import {
  DIET_LABELS,
  MEAT_LABELS,
  ALLERGEN_LABELS,
  CUISINE_LABELS,
  labelMulti,
} from "../../src/lib/account-labels";

const DIET_OPTIONS: { value: DietaryPreference; label: string }[] = [
  { value: "no_preference", label: "Non-Veg" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "pescatarian", label: "Pescatarian" },
  { value: "keto", label: "Keto" },
];

const MEAT_OPTIONS = Object.entries(MEAT_LABELS).map(([value, label]) => ({ value, label }));
const ALLERGEN_OPTIONS = Object.entries(ALLERGEN_LABELS).map(([value, label]) => ({ value, label }));
const CUISINE_OPTIONS = Object.entries(CUISINE_LABELS).map(([value, label]) => ({ value, label }));

type Field = "diet" | "meat" | "allergies" | "cuisines" | null;

export default function AccountNutrition() {
  const { profile, updateProfile } = useProfile();

  const [diet, setDiet] = useState<DietaryPreference>("no_preference");
  const [meatPreset, setMeatPreset] = useState<string>("any");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [openPicker, setOpenPicker] = useState<Field>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDiet((profile.dietary_preference as DietaryPreference) ?? "no_preference");
      // Derive a coarse meat preset from meat_preferences array
      const meats = profile.meat_preferences ?? [];
      if (meats.length === 0) setMeatPreset("any");
      else if (meats.length === 1 && meats[0] === "chicken") setMeatPreset("chicken");
      else if (meats.length === 1 && meats[0] === "beef") setMeatPreset("beef");
      else setMeatPreset("any");
      setAllergies(profile.food_exclusions ?? []);
      setCuisines(profile.cuisine_preferences ?? []);
    }
  }, [profile]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    const meatMap: Record<string, string[]> = {
      any: ["chicken", "turkey", "beef", "lamb", "pork", "fish", "shrimp"],
      chicken: ["chicken"],
      beef: ["beef"],
      white: ["chicken", "turkey", "fish"],
      no_pork_beef: ["chicken", "turkey", "lamb", "fish", "shrimp"],
    };
    const err = await updateProfile({
      dietary_preference: diet,
      meat_preferences: meatMap[meatPreset] ?? meatMap.any,
      food_exclusions: allergies,
      cuisine_preferences: cuisines,
    });
    setSaving(false);
    if (err) {
      Alert.alert("Couldn't save", err.message);
      return;
    }
    router.replace("/(app)/settings" as any);
  };

  return (
    <SubScreenLayout title="Nutrition" onSave={handleSave} saveDisabled={saving}>
      <SubSection>
        <FormLabel>Preferences</FormLabel>
        <FormGroup>
          <InputRow
            variant="tappable"
            label="Diet"
            value={DIET_LABELS[diet]}
            onPress={() => setOpenPicker("diet")}
            isFirst
          />
          <InputRow
            variant="tappable"
            label="Meat"
            value={MEAT_LABELS[meatPreset] ?? "Any"}
            onPress={() => setOpenPicker("meat")}
          />
          <InputRow
            variant="tappable"
            label="Allergies"
            value={labelMulti(allergies, ALLERGEN_LABELS)}
            onPress={() => setOpenPicker("allergies")}
          />
          <InputRow
            variant="tappable"
            label="Cuisines"
            value={labelMulti(cuisines, CUISINE_LABELS, "None selected")}
            onPress={() => setOpenPicker("cuisines")}
          />
        </FormGroup>
      </SubSection>

      <PickerSheet
        visible={openPicker === "diet"}
        title="Diet"
        options={DIET_OPTIONS}
        current={diet}
        onCancel={() => setOpenPicker(null)}
        onSingleSelect={(v) => {
          setDiet(v as DietaryPreference);
          setOpenPicker(null);
        }}
      />
      <PickerSheet
        visible={openPicker === "meat"}
        title="Meat preference"
        options={MEAT_OPTIONS}
        current={meatPreset}
        onCancel={() => setOpenPicker(null)}
        onSingleSelect={(v) => {
          setMeatPreset(v as string);
          setOpenPicker(null);
        }}
      />
      <PickerSheet
        visible={openPicker === "allergies"}
        title="Allergies"
        options={ALLERGEN_OPTIONS}
        current={allergies}
        multi
        compact
        onCancel={() => setOpenPicker(null)}
        onMultiSelect={(vals) => {
          setAllergies(vals as string[]);
          setOpenPicker(null);
        }}
      />
      <PickerSheet
        visible={openPicker === "cuisines"}
        title="Cuisines"
        options={CUISINE_OPTIONS}
        current={cuisines}
        multi
        compact
        onCancel={() => setOpenPicker(null)}
        onMultiSelect={(vals) => {
          setCuisines(vals as string[]);
          setOpenPicker(null);
        }}
      />
    </SubScreenLayout>
  );
}
