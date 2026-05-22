import { View, Text, StyleSheet } from "react-native";

const earth = "#2D2A24";
const trail = "#34D399";
const rock = "#8E8E7A";
const stone = "#EDEBE5";

interface Props {
  monthLabel: string;
  workoutsThisMonth: number;
  workoutsLastMonth: number;
  volumeThisMonth: number;
  volumeLastMonth: number;
  prsThisMonth: number;
  weightStart: number | null;
  weightEnd: number | null;
  mostImproved: { exercise: string; gain: number } | null;
  completionRate: number;
  totalSets: number;
  avgDuration: number;
}

export function MonthlySummary({
  monthLabel,
  workoutsThisMonth,
  workoutsLastMonth,
  volumeThisMonth,
  volumeLastMonth,
  prsThisMonth,
  weightStart,
  weightEnd,
  mostImproved,
  completionRate,
  totalSets,
  avgDuration,
}: Props) {
  const workoutDelta = workoutsThisMonth - workoutsLastMonth;
  const volumePct =
    volumeLastMonth > 0
      ? Math.round(((volumeThisMonth - volumeLastMonth) / volumeLastMonth) * 100)
      : 0;
  const weightDelta =
    weightStart != null && weightEnd != null
      ? weightEnd - weightStart
      : null;

  // Grade based on completion rate
  const grade =
    completionRate >= 90
      ? { letter: "A+", color: trail }
      : completionRate >= 75
      ? { letter: "A", color: trail }
      : completionRate >= 60
      ? { letter: "B", color: "#F59E0B" }
      : completionRate >= 40
      ? { letter: "C", color: "#F97316" }
      : { letter: "D", color: "#EF4444" };

  const rows: { icon: string; label: string; value: string; sub?: string; subColor?: string }[] = [
    {
      icon: "\uD83C\uDFCB\uFE0F",
      label: "Workouts",
      value: `${workoutsThisMonth}`,
      sub:
        workoutsLastMonth > 0
          ? `${workoutDelta >= 0 ? "+" : ""}${workoutDelta} vs last month`
          : undefined,
      subColor: workoutDelta >= 0 ? trail : "#EF4444",
    },
    {
      icon: "\uD83D\uDCAA",
      label: "Total Volume",
      value: volumeThisMonth > 0 ? `${(volumeThisMonth / 1000).toFixed(1)}t` : "\u2014",
      sub:
        volumeLastMonth > 0 && volumeThisMonth > 0
          ? `${volumePct >= 0 ? "+" : ""}${volumePct}%`
          : undefined,
      subColor: volumePct >= 0 ? trail : "#EF4444",
    },
    {
      icon: "\uD83C\uDFC6",
      label: "Personal Records",
      value: `${prsThisMonth}`,
      sub: prsThisMonth > 0 ? "new PRs" : undefined,
    },
    {
      icon: "\u23F1\uFE0F",
      label: "Avg Session",
      value: avgDuration > 0 ? `${avgDuration}min` : "\u2014",
    },
    {
      icon: "\uD83D\uDCCA",
      label: "Total Sets",
      value: `${totalSets}`,
    },
  ];

  if (weightDelta != null) {
    rows.push({
      icon: "\u2696\uFE0F",
      label: "Weight Change",
      value: `${weightDelta > 0 ? "+" : ""}${weightDelta.toFixed(1)} kg`,
      sub: `${weightStart} \u2192 ${weightEnd}`,
      subColor: weightDelta <= 0 ? trail : "#EF4444",
    });
  }

  return (
    <View style={s.card}>
      {/* Header with grade */}
      <View style={s.header}>
        <View>
          <Text style={s.headerLabel}>MONTHLY SUMMARY</Text>
          <Text style={s.headerMonth}>{monthLabel}</Text>
        </View>
        <View style={[s.gradeBadge, { backgroundColor: grade.color }]}>
          <Text style={s.gradeText}>{grade.letter}</Text>
        </View>
      </View>

      {/* Completion bar */}
      <View style={s.completionSection}>
        <View style={s.completionHeader}>
          <Text style={s.completionLabel}>Consistency</Text>
          <Text style={s.completionPct}>{completionRate}%</Text>
        </View>
        <View style={s.completionTrack}>
          <View
            style={[
              s.completionFill,
              {
                width: `${Math.min(completionRate, 100)}%`,
                backgroundColor: grade.color,
              },
            ]}
          />
        </View>
      </View>

      {/* Stats rows */}
      {rows.map((row) => (
        <View key={row.label} style={s.row}>
          <Text style={s.rowIcon}>{row.icon}</Text>
          <Text style={s.rowLabel}>{row.label}</Text>
          <View style={s.rowRight}>
            <Text style={s.rowValue}>{row.value}</Text>
            {row.sub && (
              <Text style={[s.rowSub, row.subColor ? { color: row.subColor } : undefined]}>
                {row.sub}
              </Text>
            )}
          </View>
        </View>
      ))}

      {/* Most improved */}
      {mostImproved && (
        <View style={s.improvedCard}>
          <Text style={s.improvedLabel}>{"\u2B50"} Most Improved</Text>
          <Text style={s.improvedExercise}>{mostImproved.exercise}</Text>
          <Text style={s.improvedGain}>
            +{mostImproved.gain.toFixed(1)} kg estimated 1RM
          </Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: stone,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  headerLabel: {
    fontSize: 9,
    color: rock,
    letterSpacing: 1.5,
    fontFamily: "Quicksand_700Bold", fontWeight: "700",
    marginBottom: 2,
  },
  headerMonth: {
    fontSize: 18,
    fontWeight: "800",
    color: earth,
  },
  gradeBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  gradeText: {
    fontSize: 18,
    fontFamily: "Quicksand_700Bold", fontWeight: "900",
    color: "#FFFFFF",
  },
  completionSection: {
    marginBottom: 18,
  },
  completionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  completionLabel: {
    fontSize: 11,
    color: rock,
    fontFamily: "Quicksand_500Medium", fontWeight: "500",
  },
  completionPct: {
    fontSize: 11,
    color: earth,
    fontWeight: "700",
  },
  completionTrack: {
    height: 8,
    backgroundColor: "rgba(45,42,36,0.06)",
    borderRadius: 4,
    overflow: "hidden",
  },
  completionFill: {
    height: 8,
    borderRadius: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(45,42,36,0.06)",
  },
  rowIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  rowLabel: {
    flex: 1,
    fontSize: 13,
    color: earth,
    fontFamily: "Quicksand_500Medium", fontWeight: "500",
  },
  rowRight: {
    alignItems: "flex-end",
  },
  rowValue: {
    fontSize: 15,
    fontFamily: "Quicksand_700Bold", fontWeight: "800",
    color: earth,
  },
  rowSub: {
    fontSize: 9,
    color: rock,
    fontWeight: "500",
    marginTop: 1,
  },
  improvedCard: {
    backgroundColor: "rgba(245,158,11,0.08)",
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
    alignItems: "center",
  },
  improvedLabel: {
    fontSize: 10,
    color: rock,
    fontFamily: "Quicksand_600SemiBold", fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  improvedExercise: {
    fontSize: 16,
    fontWeight: "800",
    color: earth,
    marginBottom: 2,
  },
  improvedGain: {
    fontSize: 12,
    color: "#047857",
    fontFamily: "Quicksand_600SemiBold", fontWeight: "600",
  },
});
