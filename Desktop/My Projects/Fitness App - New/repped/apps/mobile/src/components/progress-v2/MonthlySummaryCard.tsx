import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  monthLabel: string;
  workouts: number;
  workoutsChange: number; // number vs last month (can be negative)
  volume: number; // kg
  volumeChange: number; // percentage
  avgDuration: number; // minutes
  prs: number;
  completionRate: number; // 0-1
}

interface StatItemProps {
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
}

function StatItem({ label, value, sub, subColor = "#2DB877" }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      {sub ? <Text style={[styles.statSub, { color: subColor }]}>{sub}</Text> : null}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function MonthlySummaryCard({
  monthLabel,
  workouts,
  workoutsChange,
  volume,
  volumeChange,
  avgDuration,
  prs,
  completionRate,
}: Props) {
  const clampedRate = Math.min(Math.max(completionRate, 0), 1);
  const pct = Math.round(clampedRate * 100);

  const workoutChangeStr = workoutsChange >= 0 ? `+${workoutsChange}` : String(workoutsChange);
  const workoutChangeColor = workoutsChange >= 0 ? "#2DB877" : "#E25B5B";

  const volumeChangeStr = volumeChange >= 0 ? `+${volumeChange}%` : `${volumeChange}%`;
  const volumeChangeColor = volumeChange >= 0 ? "#2DB877" : "#E25B5B";

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerEmoji}>📊</Text>
          <Text style={styles.headerTitle}>{monthLabel} Summary</Text>
        </View>
        <View style={styles.completeBadge}>
          <Text style={styles.completeBadgeText}>{pct}% complete</Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatItem
          label="Workouts"
          value={String(workouts)}
          sub={workoutChangeStr}
          subColor={workoutChangeColor}
        />
        <View style={styles.divider} />
        <StatItem
          label="Volume"
          value={`${(volume / 1000).toFixed(1)}k kg`}
          sub={volumeChangeStr}
          subColor={volumeChangeColor}
        />
        <View style={styles.divider} />
        <StatItem
          label="Avg Time"
          value={`${avgDuration}m`}
        />
        <View style={styles.divider} />
        <StatItem
          label="PRs"
          value={String(prs)}
        />
      </View>

      {/* Progress bar on dark track */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Completion</Text>
          <Text style={styles.progressPercent}>{pct}%</Text>
        </View>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${clampedRate * 100}%` }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
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
  headerEmoji: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 15,
    fontFamily: "Quicksand_700Bold", fontWeight: "700",
    color: "#fff",
  },
  completeBadge: {
    backgroundColor: "rgba(45,184,119,0.18)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  completeBadgeText: {
    fontSize: 11,
    fontFamily: "Quicksand_600SemiBold", fontWeight: "600",
    color: "#2DB877",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontSize: 16,
    fontFamily: "Quicksand_700Bold", fontWeight: "700",
    color: "#fff",
  },
  statSub: {
    fontSize: 10,
    fontWeight: "600",
  },
  statLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.45)",
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  progressSection: {
    gap: 6,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
    fontFamily: "Quicksand_600SemiBold", fontWeight: "600",
  },
  progressPercent: {
    fontSize: 11,
    color: "#2DB877",
    fontWeight: "700",
  },
  barTrack: {
    height: 5,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: "#2DB877",
    borderRadius: 3,
  },
});
