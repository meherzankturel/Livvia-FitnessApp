import { View, Text, Pressable, ScrollView, RefreshControl, Alert } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { useAuthStore } from "@repped/shared";
import { supabase } from "../../src/lib/supabase";
import { useProfile } from "../../src/hooks/useProfile";
import { AccountHero } from "../../src/components/account/AccountHero";
import { SettingsRow } from "../../src/components/account/SettingsRow";
import { SectionHeading } from "../../src/components/account/SectionHeading";
import { AvatarPicker } from "../../src/components/AvatarPicker";
import { ConfirmModal } from "../../src/components/account/ConfirmModal";
import {
  ProfileIcon, GoalIcon, TrainingIcon, NutritionIcon,
  PreferencesIcon, HelpIcon,
} from "../../src/components/account/icons";

export default function Account() {
  const session = useAuthStore((s) => s.session);
  const signOut = useAuthStore((s) => s.signOut);
  const { profile, userEmail, loading, reload } = useProfile();
  const [refreshing, setRefreshing] = useState(false);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          signOut();
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  const handleDelete = async () => {
    setDeleteConfirmOpen(false);
    // Real deletion would call a Supabase Edge Function; placeholder for now.
    Alert.alert("Account deletion", "Contact support@revive.app to delete your account permanently.");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: 56, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1A1A1A" />}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "800",
            color: "#1A1A1A",
            letterSpacing: -0.4,
            marginHorizontal: 24,
            marginBottom: 12,
          }}
        >
          Account
        </Text>

        <AccountHero
          name={profile?.display_name ?? (userEmail?.split("@")[0] ?? "Athlete")}
          email={userEmail}
          avatarUrl={profile?.avatar_url}
          onAvatarPress={() => setAvatarPickerOpen(true)}
        />

        <SectionHeading>Settings</SectionHeading>
        <View style={{ marginHorizontal: 20, gap: 10 }}>
          <SettingsRow
            icon={<ProfileIcon />}
            label="Profile"
            onPress={() => router.push("/(app)/account-profile" as any)}
          />
          <SettingsRow
            icon={<GoalIcon />}
            label="Your Goal"
            onPress={() => router.push("/(app)/account-goal" as any)}
          />
          <SettingsRow
            icon={<TrainingIcon />}
            label="Training"
            onPress={() => router.push("/(app)/account-training" as any)}
          />
          <SettingsRow
            icon={<NutritionIcon />}
            label="Nutrition"
            onPress={() => router.push("/(app)/account-nutrition" as any)}
          />
          <SettingsRow
            icon={<PreferencesIcon />}
            label="Preferences"
            onPress={() => router.push("/(app)/account-preferences" as any)}
          />
        </View>

        <SectionHeading>Support</SectionHeading>
        <View style={{ marginHorizontal: 20, gap: 10 }}>
          <SettingsRow
            icon={<HelpIcon />}
            label="Help & Legal"
            onPress={() => router.push("/(app)/account-help" as any)}
          />
        </View>

        {/* Exit actions */}
        <View style={{ marginHorizontal: 20, marginTop: 28, marginBottom: 8, alignItems: "center", gap: 4 }}>
          <Pressable
            onPress={handleSignOut}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, paddingVertical: 10, paddingHorizontal: 16 })}
          >
            <Text style={{ fontSize: 15, fontWeight: "600", color: "#1A1A1A", letterSpacing: -0.1 }}>
              Sign Out
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setDeleteConfirmOpen(true)}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, paddingVertical: 6, paddingHorizontal: 16 })}
          >
            <Text style={{ fontSize: 13, color: "#EF4444" }}>Delete Account</Text>
          </Pressable>
        </View>

        <Text
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "#9A9A92",
            opacity: 0.7,
            marginTop: 12,
          }}
        >
          Revive v1.2.4
        </Text>
      </ScrollView>

      <AvatarPicker
        visible={avatarPickerOpen}
        userId={session?.user?.id ?? ""}
        currentAvatar={profile?.avatar_url ?? null}
        displayName={profile?.display_name ?? userEmail.split("@")[0] ?? "Athlete"}
        onClose={() => setAvatarPickerOpen(false)}
        onAvatarChanged={() => reload()}
      />

      <ConfirmModal
        visible={deleteConfirmOpen}
        title="Delete account?"
        body="This permanently removes all your workouts, meals, and progress data. You can't undo this."
        cancelLabel="Cancel"
        applyLabel="Delete"
        destructive
        onCancel={() => setDeleteConfirmOpen(false)}
        onApply={handleDelete}
      />
    </View>
  );
}
