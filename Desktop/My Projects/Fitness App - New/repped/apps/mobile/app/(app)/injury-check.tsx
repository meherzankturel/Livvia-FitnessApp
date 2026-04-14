import { View, Text, ScrollView, Pressable, StyleSheet, Animated, LayoutAnimation, Platform, UIManager } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { useAuthStore, INJURY_DEFINITIONS } from "@repped/shared";
import type { UserInjury } from "@repped/shared";
import { supabase } from "../../src/lib/supabase";
import { TopoBackground } from "../../src/components/terrain";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ——— Group definitions by body region ———
const BODY_GROUPS: { label: string; keys: string[] }[] = [
  { label: "Upper Body", keys: ["shoulder", "elbow", "wrist", "neck"] },
  { label: "Core", keys: ["lower_back"] },
  { label: "Lower Body", keys: ["knee", "ankle", "hip"] },
];

const SEVERITY_LEVELS = ["mild", "moderate", "severe"] as const;
type Severity = typeof SEVERITY_LEVELS[number];

const SEV_STYLES: Record<Severity, { bg: string; bgOn: string; color: string; colorOff: string; border: string; dot: string }> = {
  mild: {
    bg: "rgba(234,179,8,0.04)", bgOn: "rgba(234,179,8,0.12)",
    color: "#92400E", colorOff: "#D4A017",
    border: "rgba(234,179,8,0.4)", dot: "#EAB308",
  },
  moderate: {
    bg: "rgba(249,115,22,0.04)", bgOn: "rgba(249,115,22,0.12)",
    color: "#9A3412", colorOff: "#EA8C4D",
    border: "rgba(249,115,22,0.4)", dot: "#F97316",
  },
  severe: {
    bg: "rgba(239,68,68,0.04)", bgOn: "rgba(239,68,68,0.12)",
    color: "#991B1B", colorOff: "#F08080",
    border: "rgba(239,68,68,0.4)", dot: "#EF4444",
  },
};

const SEV_LABELS: Record<Severity, string> = { mild: "Mild", moderate: "Mod", severe: "Severe" };

