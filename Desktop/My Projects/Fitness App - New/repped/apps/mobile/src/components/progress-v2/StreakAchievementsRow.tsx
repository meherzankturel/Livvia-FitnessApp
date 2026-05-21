import React from "react";
import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { ACHIEVEMENT_DEFINITIONS } from "@repped/shared";
import { BADGE_IMAGES, MASTER_BADGE } from "../../lib/badge-assets";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

interface Props {
  streak: number;
  completedDays: Set<number>; // 0=Mon … 6=Sun
  earnedCount?: number;
  /** Image keys of recent unlocks, most recent first. Up to 4 are rendered as an Apple-Fitness overlap stack. */
  recentBadgeKeys?: string[];
}

export default function StreakAchievementsRow({
  streak,
  completedDays,
  earnedCount = 0,
  recentBadgeKeys = [],
}: Props) {
  const totalCount = ACHIEVEMENT_DEFINITIONS.length;
  const recents = recentBadgeKeys.slice(0, 4);

  return (
    <View style={styles.row}>
      {/* ── Streak card ───────────────────────────────────────────────── */}
      <View style={[styles.card, styles.streakCard]}>
        <Text style={styles.cardTitle}>Daily Streak</Text>

        <View style={styles.streakCenter}>
          <Image
            source={require("../../../assets/progress/icon-streak.png")}
            style={styles.fireIcon}
            resizeMode="contain"
          />
          <Text style={styles.streakNumber}>{streak}</Text>
          <Text style={styles.streakLabel}>Days</Text>
        </View>

        {/* 7-day checkmarks */}
        <View style={styles.daysRow}>
          {DAY_LABELS.map((label, i) => (
            <View key={i} style={styles.dayCol}>
              <View
                style={[
                  styles.dayCircle,
                  completedDays.has(i) ? styles.dayDone : styles.dayEmpty,
                ]}
              >
                {completedDays.has(i) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text style={styles.dayLabel}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Achievements card ─────────────────────────────────────────── */}
      <Pressable
        onPress={() => router.push("/(app)/achievements" as any)}
        style={({ pressed }) => [
          styles.card,
          styles.achieveCard,
          pressed && { opacity: 0.85 },
        ]}
      >
        <View style={styles.achieveHeader}>
          <Text style={styles.cardTitle}>Achievements</Text>
          <Text style={styles.achieveArrow}>›</Text>
        </View>

        <View style={styles.badgeWrap}>
          <Image
            source={recents.length > 0 ? BADGE_IMAGES[recents[0]] : MASTER_BADGE}
            style={styles.badgeImg}
            resizeMode="contain"
          />
        </View>

        <View style={styles.achieveStat}>
          <Text style={styles.achieveCount}>
            {earnedCount}
            <Text style={styles.achieveCountSlash}>/{totalCount}</Text>
          </Text>
          <Text style={styles.achieveLabel}>EARNED</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  streakCard: {
    alignItems: "center",
  },
  achieveCard: {
    alignItems: "stretch",
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#888",
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  // ── Streak (unchanged) ──
  streakCenter: { alignItems: "center", marginBottom: 12 },
  fireIcon: { width: 56, height: 56, marginBottom: 4 },
  streakNumber: { fontSize: 20, fontWeight: "700", color: "#1a1a1a", lineHeight: 24 },
  streakLabel: { fontSize: 11, color: "#888", marginTop: 1 },
  daysRow: { flexDirection: "row", gap: 4, justifyContent: "center" },
  dayCol: { alignItems: "center", gap: 3 },
  dayCircle: { width: 15, height: 15, borderRadius: 7.5, alignItems: "center", justifyContent: "center" },
  dayDone: { backgroundColor: "#F59E0B" },
  dayEmpty: { backgroundColor: "#E8E8E8" },
  checkmark: { fontSize: 8, color: "#fff", fontWeight: "700", lineHeight: 10 },
  dayLabel: { fontSize: 8, color: "#999" },

  // ── Achievements card ──
  achieveHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  achieveArrow: {
    fontSize: 18,
    color: "#bbb",
    fontWeight: "300",
    lineHeight: 18,
    marginTop: -2,
  },
  badgeWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
  },
  badgeImg: {
    width: 92,
    height: 92,
    // negative vertical margin keeps the wrap's layout height at 84 (matches old),
    // so the bigger badge bumps visually without pushing the count text down.
    marginVertical: -4,
  },
  achieveStat: {
    alignItems: "center",
    marginTop: 6,
  },
  achieveCount: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1a1a1a",
    letterSpacing: -0.4,
    lineHeight: 24,
  },
  achieveCountSlash: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9b958a",
    letterSpacing: 0,
  },
  achieveLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#9b958a",
    letterSpacing: 1.2,
    marginTop: 2,
  },
});
