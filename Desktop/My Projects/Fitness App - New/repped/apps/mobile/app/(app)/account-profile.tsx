import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Alert } from "react-native";
import { calcAge, formatDOB } from "@repped/shared";
import { useProfile } from "../../src/hooks/useProfile";
import {
  SubScreenLayout,
  FormLabel,
  SubSection,
} from "../../src/components/account/SubScreenLayout";
import { FormGroup } from "../../src/components/account/FormGroup";
import { InputRow } from "../../src/components/account/InputRow";

export default function AccountProfile() {
  const { profile, updateProfile } = useProfile();
  const [name, setName] = useState("");
  const [weightKg, setWeightKg] = useState(0);
  const [heightCm, setHeightCm] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.display_name ?? "");
      setWeightKg(profile.weight_kg ?? 0);
      setHeightCm(profile.height_cm ?? 0);
    }
  }, [profile]);

  const handleSave = async () => {
    if (saving) return;
    if (!name.trim()) {
      Alert.alert("Name can't be empty");
      return;
    }
    setSaving(true);
    const err = await updateProfile({
      display_name: name.trim(),
      weight_kg: weightKg,
      height_cm: heightCm,
    });
    setSaving(false);
    if (err) {
      Alert.alert("Couldn't save", err.message);
      return;
    }
    router.replace("/(app)/settings" as any);
  };

  const age = profile?.date_of_birth ? calcAge(profile.date_of_birth) : 0;

  return (
    <SubScreenLayout title="Profile" onSave={handleSave} saveDisabled={saving}>
      <SubSection>
        <FormLabel>Basics</FormLabel>
        <FormGroup>
          <InputRow
            variant="text-input"
            label="Name"
            value={name}
            onChangeText={setName}
            isFirst
          />
          <InputRow
            variant="readonly"
            label="Date of Birth"
            value={profile?.date_of_birth ? formatDOB(profile.date_of_birth) : "—"}
          />
          <InputRow
            variant="readonly"
            label="Age"
            value={age ? `${age} years` : "—"}
          />
          <InputRow
            variant="readonly"
            label="Sex"
            value={profile?.sex ? profile.sex.charAt(0).toUpperCase() + profile.sex.slice(1) : "—"}
          />
        </FormGroup>
      </SubSection>

      <SubSection>
        <FormLabel>Body</FormLabel>
        <FormGroup>
          <InputRow
            variant="number-input"
            label="Weight (kg)"
            value={weightKg}
            onChangeNumber={setWeightKg}
            min={30}
            max={200}
            isFirst
          />
          <InputRow
            variant="number-input"
            label="Height (cm)"
            value={heightCm}
            onChangeNumber={setHeightCm}
            min={100}
            max={230}
          />
        </FormGroup>
      </SubSection>
    </SubScreenLayout>
  );
}
