import { View, Text, StyleSheet } from "react-native";

const earth = "#2D2A24";
const trail = "#34D399";
const rock = "#8E8E7A";
const stone = "#EDEBE5";

interface Props {
  workoutsThisMonth: number;
  workoutsLastMonth: number;
  volumeThisMonth: number;
  volumeLastMonth: number;
  streak: number;
  streakBest: number;
  weightCurrent: number | null;
  weightMonthAgo: number | null;
}

export function TrendsOverview({
  workoutsThisMonth,
  workoutsLastMonth,
  volumeThisMonth,
  volumeLastMonth,
  streak,
  streakBest,
  weightCurrent,
  weightMonthAgo,
}: Props) {
  const cards = [
    {
      label: "Workouts",
      value: `${workoutsThisMonth}`,
      sub: workoutsLastMonth > 0
        ? formatChange(workoutsThisMonth, workoutsLastMonth)
        : "this month",
      positive: workoutsThisMonth >= workoutsLastMonth,
      hasComparison: workoutsLastMonth > 0,
    },
    {
      label: "Volume",
      value: volumeThisMonth > 0 ? `${(volumeThisMonth / 1000).toFixed(1)}t` : "—",
      sub: volumeLastMonth > 0
        ? formatChange(volumeThisMonth, volumeLastMonth)
        : "this month",
      positive: volumeThisMonth >= volumeLastMonth,
      hasComparison: volumeLastMonth > 0,
    },
    {
      label: "Streak",
      value: `${streak}d`,
      sub: streakBest > streak ? `best: ${streakBest}d` : "personal best!",
      positive: streak >= streakBest && streak > 0,
      hasComparison: streakBest > 0,
    },
    {
      label: "Weight",
      value: weightCurrent != null ? `${weightCurrent}` : "—",
      sub:
        weightCurrent != null && weightMonthAgo != null
          ? `${(weightCurrent - weightMonthAgo) > 0 ? "+" : ""}${(weightCurrent - weightMonthAgo).toFixed(1)} kg`
          : weightCurrent != null
          ? "kg"
          : "not logged",
      positive:
        weightCurrent != null && weightMonthAgo != null
          ? weightCurrent <= weightMonthAgo
          : true,
      hasComparison: weightCurrent != null && weightMonthAgo != null,
    },
  ];

  return (
    <View style={s.grid}>
      {cards.map((c) => (
        <View key={c.label} style={s.card}>
          <Text style={s.cardLabel}>{c.label}</Text>
          <Text style={s.cardValue}>{c.value}</Text>
          <View style={s.subRow}>
            {c.hasComparison && (
              <Text
                style={[
                  s.arrow,
                  { color: c.positive ? trail : "#EF4444" },
                ]}
              >
                {c.positive ? "\u2191" : "\u2193"}
              </Text>
            )}
            <Text
              style={[
                s.cardSub,
                c.hasComparison && {
                  color: c.positive ? trail : "#EF4444",
                },
              ]}
            >
              {c.sub}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function formatChange(current: number, previous: number): string {
  if (previous === 0) return "new";
  const pct = Math.round(((current - previous) / previous) * 100);
  return `${pct >= 0 ? "+" : ""}${pct}% vs last`;
}

const s = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  card: {
    width: "48%" as any,
    backgroundColor: stone,
    borderRadius: 16,
    padding: 14,
  },
  cardLabel: {
    fontSize: 9,
    color: rock,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 26,
    fontFamily: "Quicksand_700Bold", fontWeight: "800",
    color: earth,
    lineHeight: 30,
  },
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  arrow: {
    fontSize: 12,
    fontFamily: "Quicksand_700Bold", fontWeight: "700",
  },
  cardSub: {
    fontSize: 10,
    color: rock,
    fontWeight: "500",
  },
});
