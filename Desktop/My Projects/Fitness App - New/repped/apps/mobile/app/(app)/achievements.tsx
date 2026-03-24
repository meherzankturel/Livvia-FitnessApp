import { View, Text, ScrollView, Pressable, Modal, Animated } from "react-native";
import { router } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { useAuthStore, ACHIEVEMENT_DEFINITIONS, CATEGORY_ACCENT, CATEGORY_LABELS, TIER_LABELS } from "@repped/shared";
import type { BadgeTier } from "@repped/shared";
import { supabase } from "../../src/lib/supabase";
import PremiumBadge from "../../src/components/PremiumBadge";
import type { IconName } from "../../src/components/BadgeIcon";
import { TopoBackground } from "../../src/components/terrain";

export default function Achievements() {
  const session = useAuthStore((s) => s.session);
  const [earned, setEarned] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [previewDef, setPreviewDef] = useState<any>(null);

  // Modal animations
  const scaleAnim = useRef(new Animated.Value(0.4)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { loadAchievements(); }, []);

  const loadAchievements = async () => {
    if (!session?.user?.id) return;
    const { data } = await supabase
      .from("user_achievements").select("*, achievements(key)")
      .eq("user_id", session.user.id);
    const keys = new Set(((data as any[]) || []).map((a: any) => a.achievements?.key).filter(Boolean));
    setEarned(keys);
    setLoading(false);
  };

  const openPreview = (def: any) => {
    setPreviewDef(def);
    scaleAnim.setValue(0.4);
    opacityAnim.setValue(0);
    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, damping: 14, stiffness: 160, useNativeDriver: true }),
    ]).start();
  };

  const closePreview = () => {
    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.6, duration: 120, useNativeDriver: true }),
    ]).start(() => setPreviewDef(null));
  };

  const allCategories = [...new Set(ACHIEVEMENT_DEFINITIONS.map(a => a.category))];
  const earnedCount = ACHIEVEMENT_DEFINITIONS.filter(a => earned.has(a.key)).length;
  const totalCount = ACHIEVEMENT_DEFINITIONS.length;

  return (
    <>
      <View style={{ flex: 1, backgroundColor: "#F6F5F0" }}>
        <TopoBackground />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
          <View style={{ paddingHorizontal: 20, paddingTop: 64 }}>
            {/* Back */}
            <Pressable onPress={() => router.navigate("/(app)/progress")} style={{ marginBottom: 20 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "#EDEBE5" }}>
                <Text style={{ color: "#2D2A24", fontSize: 18, fontWeight: "600" }}>‹</Text>
              </View>
            </Pressable>

            {/* Header */}
            <Text style={{ color: "#2D2A24", fontSize: 32, fontWeight: "800", letterSpacing: -0.5 }}>Achievements</Text>
            <Text style={{ color: "#8E8E7A", fontSize: 15, marginTop: 4, marginBottom: 20 }}>
              Collect badges across different shapes and tiers
            </Text>

            {/* Progress overview */}
            <View style={{ borderRadius: 24, padding: 20, marginBottom: 32, backgroundColor: "#EDEBE5" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <Text style={{ color: "#2D2A24", fontSize: 17, fontWeight: "700" }}>Collection</Text>
                <Text style={{ color: "#2D2A24", fontSize: 24, fontWeight: "800" }}>{earnedCount}<Text style={{ color: "#8E8E7A", fontSize: 15, fontWeight: "600" }}>/{totalCount}</Text></Text>
              </View>
              <View style={{ borderRadius: 99, overflow: "hidden", height: 6, backgroundColor: "#DDD9CE" }}>
                <View style={{ borderRadius: 99, height: "100%", width: `${totalCount > 0 ? (earnedCount / totalCount) * 100 : 0}%`, backgroundColor: "#2D2A24" }} />
              </View>

              {/* Tier legend */}
              <View style={{ flexDirection: "row", gap: 16, marginTop: 16 }}>
                {(["starter", "intermediate", "advanced", "elite"] as BadgeTier[]).map((t) => (
                  <View key={t} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: TIER_LABELS[t].color }} />
                    <Text style={{ color: "#8E8E7A", fontSize: 11 }}>{TIER_LABELS[t].label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Categories */}
            {allCategories.map((cat) => {
              const defs = ACHIEVEMENT_DEFINITIONS.filter(a => a.category === cat);
              if (defs.length === 0) return null;
              const accent = CATEGORY_ACCENT[cat] || "#6366F1";
              const catEarned = defs.filter(d => earned.has(d.key)).length;

              return (
                <View key={cat} style={{ marginBottom: 32 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View style={{ width: 4, height: 20, borderRadius: 2, backgroundColor: accent }} />
                      <Text style={{ color: "#2D2A24", fontSize: 18, fontWeight: "700" }}>
                        {CATEGORY_LABELS[cat] || cat}
                      </Text>
                    </View>
                    <Text style={{ color: "#8E8E7A", fontSize: 13, fontWeight: "600" }}>{catEarned}/{defs.length}</Text>
                  </View>

                  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    {defs.map((def) => {
                      const isEarned = earned.has(def.key);
                      return (
                        <Pressable
                          key={def.key}
                          onPress={() => openPreview(def)}
                          style={{ width: "33.33%", alignItems: "center", marginBottom: 20 }}
                        >
                          <PremiumBadge
                            icon={def.icon as IconName}
                            earned={isEarned}
                            accentColor={accent}
                            size={72}
                            shape={def.shape}
                            tier={def.tier}
                          />
                          <Text style={{
                            color: isEarned ? "#2D2A24" : "#C7C7CC",
                            fontSize: 11, fontWeight: "600", textAlign: "center",
                            marginTop: 8, lineHeight: 14, width: 80,
                          }}>
                            {def.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Preview popup */}
      <Modal visible={!!previewDef} transparent animationType="none" onRequestClose={closePreview}>
        <Animated.View style={[{ flex: 1, justifyContent: "center", alignItems: "center" }, { backgroundColor: "rgba(0,0,0,0.45)", opacity: opacityAnim }]}>
          <Pressable style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }} onPress={closePreview} />
          {previewDef && (() => {
            const isEarned = earned.has(previewDef.key);
            const accent = CATEGORY_ACCENT[previewDef.category] || "#6366F1";
            const tierInfo = TIER_LABELS[previewDef.tier as BadgeTier] || TIER_LABELS.starter;
            return (
              <Animated.View style={[{ marginHorizontal: 24, borderRadius: 24, padding: 28, alignItems: "center" }, {
                backgroundColor: "#F6F5F0", transform: [{ scale: scaleAnim }],
                shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20,
              }]}>
                {/* Badge */}
                <View style={{ marginBottom: 20 }}>
                  <PremiumBadge icon={previewDef.icon as IconName} earned={isEarned} accentColor={accent} size={110} shape={previewDef.shape} tier={previewDef.tier} />
                </View>

                {/* Tier + Category */}
                <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
                  <View style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99, backgroundColor: `${tierInfo.color}15` }}>
                    <Text style={{ color: tierInfo.color, fontSize: 11, fontWeight: "700" }}>{tierInfo.label}</Text>
                  </View>
                  <View style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99, backgroundColor: `${accent}15` }}>
                    <Text style={{ color: accent, fontSize: 11, fontWeight: "700" }}>{CATEGORY_LABELS[previewDef.category]}</Text>
                  </View>
                </View>

                {/* Name + description */}
                <Text style={{ color: "#2D2A24", fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 6 }}>{previewDef.name}</Text>
                <Text style={{ color: "#8E8E7A", fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 16 }}>{previewDef.description}</Text>

                {/* Status */}
                {isEarned ? (
                  <View style={{ width: "100%", borderRadius: 16, padding: 16, alignItems: "center", backgroundColor: "rgba(52,211,153,0.08)" }}>
                    <Text style={{ color: "#34D399", fontSize: 13, fontWeight: "700", letterSpacing: 0.5 }}>UNLOCKED</Text>
                  </View>
                ) : (
                  <View style={{ width: "100%", borderRadius: 16, padding: 16, backgroundColor: "#EDEBE5" }}>
                    <Text style={{ color: "#8E8E7A", fontSize: 11, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>How to unlock</Text>
                    <Text style={{ color: "#2D2A24", fontSize: 14, lineHeight: 20 }}>{previewDef.unlockHint}</Text>
                  </View>
                )}

                <Pressable onPress={closePreview} style={{ marginTop: 16, width: "100%", borderRadius: 16, paddingVertical: 12, alignItems: "center", backgroundColor: "#EDEBE5" }}>
                  <Text style={{ color: "#2D2A24", fontSize: 16, fontWeight: "600" }}>Close</Text>
                </Pressable>
              </Animated.View>
            );
          })()}
        </Animated.View>
      </Modal>
    </>
  );
}
