import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

interface BestLift {
  weight: number;
  exercise: string;
  isPR: boolean;
}

interface Props {
  weekLabel: string;
  workoutsCompleted: number;
  workoutsPlanned: number;
  volume: number; // kg
  volumeChange: number; // percentage vs last week
  bestLift: BestLift | null;
  dayDurations: number[]; // 7 values (Mon-Sun), minutes per day (0 if no workout)
}

export default function WeeklySummaryCard({
  weekLabel,
  workoutsCompleted,
  workoutsPlanned,
  volume,
  volumeChange,
  bestLift,
  dayDurations,
}: Props) {
  const volumeChangeStr = volumeChange >= 0 ? `+${volumeChange}%` : `${volumeChange}%`;
  const volumeChangeColor = volumeChange >= 0 ? "#2DB877" : "#E25B5B";

  // Normalize bar heights: max = 50px, minimum for completed = 14px, stub for no workout = 4px
  const maxDuration = Math.max(...dayDurations, 1);
  const MAX_BAR_HEIGHT = 50;
  const MIN_BAR_HEIGHT = 14;
  const STUB_HEIGHT = 4;

  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../../../assets/progress/icon-calendar.png")}
            style={styles.calendarIcon}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>This Week</Text>
        </View>
        <Text style={styles.weekRange}>{weekLabel}</Text>
      </View>

      {/* Top section: workouts count + day bars */}
      <View style={styles.topSection}>
        {/* Left: big workout count */}
        <View style={styles.workoutCount}>
          <View style={styles.countRow}>
            <Text style={styles.countBig}>{workoutsCompleted}</Text>
            <Text style={styles.countSlash}>/</Text>
            <Text style={styles.countTotal}>{workoutsPlanned}</Text>
          </View>
          <Text style={styles.countLabel}>workouts</Text>
        </View>

        {/* Right: day volume bars */}
        <View style={styles.barsSection}>
          {dayDurations.map((dur, i) => {
            const barHeight =
              dur > 0
                ? Math.max(MIN_BAR_HEIGHT, (dur / maxDuration) * MAX_BAR_HEIGHT)
                : STUB_HEIGHT;
            const barColor = dur > 0 ? "#2DB877" : "#E0E0E0";
            return (
              <View key={i} style={styles.barCol}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: barColor,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{dayLabels[i]}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom: two columns */}
      <View style={styles.bottomSection}>
        {/* Left: Total Volume */}
        <View style={styles.bottomCol}>
          <Text style={styles.bottomLabel}>TOTAL VOLUME</Text>
          <Text style={styles.bottomValue}>
            {volume >= 1000
              ? `${(volume / 1000).toFixed(1)}k`
              : String(Math.round(volume))}
            <Text style={styles.bottomValueUnit}> kg</Text>
          </Text>
          <Text style={[styles.changeIndicator, { color: volumeChangeColor }]}>
            {volumeChangeStr}
          </Text>
        </View>

        {/* Vertical divider */}
        <View style={styles.verticalDivider} />

        {/* Right: Highlight */}
        <View style={styles.bottomCol}>
          <Text style={styles.bottomLabel}>HIGHLIGHT</Text>
          {bestLift ? (
            <>
              <Text style={styles.bottomValue}>
                {bestLift.weight}
                <Text style={styles.bottomValueUnit}> kg</Text>
                {bestLift.isPR ? " 🏆" : ""}
              </Text>
              <Text style={styles.highlightDetail} numberOfLines={1}>
                {bestLift.exercise}
                {bestLift.isPR ? " · PR" : ""}
              </Text>
            </>
          ) : (
            <Text style={styles.highlightDetail}>No lifts yet</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  calendarIcon: {
    width: 16,
    height: 16,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#888",
  },
  weekRange: {
    fontSize: 11,
    fontWeight: "500",
    color: "#999",
  },
  // Top section
  topSection: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  workoutCount: {
    justifyContent: "flex-end",
  },
  countRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  countBig: {
    fontSize: 36,
    fontWeight: "800",
    color: "#2DB877",
    lineHeight: 40,
  },
  countSlash: {
    fontSize: 15,
    fontWeight: "300",
    color: "#ccc",
    marginHorizontal: 1,
  },
  countTotal: {
    fontSize: 17,
    fontWeight: "600",
    color: "#ccc",
  },
  countLabel: {
    fontSize: 10,
    color: "#999",
    marginTop: 2,
  },
  // Bars
  barsSection: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  barCol: {
    alignItems: "center",
    gap: 4,
  },
  barContainer: {
    justifyContent: "flex-end",
    height: 50,
  },
  bar: {
    width: 7,
    borderRadius: 3.5,
  },
  barLabel: {
    fontSize: 8,
    color: "#999",
  },
  // Divider
  divider: {
    height: 0.5,
    backgroundColor: "rgba(0,0,0,0.06)",
    marginBottom: 12,
  },
  // Bottom
  bottomSection: {
    flexDirection: "row",
  },
  bottomCol: {
    flex: 1,
    gap: 2,
  },
  bottomLabel: {
    fontSize: 8,
    fontWeight: "600",
    color: "#999",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  bottomValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  bottomValueUnit: {
    fontSize: 12,
    fontWeight: "400",
    color: "#999",
  },
  changeIndicator: {
    fontSize: 11,
    fontWeight: "600",
  },
  verticalDivider: {
    width: 0.5,
    backgroundColor: "rgba(0,0,0,0.06)",
    marginHorizontal: 12,
  },
  highlightDetail: {
    fontSize: 9,
    color: "#888",
    marginTop: 1,
  },
});
