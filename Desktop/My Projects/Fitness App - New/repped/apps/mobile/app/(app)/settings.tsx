import { View, Text, Pressable, Alert, ScrollView, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@repped/shared";
import { supabase } from "../../src/lib/supabase";
import { theme } from "../../src/lib/styles";
import { TopoBackground } from "../../src/components/terrain";

const SettingsRow = ({ label, value, onPress, isLast = false }: { label: string; value?: string; onPress?: () => void; isLast?: boolean }) => (
  <Pressable
    onPress={onPress}
    style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center",
      paddingHorizontal: 20, paddingVertical: 16,
      borderBottomWidth: isLast ? 0 : 0.5, borderBottomColor: "#DDD9CE" }}
  >
    <Text style={{ color: "#2D2A24", fontSize: 15 }}>{label}</Text>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      {value && <Text style={{ color: "#8E8E7A", fontSize: 15 }}>{value}</Text>}
      {onPress && <Text style={{ color: "#8E8E7A", fontSize: 16 }}>›</Text>}
    </View>
  </Pressable>
);

export default function Settings() {
  const session = useAuthStore((s) => s.session);
  const signOut = useAuthStore((s) => s.signOut);
  const [profile, setProfile] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = async () => {
    if (session?.user?.id) {
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      setProfile(data);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  }, []);

  useEffect(() => { loadProfile(); }, []);

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: async () => { await supabase.auth.signOut(); signOut(); router.replace("/(auth)/sign-in"); } },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F6F5F0" }}>
      <TopoBackground />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2D2A24" />}>
        <View style={{ paddingHorizontal: 24, paddingTop: 60 }}>

          <Text style={{ fontSize: 24, fontWeight: "700", color: "#2D2A24", marginBottom: 24 }}>Account</Text>

          {profile && (
            <View style={{ backgroundColor: "#2D2A24", borderRadius: 22, padding: 20, marginBottom: 20,
              flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(52,211,153,0.15)",
                alignItems: "center", justifyContent: "center", marginRight: 14 }}>
                <Text style={{ color: "#34D399", fontSize: 20, fontWeight: "700" }}>
                  {(session?.user?.email?.[0] ?? "R").toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#F6F5F0", fontSize: 15, fontWeight: "600" }}>{session?.user?.email}</Text>
                <Text style={{ color: "rgba(246,245,240,0.4)", fontSize: 13, marginTop: 2 }}>
                  {profile.training_history} · {profile.goal?.replace("_", " ")}
                </Text>
              </View>
            </View>
          )}

          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1,
            borderColor: "rgba(0,0,0,0.04)", marginBottom: 12 }}>
            <SettingsRow label="Equipment" value={profile?.equipment?.replace("_", " ")} />
            <SettingsRow label="Days/Week" value={String(profile?.days_per_week ?? "—")} />
            <SettingsRow label="Daily Calories" value={profile?.tdee ? `${Math.round(profile.tdee)} cal` : "—"} isLast />
          </View>

          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1,
            borderColor: "rgba(0,0,0,0.04)", marginBottom: 12 }}>
            <SettingsRow label="Regenerate Workout Plan" onPress={() => router.push("/(app)/generate-plan" as any)} />
            <SettingsRow label="Weekly Check-in" onPress={() => router.push("/(app)/checkin" as any)} isLast />
          </View>

          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1,
            borderColor: "rgba(0,0,0,0.04)", marginBottom: 12 }}>
            <SettingsRow label="Achievements" onPress={() => router.push("/(app)/achievements" as any)} />
            <SettingsRow label="Weekly Summary" onPress={() => router.push("/(app)/weekly-summary" as any)} isLast />
          </View>

          <Pressable onPress={handleSignOut} style={{ marginTop: 12, borderRadius: 20,
            borderWidth: 1.5, borderColor: "#EF4444", backgroundColor: "transparent",
            paddingVertical: 16, alignItems: "center" }}>
            <Text style={{ color: "#EF4444", fontSize: 16, fontWeight: "600" }}>Sign Out</Text>
          </Pressable>

        </View>
      </ScrollView>
    </View>
  );
}
