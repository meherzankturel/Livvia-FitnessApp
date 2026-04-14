import { View, Text, StyleSheet } from "react-native";

const earth = "#2D2A24";
const trail = "#34D399";
const rock = "#8E8E7A";
const stone = "#EDEBE5";

const BAR_COLORS = [
  trail,
  "#6366F1",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#8B5CF6",
  "#EC4899",
  "#84CC16",
  "#14B8A6",
  "#F97316",
  "rgba(45,42,36,0.30)",
];

const DISPLAY_NAMES: Record<string, string> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  biceps: "Biceps",
  triceps: "Triceps",
  quads: "Quads",
  hamstrings: "Hamstrings",
  glutes: "Glutes",
  calves: "Calves",
  core: "Core",
  full_body: "Full Body",
};

interface MuscleGroupVolume {
  muscleGroup: string;
  totalSets: number;
  totalVolume: number;
  percentage: number;
}

interface Props {
  distribution: MuscleGroupVolume[];
}

export function MuscleDistribution({ distribution }: Props) {
  if (distribution.length === 0) {
    return (
      <View style={s.emptyCard}>
        <Text style={s.emptyIcon}>{"\uD83D\uDCAA"}</Text>
        <Text style={s.emptyText}>Complete workouts to see muscle balance</Text>
      </View>
    );
  }

  const sorted = [...distribution].sort((a, b) => b.percentage - a.percentage);
  const maxPct = sorted[0]?.percentage || 1;

  return (
    <View style={s.container}>
      {sorted.map((item, i) => {
        const barWidth = Math.max((item.percentage / maxPct) * 100, 4);
        return (
          <View key={item.muscleGroup} style={s.row}>
            <Text style={s.label} numberOfLines={1}>
              {DISPLAY_NAMES[item.muscleGroup] || item.muscleGroup}
            </Text>
            <View style={s.track}>
              <View
                style={[
                  s.fill,
                  {
                    width: `${Math.round(barWidth)}%`,
                    backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                  },
                ]}
              />
            </View>
            <Text style={s.pct}>{Math.round(item.percentage)}%</Text>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    color: earth,
    fontWeight: "500",
    width: 80,
  },
  track: {
    flex: 1,
    height: 10,
    backgroundColor: stone,
    borderRadius: 5,
    overflow: "hidden",
    marginHorizontal: 8,
  },
  fill: {
    height: 10,
    borderRadius: 5,
  },
  pct: {
    fontSize: 11,
    fontWeight: "700",
    color: earth,
    width: 32,
    textAlign: "right",
  },
  emptyCard: {
    backgroundColor: stone,
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    color: rock,
    textAlign: "center",
  },
});
