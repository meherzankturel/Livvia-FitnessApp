import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

interface Props {
  streak: number;
  completedDays: Set<number>; // 0=Mon … 6=Sun
  earnedCount?: number; // for future use
}

export default function StreakAchievementsRow({
  streak,
  completedDays,
}: Props) {
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
      <View style={[styles.card, styles.achieveCard]}>
        <Text style={styles.cardTitle}>Achievements</Text>

        <View style={styles.trophyWrapper}>
          <Image
            source={require("../../../assets/progress/icon-achievement.png")}
            style={styles.trophyIcon}
            resizeMode="contain"
          />
        </View>
      </View>
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
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#888",
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  // Streak
  streakCenter: {
    alignItems: "center",
    marginBottom: 12,
  },
  fireIcon: {
    width: 56,
    height: 56,
    marginBottom: 4,
  },
  streakNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    lineHeight: 24,
  },
  streakLabel: {
    fontSize: 11,
    color: "#888",
    marginTop: 1,
  },
  // Day checkmarks
  daysRow: {
    flexDirection: "row",
    gap: 4,
    justifyContent: "center",
  },
  dayCol: {
    alignItems: "center",
    gap: 3,
  },
  dayCircle: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    alignItems: "center",
    justifyContent: "center",
  },
  dayDone: {
    backgroundColor: "#F4847B",
  },
  dayEmpty: {
    backgroundColor: "#E8E8E8",
  },
  checkmark: {
    fontSize: 8,
    color: "#fff",
    fontWeight: "700",
    lineHeight: 10,
  },
  dayLabel: {
    fontSize: 8,
    color: "#999",
  },
  // Achievements
  trophyWrapper: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  trophyIcon: {
    width: "80%",
    height: undefined,
    aspectRatio: 1,
    maxWidth: 120,
    maxHeight: 120,
  },
});
