import { View, Text, Pressable, Alert, ScrollView, RefreshControl, Animated, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useEffect, useState, useCallback, useRef } from "react";
import { useAuthStore } from "@repped/shared";
import { supabase } from "../../src/lib/supabase";
import { TopoBackground } from "../../src/components/terrain";

// ——— Animated Avatar Ring ———
function AvatarRing() {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.15, duration: 1200, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 1200, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.5, duration: 1200, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={{
      position: "absolute", top: -4, left: -4, right: -4, bottom: -4,
      borderRadius: 999, borderWidth: 2, borderColor: "rgba(52,211,153,0.2)",
      transform: [{ scale }], opacity,
    }} />
  );
}

// ——— Action Row ———
function ActionRow({ icon, iconBg, label, onPress, isLast = false }: {
  icon: string; iconBg: string; label: string; onPress: () => void; isLast?: boolean;
}) {
  const slideX = useRef(new Animated.Value(0)).current;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => Animated.spring(slideX, { toValue: 3, damping: 18, stiffness: 200, mass: 0.6, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(slideX, { toValue: 0, damping: 18, stiffness: 200, mass: 0.6, useNativeDriver: true }).start()}
      style={[s.arow, !isLast && s.arowBorder]}
    >
      <Animated.View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1, transform: [{ translateX: slideX }] }}>
        <View style={[s.aIcon, { backgroundColor: iconBg }]}>
          <Text style={{ fontSize: 14 }}>{icon}</Text>
        </View>
        <Text style={s.aText}>{label}</Text>
        <Text style={s.aArrow}>›</Text>
      </Animated.View>
    </Pressable>
  );
}

// ——— Main Screen ———
export default function Settings() {
  const session = useAuthStore((s) => s.session);
  const signOut = useAuthStore((s) => s.signOut);
  const [profile, setProfile] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Stagger animation
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(12)).current;
  const group1Opacity = useRef(new Animated.Value(0)).current;
  const group1TranslateY = useRef(new Animated.Value(10)).current;
  const group2Opacity = useRef(new Animated.Value(0)).current;
  const group2TranslateY = useRef(new Animated.Value(10)).current;

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

  useEffect(() => {
    loadProfile();
    // Stagger entrance
    Animated.stagger(120, [
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(cardTranslateY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(group1Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(group1TranslateY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(group2Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(group2TranslateY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: async () => { await supabase.auth.signOut(); signOut(); router.replace("/(auth)/sign-in"); } },
    ]);
  };

  const initial = (session?.user?.email?.[0] ?? "R").toUpperCase();
  const equipment = profile?.equipment?.replace("_", " ") ?? "—";
  const goal = profile?.goal?.replace("_", " ") ?? "—";
  const calories = profile?.tdee ? String(Math.round(profile.tdee)) : "—";
  const daysPerWeek = String(profile?.days_per_week ?? "—");
  const trainingHistory = profile?.training_history ?? "—";

  return (
    <View style={{ flex: 1, backgroundColor: "#F6F5F0" }}>
      <TopoBackground />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2D2A24" />}
      >
        <View style={s.zone}>
          <Text style={s.title}>Account</Text>

          {/* ——— Player Card ——— */}
          <Animated.View style={[s.card, { opacity: cardOpacity, transform: [{ translateY: cardTranslateY }] }]}>
            {/* Profile row */}
            <View style={s.cardTop}>
              <View style={s.avatarWrap}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{initial}</Text>
                </View>
                <AvatarRing />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.cardEmail} numberOfLines={1}>{session?.user?.email}</Text>
                <Text style={s.cardMeta}>{goal} · {equipment}</Text>
                <View style={s.rankBadge}>
                  <Text style={s.rankText}>{trainingHistory}</Text>
                </View>
              </View>
            </View>

            {/* Stats pills */}
            <View style={s.statPills}>
              <View style={s.statPill}>
                <Text style={s.spVal}>{calories}</Text>
                <Text style={s.spLabel}>Cal / Day</Text>
              </View>
              <View style={s.statPill}>
                <Text style={s.spVal}>{daysPerWeek}</Text>
                <Text style={s.spLabel}>Days / Wk</Text>
              </View>
              <View style={s.statPill}>
                <Text style={[s.spVal, equipment.length > 6 && { fontSize: 14 }]}>{equipment}</Text>
                <Text style={s.spLabel}>Equipment</Text>
              </View>
            </View>
          </Animated.View>

          {/* ——— Training Actions ——— */}
          <Animated.View style={[s.agroup, { opacity: group1Opacity, transform: [{ translateY: group1TranslateY }] }]}>
            <ActionRow icon="🔄" iconBg="rgba(52,211,153,0.08)" label="Regenerate Workout Plan"
              onPress={() => router.push("/(app)/generate-plan" as any)} />
            <ActionRow icon="📋" iconBg="rgba(245,158,11,0.08)" label="Weekly Check-in"
              onPress={() => router.push("/(app)/checkin" as any)} isLast />
          </Animated.View>

          {/* ——— Progress Actions ——— */}
          <Animated.View style={[s.agroup, { opacity: group2Opacity, transform: [{ translateY: group2TranslateY }] }]}>
            <ActionRow icon="🏆" iconBg="rgba(99,102,241,0.08)" label="Achievements"
              onPress={() => router.push("/(app)/achievements" as any)} />
            <ActionRow icon="📊" iconBg="#EDEBE5" label="Weekly Summary"
              onPress={() => router.push("/(app)/weekly-summary" as any)} isLast />
          </Animated.View>

          {/* ——— Sign Out ——— */}
          <Pressable onPress={handleSignOut} style={s.signout}>
            <Text style={s.signoutText}>Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  zone: { paddingHorizontal: 20, paddingTop: 56 },
  title: { fontSize: 24, fontWeight: "800", color: "#2D2A24", marginBottom: 20 },

  // Player card
  card: {
    backgroundColor: "#2D2A24",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    overflow: "hidden",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 18,
  },
  avatarWrap: {
    width: 56, height: 56,
    position: "relative",
    flexShrink: 0,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: "rgba(52,211,153,0.12)",
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 24, fontWeight: "800", color: "#34D399" },
  cardEmail: { fontSize: 14, fontWeight: "600", color: "#F6F5F0" },
  cardMeta: { fontSize: 11, color: "#8E8E7A", marginTop: 2 },
  rankBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 99,
    backgroundColor: "rgba(52,211,153,0.1)",
    marginTop: 6,
  },
  rankText: {
    fontSize: 10, fontWeight: "700", color: "#34D399",
    textTransform: "uppercase", letterSpacing: 0.5,
  },

  // Stat pills
  statPills: { flexDirection: "row", gap: 6 },
  statPill: {
    flex: 1,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
  },
  spVal: { fontSize: 18, fontWeight: "800", color: "#F6F5F0", lineHeight: 22 },
  spLabel: {
    fontSize: 8, fontWeight: "600", color: "#8E8E7A",
    textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2,
  },

  // Action groups
  agroup: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 10,
    borderWidth: 1, borderColor: "rgba(0,0,0,0.04)",
  },
  arow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  arowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.04)",
  },
  aIcon: {
    width: 32, height: 32, borderRadius: 9,
    alignItems: "center", justifyContent: "center",
  },
  aText: { flex: 1, fontSize: 14, fontWeight: "600", color: "#2D2A24" },
  aArrow: { fontSize: 15, color: "#DEDBD4" },

  // Sign out
  signout: {
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 6,
  },
  signoutText: { fontSize: 13, fontWeight: "600", color: "#EF4444", opacity: 0.6 },
});