// ——— Severity Pill Button ———
function SevPill({ level, isActive, onPress }: { level: Severity; isActive: boolean; onPress: () => void }) {
  const scale = useRef(new Animated.Value(isActive ? 1.05 : 1)).current;
  const sty = SEV_STYLES[level];

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isActive ? 1.05 : 1,
      damping: 18, stiffness: 200, mass: 0.6,
      useNativeDriver: true,
    }).start();
  }, [isActive]);

  return (
    <Pressable onPress={onPress}>
      <Animated.View style={[
        s.pill,
        {
          backgroundColor: isActive ? sty.bgOn : sty.bg,
          borderColor: isActive ? sty.border : `${sty.dot}15`,
          transform: [{ scale }],
        },
        isActive && { shadowColor: sty.dot, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 2 },
      ]}>
        <Text style={[s.pillText, { color: isActive ? sty.color : sty.colorOff }]}>
          {SEV_LABELS[level]}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

// ——— Main Screen ———
export default function InjuryCheck() {
  const { focus } = useLocalSearchParams<{ focus: string }>();
  const session = useAuthStore((s) => s.session);
  const [selectedInjuries, setSelectedInjuries] = useState<Map<string, Severity>>(new Map());
  const [existingInjuries, setExistingInjuries] = useState<UserInjury[]>([]);

  useEffect(() => {
    if (session?.user?.id) {
      supabase.from("profiles").select("current_injuries").eq("id", session.user.id).single()
        .then(({ data }) => {
          const injuries = ((data as any)?.current_injuries || []) as UserInjury[];
          setExistingInjuries(injuries);
          const map = new Map<string, Severity>();
          for (const inj of injuries) map.set(inj.key, inj.severity);
          setSelectedInjuries(map);
        });
    }
  }, []);

  const setSeverity = (key: string, level: Severity) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const next = new Map(selectedInjuries);
    if (next.get(key) === level) {
      next.delete(key); // tap same severity to deselect
    } else {
      next.set(key, level);
    }
    setSelectedInjuries(next);
  };

  const handleContinue = async () => {
    if (session?.user?.id) {
      const injuries: UserInjury[] = Array.from(selectedInjuries.entries()).map(([key, severity]) => ({
        key, severity, since: new Date().toISOString().split("T")[0],
      }));
      await (supabase.from("profiles").update as any)({ current_injuries: injuries }).eq("id", session.user.id);
    }
    router.push({
      pathname: "/(app)/warmup" as any,
      params: { focus: focus || "Full Body A", injuries: JSON.stringify(Array.from(selectedInjuries.entries())) },
    });
  };

  const handleSkip = () => {
    router.push({
      pathname: "/(app)/warmup" as any,
      params: { focus: focus || "Full Body A" },
    });
  };

  const hasSelections = selectedInjuries.size > 0;

  return (
    <View style={{ flex: 1, backgroundColor: "#F6F5F0" }}>
      <TopoBackground />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={s.zone}>
          <Text style={s.title}>Body Check</Text>
          <Text style={s.subtitle}>Tap a severity for any area bothering you.</Text>

          {/* Body part groups */}
          {BODY_GROUPS.map((group) => (
            <View key={group.label}>
              <Text style={s.groupLabel}>{group.label.toUpperCase()}</Text>
              <View style={s.cardGroup}>
                {group.keys.map((key, idx) => {
                  const def = INJURY_DEFINITIONS.find((d) => d.key === key);
                  if (!def) return null;
                  const currentSev = selectedInjuries.get(key);
                  const dotColor = currentSev ? SEV_STYLES[currentSev].dot : "#EDEBE5";

                  return (
                    <View
                      key={key}
                      style={[
                        s.row,
                        idx < group.keys.length - 1 && s.rowBorder,
                      ]}
                    >
                      <View style={s.rowLeft}>
                        <View style={[s.statusDot, { backgroundColor: dotColor }]} />
                        <Text style={[
                          s.rowName,
                          currentSev === "mild" && { color: "#92400E" },
                          currentSev === "moderate" && { color: "#9A3412" },
                          currentSev === "severe" && { color: "#991B1B" },
                        ]}>
                          {def.label}
                        </Text>
                      </View>
                      <View style={s.pillRow}>
                        {SEVERITY_LEVELS.map((level) => (
                          <SevPill
                            key={level}
                            level={level}
                            isActive={currentSev === level}
                            onPress={() => setSeverity(key, level)}
                          />
                        ))}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}

          {/* Summary */}
          {hasSelections && (
            <View style={s.summary}>
              <Text style={s.summaryText}>
                <Text style={{ fontWeight: "800", color: "#065F46" }}>{selectedInjuries.size} area{selectedInjuries.size > 1 ? "s" : ""}</Text>
                {" "}flagged — workout will be modified
              </Text>
            </View>
          )}

          {/* CTAs */}
          <Pressable onPress={handleContinue} style={[s.cta, hasSelections ? s.ctaModified : s.ctaGo]}>
            <Text style={hasSelections ? s.ctaModifiedText : s.ctaGoText}>
              {hasSelections ? "Continue with Modifications" : "I'm Good — Let's Go"}
            </Text>
          </Pressable>

          <Pressable onPress={handleSkip} style={s.skipBtn}>
            <Text style={s.skipText}>Skip Check</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  zone: { paddingHorizontal: 20, paddingTop: 56 },
  title: { fontSize: 24, fontWeight: "800", color: "#2D2A24", marginBottom: 3 },
  subtitle: { fontSize: 13, color: "#8E8E7A", marginBottom: 20 },

  groupLabel: {
    fontSize: 10, fontWeight: "700", color: "#8E8E7A",
    letterSpacing: 0.8, marginBottom: 8, paddingLeft: 4,
  },
  cardGroup: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20, overflow: "hidden",
    marginBottom: 14,
    borderWidth: 1, borderColor: "rgba(0,0,0,0.04)",
  },

  row: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 13, paddingHorizontal: 16,
  },
  rowBorder: {
    borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.04)",
  },
  rowLeft: {
    flex: 1, flexDirection: "row", alignItems: "center", gap: 10,
  },
  statusDot: {
    width: 6, height: 6, borderRadius: 3,
  },
  rowName: { fontSize: 14, fontWeight: "600", color: "#2D2A24" },

  pillRow: { flexDirection: "row", gap: 4 },
  pill: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 99, borderWidth: 1.5,
  },
  pillText: {
    fontSize: 10, fontWeight: "700",
    textTransform: "uppercase", letterSpacing: 0.3,
  },

  summary: {
    backgroundColor: "rgba(52,211,153,0.04)",
    borderWidth: 1, borderColor: "rgba(52,211,153,0.1)",
    borderRadius: 14, padding: 12, paddingHorizontal: 16,
    marginBottom: 16,
  },
  summaryText: { fontSize: 12, fontWeight: "600", color: "#065F46" },

  cta: {
    paddingVertical: 18, borderRadius: 18,
    alignItems: "center", marginBottom: 8,
  },
  ctaGo: {
    backgroundColor: "#2D2A24",
  },
  ctaGoText: { fontSize: 16, fontWeight: "700", color: "#F6F5F0" },
  ctaModified: { backgroundColor: "#2D2A24" },
  ctaModifiedText: { fontSize: 16, fontWeight: "700", color: "#F6F5F0" },

  skipBtn: { alignItems: "center", paddingVertical: 10 },
  skipText: { fontSize: 13, fontWeight: "600", color: "#8E8E7A" },
});
