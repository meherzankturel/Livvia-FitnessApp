import { View, Text, ScrollView, Pressable, Modal, Animated, Image, StyleSheet, Dimensions } from "react-native";
import { router } from "expo-router";
import { useEffect, useState, useRef, useMemo } from "react";
import {
  useAuthStore,
  ACHIEVEMENT_DEFINITIONS,
  CATEGORY_ACCENT,
  CATEGORY_LABELS,
  TIER_LABELS,
  CATEGORY_ORDER,
} from "@repped/shared";
import type { AchievementDef, BadgeTier, BadgeCategory } from "@repped/shared";
import { supabase } from "../../src/lib/supabase";
import { BADGE_IMAGES } from "../../src/lib/badge-assets";
import { TopoBackground } from "../../src/components/terrain";

const SCREEN_WIDTH = Dimensions.get("window").width;
const BADGE_TILE_SIZE = 78;
const HERO_BADGE_SIZE = 96;
const MODAL_BADGE_SIZE = 228;

// ─── Helpers ──────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const days = Math.floor((now - then) / 86400000);
  if (days < 1) return "today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "1 week ago";
  if (weeks < 5) return `${weeks} weeks ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  return `${months} months ago`;
}

interface EarnedRecord {
  key: string;
  achieved_at: string;
}

// ─── Main screen ──────────────────────────────────────────────────────

export default function Achievements() {
  const session = useAuthStore((s) => s.session);
  const [earned, setEarned] = useState<Map<string, string>>(new Map());
  const [, setLoading] = useState(true);
  const [selectedDef, setSelectedDef] = useState<AchievementDef | null>(null);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("user_achievements")
      .select("achieved_at, achievements(key)")
      .eq("user_id", session.user.id);
    const map = new Map<string, string>();
    ((data as any[]) || []).forEach((r) => {
      const k = r.achievements?.key;
      if (k) map.set(k, r.achieved_at);
    });
    setEarned(map);
    setLoading(false);
  };

  const earnedCount = ACHIEVEMENT_DEFINITIONS.filter((a) => earned.has(a.key)).length;
  const totalCount = ACHIEVEMENT_DEFINITIONS.length;

  const latestUnlock = useMemo(() => {
    let best: { def: AchievementDef; at: string } | null = null;
    for (const def of ACHIEVEMENT_DEFINITIONS) {
      const at = earned.get(def.key);
      if (at && (!best || at > best.at)) best = { def, at };
    }
    return best;
  }, [earned]);

  return (
    <>
      <View style={styles.root}>
        <TopoBackground />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              onPress={() => router.navigate("/(app)/progress")}
              style={styles.back}
            >
              <Text style={styles.backArrow}>‹</Text>
            </Pressable>
            <Text style={styles.headerTitle}>Achievements</Text>
            <View style={styles.headerCount}>
              <Text style={styles.headerCountText}>
                {earnedCount} / {totalCount}
              </Text>
            </View>
          </View>

          {/* Hero */}
          {latestUnlock ? (
            <HeroCard def={latestUnlock.def} unlockedAt={latestUnlock.at} />
          ) : (
            <EmptyHero />
          )}

          {/* Shelves */}
          {CATEGORY_ORDER.map((cat) => {
            const defs = ACHIEVEMENT_DEFINITIONS.filter((a) => a.category === cat);
            if (defs.length === 0) return null;
            const catEarned = defs.filter((d) => earned.has(d.key)).length;
            return (
              <CategoryShelf
                key={cat}
                category={cat}
                defs={defs}
                earned={earned}
                earnedCount={catEarned}
                onSelect={setSelectedDef}
              />
            );
          })}

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      <BadgeModal
        def={selectedDef}
        isEarned={selectedDef ? earned.has(selectedDef.key) : false}
        unlockedAt={selectedDef ? earned.get(selectedDef.key) : undefined}
        onClose={() => setSelectedDef(null)}
      />
    </>
  );
}

// ─── Hero card ────────────────────────────────────────────────────────

function HeroCard({ def, unlockedAt }: { def: AchievementDef; unlockedAt: string }) {
  const glowA = useRef(new Animated.Value(0.3)).current;
  const dotPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowA, { toValue: 0.55, duration: 2000, useNativeDriver: false }),
        Animated.timing(glowA, { toValue: 0.3, duration: 2000, useNativeDriver: false }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotPulse, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        Animated.timing(dotPulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.hero}>
      <Animated.View style={[styles.heroGlow, { opacity: glowA }]} />
      <Image source={BADGE_IMAGES[def.imageKey]} style={styles.heroBadge} resizeMode="contain" />
      <View style={styles.heroText}>
        <View style={styles.heroLabel}>
          <Animated.View style={[styles.heroDot, { opacity: dotPulse }]} />
          <Text style={styles.heroLabelText}>
            LATEST UNLOCK · {timeAgo(unlockedAt).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.heroName}>{def.name}</Text>
        <Text style={styles.heroDesc}>{def.description}</Text>
        <View style={styles.heroTags}>
          <View style={[styles.heroTag, styles.heroTagGold]}>
            <Text style={styles.heroTagGoldText}>
              {TIER_LABELS[def.tier].label.toUpperCase()}
            </Text>
          </View>
          <View style={[styles.heroTag, styles.heroTagGreen]}>
            <Text style={styles.heroTagGreenText}>
              {CATEGORY_LABELS[def.category].toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function EmptyHero() {
  return (
    <View style={[styles.hero, { minHeight: 100 }]}>
      <View style={styles.heroText}>
        <Text style={styles.heroName}>Earn your first badge</Text>
        <Text style={styles.heroDesc}>
          Complete a workout to unlock your first achievement and start your collection.
        </Text>
      </View>
    </View>
  );
}

// ─── Category shelf (horizontal row) ──────────────────────────────────

function CategoryShelf({
  category,
  defs,
  earned,
  earnedCount,
  onSelect,
}: {
  category: BadgeCategory;
  defs: AchievementDef[];
  earned: Map<string, string>;
  earnedCount: number;
  onSelect: (def: AchievementDef) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowHead}>
        <View style={[styles.rowDot, { backgroundColor: CATEGORY_ACCENT[category] }]} />
        <Text style={styles.rowName}>{CATEGORY_LABELS[category].toUpperCase()}</Text>
        <View style={styles.rowSpacer} />
        <Text style={styles.rowCount}>
          {earnedCount} / {defs.length}
        </Text>
        <Text style={styles.rowArrow}>›</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rowScroll}
        decelerationRate="fast"
      >
        {defs.map((def) => (
          <BadgeTile
            key={def.key}
            def={def}
            isEarned={earned.has(def.key)}
            onPress={() => onSelect(def)}
          />
        ))}
      </ScrollView>
      {/* Right-edge fade overlay */}
      <View pointerEvents="none" style={styles.rowFade} />
    </View>
  );
}

// ─── Badge tile ──────────────────────────────────────────────────────

function BadgeTile({
  def,
  isEarned,
  onPress,
}: {
  def: AchievementDef;
  isEarned: boolean;
  onPress: () => void;
}) {
  const press = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() =>
        Animated.spring(press, { toValue: 0.94, useNativeDriver: true, speed: 30, bounciness: 6 }).start()
      }
      onPressOut={() =>
        Animated.spring(press, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start()
      }
      style={styles.bd}
    >
      <Animated.View style={[styles.bdImgWrap, { transform: [{ scale: press }] }]}>
        <Image
          source={BADGE_IMAGES[def.imageKey]}
          style={[styles.bdImg, !isEarned && styles.bdImgLocked]}
          resizeMode="contain"
        />
        {!isEarned && (
          <View style={styles.bdLock}>
            <Text style={styles.bdLockGlyph}>🔒</Text>
          </View>
        )}
      </Animated.View>
      <Text style={[styles.bdName, !isEarned && styles.bdNameLocked]} numberOfLines={1}>
        {def.name}
      </Text>
    </Pressable>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────

const CONFETTI_COLORS = ["#EAB308", "#34D399", "#6366F1", "#EF4444", "#EC4899", "#F97316", "#A855F7", "#06B6D4"];

function BadgeModal({
  def,
  isEarned,
  unlockedAt,
  onClose,
}: {
  def: AchievementDef | null;
  isEarned: boolean;
  unlockedAt?: string;
  onClose: () => void;
}) {
  const backdrop = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.82)).current;
  const cardTranslate = useRef(new Animated.Value(20)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;
  const badgeRotate = useRef(new Animated.Value(-15)).current;
  const badgeFloat = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.85)).current;
  const labelOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const descOpacity = useRef(new Animated.Value(0)).current;
  const tagsOpacity = useRef(new Animated.Value(0)).current;
  const actionOpacity = useRef(new Animated.Value(0)).current;
  const confetti = useRef(
    Array.from({ length: 28 }, (_, i) => ({
      x: (i / 28) * SCREEN_WIDTH + (Math.random() - 0.5) * 30,
      drift: (Math.random() - 0.5) * 60,
      size: 5 + Math.random() * 5,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: Math.random() * 1800,
      duration: 2400 + Math.random() * 2400,
      shape: Math.random() > 0.5 ? "circle" : "square",
      y: new Animated.Value(0),
      rot: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    if (!def) return;
    // Reset
    backdrop.setValue(0);
    cardScale.setValue(0.82);
    cardTranslate.setValue(20);
    badgeScale.setValue(0);
    badgeRotate.setValue(-15);
    badgeFloat.setValue(0);
    glowOpacity.setValue(0);
    glowScale.setValue(0.85);
    labelOpacity.setValue(0);
    titleOpacity.setValue(0);
    descOpacity.setValue(0);
    tagsOpacity.setValue(0);
    actionOpacity.setValue(0);

    // Backdrop
    Animated.timing(backdrop, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    // Card spring
    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }),
      Animated.spring(cardTranslate, { toValue: 0, useNativeDriver: true, tension: 80, friction: 8 }),
    ]).start();
    // Badge entrance after 180ms
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(badgeScale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 6 }),
        Animated.spring(badgeRotate, { toValue: 0, useNativeDriver: true, tension: 50, friction: 7 }),
      ]).start(() => {
        // One float cycle after entrance
        Animated.sequence([
          Animated.timing(badgeFloat, { toValue: -8, duration: 1500, useNativeDriver: true }),
          Animated.timing(badgeFloat, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ]).start();
      });
    }, 180);

    // Stagger
    const stagger = (target: Animated.Value, delay: number) =>
      Animated.timing(target, {
        toValue: 1,
        duration: 380,
        delay,
        useNativeDriver: true,
      });
    Animated.parallel([
      stagger(labelOpacity, 320),
      stagger(titleOpacity, 420),
      stagger(descOpacity, 520),
      stagger(tagsOpacity, 600),
      stagger(actionOpacity, 720),
    ]).start();

    if (isEarned) {
      // Glow burst (0 → 0.85 → 0.6 → 0.8 → 0)
      Animated.sequence([
        Animated.delay(400),
        Animated.parallel([
          Animated.timing(glowOpacity, { toValue: 0.85, duration: 720, useNativeDriver: true }),
          Animated.timing(glowScale, { toValue: 1.12, duration: 720, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(glowOpacity, { toValue: 0.6, duration: 900, useNativeDriver: true }),
          Animated.timing(glowScale, { toValue: 1, duration: 900, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(glowOpacity, { toValue: 0.8, duration: 720, useNativeDriver: true }),
          Animated.timing(glowScale, { toValue: 1.1, duration: 720, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(glowOpacity, { toValue: 0, duration: 1260, useNativeDriver: true }),
          Animated.timing(glowScale, { toValue: 1, duration: 1260, useNativeDriver: true }),
        ]),
      ]).start();

      // Confetti
      confetti.forEach((p) => {
        p.y.setValue(0);
        p.rot.setValue(0);
        p.opacity.setValue(0);
        Animated.sequence([
          Animated.delay(p.delay),
          Animated.parallel([
            Animated.timing(p.opacity, { toValue: 1, duration: 80, useNativeDriver: true }),
            Animated.timing(p.y, { toValue: 540, duration: p.duration, useNativeDriver: true }),
            Animated.timing(p.rot, { toValue: 720, duration: p.duration, useNativeDriver: true }),
          ]),
          Animated.timing(p.opacity, { toValue: 0, duration: 120, useNativeDriver: true }),
        ]).start();
      });
    }
  }, [def]);

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(backdrop, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(cardScale, { toValue: 0.82, duration: 180, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  if (!def) return null;

  return (
    <Modal visible={!!def} transparent animationType="none" onRequestClose={closeModal}>
      <Animated.View style={[styles.modalBackdrop, { opacity: backdrop }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />

        {/* Confetti layer — over backdrop, behind card */}
        {isEarned && (
          <View style={styles.confettiLayer} pointerEvents="none">
            {confetti.map((p, i) => (
              <Animated.View
                key={i}
                style={{
                  position: "absolute",
                  left: p.x,
                  top: 0,
                  width: p.size,
                  height: p.size * (0.6 + Math.random() * 0.6),
                  backgroundColor: p.color,
                  borderRadius: p.shape === "circle" ? 99 : 1,
                  opacity: p.opacity,
                  transform: [
                    { translateY: p.y },
                    { translateX: p.drift },
                    {
                      rotate: p.rot.interpolate({
                        inputRange: [0, 720],
                        outputRange: ["0deg", "720deg"],
                      }),
                    },
                  ],
                }}
              />
            ))}
          </View>
        )}

        <Animated.View
          style={[
            styles.modalCard,
            {
              transform: [{ scale: cardScale }, { translateY: cardTranslate }],
            },
          ]}
        >
          <Pressable style={styles.modalClose} onPress={closeModal}>
            <Text style={styles.modalCloseGlyph}>✕</Text>
          </Pressable>

          <View style={styles.modalBadgeWrap}>
            {isEarned && (
              <Animated.View
                style={[
                  styles.modalGlow,
                  {
                    opacity: glowOpacity,
                    transform: [{ scale: glowScale }],
                  },
                ]}
              />
            )}
            <Animated.View
              style={{
                width: MODAL_BADGE_SIZE,
                height: MODAL_BADGE_SIZE,
                transform: [
                  { scale: badgeScale },
                  {
                    rotate: badgeRotate.interpolate({
                      inputRange: [-20, 20],
                      outputRange: ["-20deg", "20deg"],
                    }),
                  },
                  { translateY: badgeFloat },
                ],
              }}
            >
              <Image
                source={BADGE_IMAGES[def.imageKey]}
                style={[
                  styles.modalBadgeImg,
                  !isEarned && styles.modalBadgeImgLocked,
                ]}
                resizeMode="contain"
              />
            </Animated.View>
          </View>

          <Animated.View style={[styles.modalLabel, { opacity: labelOpacity }]}>
            <View style={[styles.modalLabelDot, !isEarned && styles.modalLabelDotMuted]} />
            <Text style={[styles.modalLabelText, !isEarned && styles.modalLabelTextMuted]}>
              {isEarned && unlockedAt
                ? `UNLOCKED · ${timeAgo(unlockedAt).toUpperCase()}`
                : "LOCKED"}
            </Text>
          </Animated.View>

          <Animated.Text style={[styles.modalTitle, { opacity: titleOpacity }]}>
            {def.name}
          </Animated.Text>
          <Animated.Text style={[styles.modalDesc, { opacity: descOpacity }]}>
            {def.description}
          </Animated.Text>

          <Animated.View style={[styles.modalTags, { opacity: tagsOpacity }]}>
            <View
              style={[
                styles.modalTag,
                isEarned ? styles.modalTagGold : styles.modalTagMuted,
              ]}
            >
              <Text
                style={
                  isEarned ? styles.modalTagGoldText : styles.modalTagMutedText
                }
              >
                {TIER_LABELS[def.tier].label.toUpperCase()}
              </Text>
            </View>
            <View style={[styles.modalTag, styles.modalTagGreen]}>
              <Text style={styles.modalTagGreenText}>
                {CATEGORY_LABELS[def.category].toUpperCase()}
              </Text>
            </View>
          </Animated.View>

          {!isEarned && (
            <Animated.View style={[styles.modalProgress, { opacity: tagsOpacity }]}>
              <Text style={styles.modalProgressLab}>HOW TO UNLOCK</Text>
              <Text style={styles.modalProgressHint}>{def.unlockHint}</Text>
            </Animated.View>
          )}

          <Animated.View style={[styles.modalActions, { opacity: actionOpacity }]}>
            <Pressable
              style={styles.modalBtnPrimary}
              onPress={closeModal}
            >
              <Text style={styles.modalBtnPrimaryText}>
                {isEarned ? "Share" : "View tips"}
              </Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F6F5F0" },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 50, paddingBottom: 40 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 8,
    gap: 10,
  },
  back: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EDEBE5",
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: { color: "#2D2A24", fontSize: 16, fontWeight: "600" },
  headerTitle: { color: "#2D2A24", fontSize: 20, fontWeight: "800", letterSpacing: -0.4, flex: 1 },
  headerCount: {
    backgroundColor: "#EDEBE5",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 99,
  },
  headerCountText: { color: "#8E8E7A", fontSize: 11, fontWeight: "700" },

  // Hero
  hero: {
    marginHorizontal: 18,
    marginTop: 4,
    marginBottom: 18,
    backgroundColor: "#2D2A24",
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 128,
    overflow: "hidden",
  },
  heroGlow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#EAB308",
    top: -60,
    right: -50,
  },
  heroBadge: { width: HERO_BADGE_SIZE, height: HERO_BADGE_SIZE },
  heroText: { flex: 1, minWidth: 0 },
  heroLabel: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EAB308",
  },
  heroLabelText: {
    color: "#EAB308",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  heroName: {
    color: "#F6F5F0",
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.3,
    lineHeight: 22,
    marginBottom: 4,
  },
  heroDesc: { color: "#a8a394", fontSize: 12, lineHeight: 17, marginBottom: 10 },
  heroTags: { flexDirection: "row", gap: 5, flexWrap: "wrap" },
  heroTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  heroTagGold: { backgroundColor: "rgba(234,179,8,0.18)" },
  heroTagGoldText: { color: "#EAB308", fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  heroTagGreen: { backgroundColor: "rgba(52,211,153,0.18)" },
  heroTagGreenText: { color: "#34D399", fontSize: 9, fontWeight: "800", letterSpacing: 1 },

  // Shelf
  row: { marginTop: 18, position: "relative" },
  rowHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  rowDot: { width: 3, height: 14, borderRadius: 99 },
  rowName: { color: "#2D2A24", fontSize: 11, fontWeight: "800", letterSpacing: 0.6 },
  rowSpacer: { flex: 1 },
  rowCount: { color: "#8E8E7A", fontSize: 10, fontWeight: "700" },
  rowArrow: { color: "#8E8E7A", fontSize: 12, marginLeft: 4 },
  rowScroll: { paddingLeft: 18, paddingRight: 18, gap: 6 },
  rowFade: {
    position: "absolute",
    right: 0,
    top: 28,
    bottom: 0,
    width: 36,
    backgroundColor: "#F6F5F0",
    opacity: 0.85,
  },

  // Tile
  bd: { alignItems: "center", width: BADGE_TILE_SIZE },
  bdImgWrap: {
    width: BADGE_TILE_SIZE,
    height: BADGE_TILE_SIZE,
    position: "relative",
  },
  bdImg: { width: BADGE_TILE_SIZE, height: BADGE_TILE_SIZE },
  bdImgLocked: { opacity: 0.35 },
  bdLock: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(45,42,36,0.78)",
    alignItems: "center",
    justifyContent: "center",
  },
  bdLockGlyph: { fontSize: 8 },
  bdName: {
    fontSize: 9,
    fontWeight: "700",
    color: "#2D2A24",
    marginTop: 3,
    textAlign: "center",
    width: BADGE_TILE_SIZE,
  },
  bdNameLocked: { color: "#b4b0a4" },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(28,25,21,0.62)",
    alignItems: "center",
    justifyContent: "center",
  },
  confettiLayer: { position: "absolute", inset: 0, top: 80, left: 0, right: 0, height: 600 },
  modalCard: {
    width: 324,
    maxWidth: "92%",
    backgroundColor: "#F6F5F0",
    borderRadius: 28,
    padding: 24,
    paddingTop: 24,
    paddingBottom: 22,
    alignItems: "center",
  },
  modalClose: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(45,42,36,0.08)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  modalCloseGlyph: { color: "#2D2A24", fontSize: 14, lineHeight: 14 },
  modalBadgeWrap: {
    width: MODAL_BADGE_SIZE,
    height: MODAL_BADGE_SIZE,
    marginBottom: 14,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  modalGlow: {
    position: "absolute",
    width: MODAL_BADGE_SIZE + 60,
    height: MODAL_BADGE_SIZE + 60,
    borderRadius: (MODAL_BADGE_SIZE + 60) / 2,
    backgroundColor: "#EAB308",
  },
  modalBadgeImg: { width: MODAL_BADGE_SIZE, height: MODAL_BADGE_SIZE },
  modalBadgeImgLocked: { opacity: 0.5 },
  modalLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  modalLabelDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#EAB308" },
  modalLabelDotMuted: { backgroundColor: "#8E8E7A" },
  modalLabelText: { color: "#EAB308", fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  modalLabelTextMuted: { color: "#8E8E7A" },
  modalTitle: {
    color: "#2D2A24",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginBottom: 8,
    lineHeight: 26,
    textAlign: "center",
  },
  modalDesc: {
    color: "#8E8E7A",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
    textAlign: "center",
  },
  modalTags: { flexDirection: "row", gap: 6, marginBottom: 14, flexWrap: "wrap", justifyContent: "center" },
  modalTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  modalTagGold: { backgroundColor: "rgba(234,179,8,0.18)" },
  modalTagGoldText: { color: "#a17a06", fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  modalTagMuted: { backgroundColor: "rgba(168,168,173,0.18)" },
  modalTagMutedText: { color: "#7a7a82", fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  modalTagGreen: { backgroundColor: "rgba(34,197,94,0.18)" },
  modalTagGreenText: { color: "#16a34a", fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  modalProgress: {
    backgroundColor: "#EDEBE5",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    width: "100%",
  },
  modalProgressLab: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: "#8E8E7A",
    marginBottom: 6,
  },
  modalProgressHint: { fontSize: 12, color: "#2D2A24", lineHeight: 17 },
  modalActions: { flexDirection: "row", width: "100%" },
  modalBtnPrimary: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#2D2A24",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnPrimaryText: { color: "#F6F5F0", fontSize: 14, fontWeight: "700" },
});
