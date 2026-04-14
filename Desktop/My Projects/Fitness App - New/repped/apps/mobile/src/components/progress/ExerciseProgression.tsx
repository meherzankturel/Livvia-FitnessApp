import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useState, useEffect } from "react";
import { calculateEstimated1RM } from "@repped/shared";
import { supabase } from "../../lib/supabase";

const earth = "#2D2A24";
const sand = "#F6F5F0";
const trail = "#34D399";
const rock = "#8E8E7A";
const stone = "#EDEBE5";

const SCREEN_W = Dimensions.get("window").width;
const CHART_H = 150;
const CHART_PADDING_H = 48; // left + right padding
const MAX_POINTS = 10;

type ChartMode = "weight" | "volume" | "1rm";

interface ExerciseOption {
  id: string;
  name: string;
}

interface DataPoint {
  date: string;
  maxWeight: number;
  totalVolume: number;
  estimated1RM: number;
  sets: { reps: number; weight_kg: number }[];
}

interface Props {
  userId: string;
  exerciseList: ExerciseOption[];
}

export function ExerciseProgression({ userId, exerciseList }: Props) {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseOption | null>(
    exerciseList.length > 0 ? exerciseList[0] : null
  );
  const [showPicker, setShowPicker] = useState(false);
  const [chartMode, setChartMode] = useState<ChartMode>("weight");
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedExercise) loadExerciseData(selectedExercise.id);
  }, [selectedExercise?.id]);

  const loadExerciseData = async (exerciseId: string) => {
    setLoading(true);

    // Get all set_logs for this exercise, grouped by workout date
    const { data: logs } = await supabase
      .from("set_logs")
      .select("reps, weight_kg, workout_log_id, workout_logs(started_at)")
      .eq("user_id", userId)
      .eq("exercise_id", exerciseId);

    if (!logs || logs.length === 0) {
      setDataPoints([]);
      setLoading(false);
      return;
    }

    // Group by workout date
    const byDate: Record<string, { reps: number; weight_kg: number }[]> = {};
    (logs as any[]).forEach((s) => {
      const dateRaw = s.workout_logs?.started_at;
      if (!dateRaw) return;
      const date = new Date(dateRaw).toISOString().split("T")[0];
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push({ reps: s.reps, weight_kg: s.weight_kg });
    });

    const points: DataPoint[] = Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, sets]) => {
        const maxWeight = Math.max(...sets.map((s) => s.weight_kg));
        const totalVolume = sets.reduce((sum, s) => sum + s.reps * s.weight_kg, 0);
        const best1RM = Math.max(
          ...sets.map((s) => calculateEstimated1RM(s.weight_kg, s.reps))
        );
        return { date, maxWeight, totalVolume, estimated1RM: best1RM, sets };
      });

    // Take last MAX_POINTS
    setDataPoints(points.slice(-MAX_POINTS));
    setLoading(false);
  };

  const getValue = (point: DataPoint): number => {
    if (chartMode === "weight") return point.maxWeight;
    if (chartMode === "volume") return point.totalVolume;
    return point.estimated1RM;
  };

  const formatValue = (val: number): string => {
    if (chartMode === "volume") return `${(val / 1000).toFixed(1)}t`;
    return `${Math.round(val)}`;
  };

  const formatUnit = (): string => {
    if (chartMode === "volume") return "volume";
    if (chartMode === "1rm") return "est. 1RM (kg)";
    return "max weight (kg)";
  };

  // Chart rendering
  const renderChart = () => {
    if (dataPoints.length === 0) {
      return (
        <View style={s.chartEmpty}>
          <Text style={s.chartEmptyText}>No data for this exercise yet</Text>
        </View>
      );
    }

    const values = dataPoints.map(getValue);
    const minVal = Math.min(...values) * 0.9;
    const maxVal = Math.max(...values) * 1.05;
    const range = maxVal - minVal || 1;

    const barAreaWidth = SCREEN_W - CHART_PADDING_H - 24; // 24 for container padding
    const barGap = Math.max(Math.floor(barAreaWidth / dataPoints.length), 20);

    return (
      <View>
        {/* Mode label */}
        <Text style={s.chartUnit}>{formatUnit()}</Text>

        {/* Chart area */}
        <View style={[s.chartArea, { height: CHART_H }]}>
          {/* Y-axis guides */}
          {[0, 0.5, 1].map((frac, i) => {
            const val = minVal + range * (1 - frac);
            return (
              <View key={i} style={[s.yGuide, { top: frac * (CHART_H - 24) }]}>
                <Text style={s.yLabel}>{Math.round(val)}</Text>
                <View style={s.yLine} />
              </View>
            );
          })}

          {/* Bars + dots */}
          <View style={s.barsContainer}>
            {dataPoints.map((point, i) => {
              const val = getValue(point);
              const h = ((val - minVal) / range) * (CHART_H - 32);
              const isLast = i === dataPoints.length - 1;
              return (
                <View key={point.date} style={[s.barCol, { width: barGap }]}>
                  <View style={s.barWrapper}>
                    <View
                      style={[
                        s.bar,
                        {
                          height: Math.max(h, 4),
                          backgroundColor: isLast
                            ? trail
                            : "rgba(45,42,36,0.12)",
                        },
                      ]}
                    />
                    <View
                      style={[
                        s.dot,
                        {
                          backgroundColor: isLast ? trail : earth,
                          bottom: Math.max(h, 4) - 3,
                        },
                      ]}
                    />
                    {isLast && (
                      <Text style={[s.dotLabel, { bottom: Math.max(h, 4) + 6 }]}>
                        {formatValue(val)}
                      </Text>
                    )}
                  </View>
                  <Text style={s.barDate}>
                    {new Date(point.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Trend line */}
        {dataPoints.length >= 2 && (
          <View style={s.trendRow}>
            {(() => {
              const first = getValue(dataPoints[0]);
              const last = getValue(dataPoints[dataPoints.length - 1]);
              const delta = last - first;
              const pct = first > 0 ? Math.round((delta / first) * 100) : 0;
              const isUp = delta >= 0;
              return (
                <>
                  <Text style={[s.trendArrow, { color: isUp ? trail : "#EF4444" }]}>
                    {isUp ? "\u2191" : "\u2193"}
                  </Text>
                  <Text style={[s.trendText, { color: isUp ? trail : "#EF4444" }]}>
                    {isUp ? "+" : ""}
                    {chartMode === "volume"
                      ? `${(delta / 1000).toFixed(1)}t`
                      : `${delta.toFixed(1)}kg`}{" "}
                    ({pct >= 0 ? "+" : ""}
                    {pct}%) overall
                  </Text>
                </>
              );
            })()}
          </View>
        )}
      </View>
    );
  };

  // Recent sessions (exercise history)
  const renderHistory = () => {
    const recent = [...dataPoints].reverse().slice(0, 5);
    if (recent.length === 0) return null;

    return (
      <View style={s.historySection}>
        <Text style={s.historyTitle}>Recent Sessions</Text>
        {recent.map((point) => (
          <View key={point.date} style={s.historyRow}>
            <Text style={s.historyDate}>
              {new Date(point.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </Text>
            <View style={s.historySetsList}>
              {point.sets.map((set, i) => (
                <Text key={i} style={s.historySet}>
                  {set.weight_kg}kg \u00D7 {set.reps}
                </Text>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (exerciseList.length === 0) {
    return (
      <View style={s.emptyCard}>
        <Text style={s.emptyIcon}>{"\uD83D\uDCCA"}</Text>
        <Text style={s.emptyText}>
          Complete workouts to track exercise progression
        </Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      {/* Exercise picker */}
      <Pressable
        onPress={() => setShowPicker(!showPicker)}
        style={s.pickerBtn}
      >
        <Text style={s.pickerText} numberOfLines={1}>
          {selectedExercise?.name || "Select exercise"}
        </Text>
        <Text style={s.pickerArrow}>{showPicker ? "\u25B2" : "\u25BC"}</Text>
      </Pressable>

      {/* Dropdown */}
      {showPicker && (
        <View style={s.dropdown}>
          <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
            {exerciseList.map((ex) => (
              <Pressable
                key={ex.id}
                onPress={() => {
                  setSelectedExercise(ex);
                  setShowPicker(false);
                }}
                style={[
                  s.dropdownItem,
                  selectedExercise?.id === ex.id && s.dropdownItemActive,
                ]}
              >
                <Text
                  style={[
                    s.dropdownText,
                    selectedExercise?.id === ex.id && s.dropdownTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {ex.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Chart mode tabs */}
      <View style={s.modeTabs}>
        {(["weight", "volume", "1rm"] as ChartMode[]).map((mode) => (
          <Pressable
            key={mode}
            onPress={() => setChartMode(mode)}
            style={[s.modeTab, chartMode === mode && s.modeTabActive]}
          >
            <Text
              style={[
                s.modeTabText,
                chartMode === mode && s.modeTabTextActive,
              ]}
            >
              {mode === "1rm" ? "1RM" : mode === "weight" ? "Weight" : "Volume"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Chart or loading */}
      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="small" color={earth} />
        </View>
      ) : (
        renderChart()
      )}

      {/* History */}
      {!loading && renderHistory()}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginBottom: 24,
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

  // Picker
  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: stone,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
  },
  pickerText: {
    fontSize: 14,
    fontWeight: "700",
    color: earth,
    flex: 1,
  },
  pickerArrow: {
    fontSize: 8,
    color: rock,
    marginLeft: 8,
  },

  // Dropdown
  dropdown: {
    backgroundColor: sand,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: stone,
    marginBottom: 10,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(45,42,36,0.06)",
  },
  dropdownItemActive: {
    backgroundColor: "rgba(52,211,153,0.06)",
  },
  dropdownText: {
    fontSize: 13,
    color: earth,
  },
  dropdownTextActive: {
    fontWeight: "700",
    color: "#047857",
  },

  // Mode tabs
  modeTabs: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 14,
  },
  modeTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: stone,
  },
  modeTabActive: {
    backgroundColor: earth,
  },
  modeTabText: {
    fontSize: 11,
    fontWeight: "600",
    color: rock,
  },
  modeTabTextActive: {
    color: sand,
  },

  // Chart
  chartUnit: {
    fontSize: 9,
    color: rock,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  chartArea: {
    position: "relative",
    marginBottom: 8,
  },
  yGuide: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  yLabel: {
    fontSize: 8,
    color: rock,
    width: 28,
    textAlign: "right",
    marginRight: 6,
  },
  yLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: "rgba(45,42,36,0.06)",
  },
  barsContainer: {
    position: "absolute",
    left: 36,
    right: 0,
    bottom: 16,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
  },
  barCol: {
    alignItems: "center",
  },
  barWrapper: {
    alignItems: "center",
    position: "relative",
  },
  bar: {
    width: 6,
    borderRadius: 3,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    position: "absolute",
  },
  dotLabel: {
    position: "absolute",
    fontSize: 9,
    fontWeight: "800",
    color: earth,
  },
  barDate: {
    fontSize: 7,
    color: rock,
    marginTop: 4,
    textAlign: "center",
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    marginBottom: 8,
  },
  trendArrow: {
    fontSize: 13,
    fontWeight: "700",
  },
  trendText: {
    fontSize: 11,
    fontWeight: "600",
  },
  chartEmpty: {
    height: CHART_H,
    alignItems: "center",
    justifyContent: "center",
  },
  chartEmptyText: {
    fontSize: 12,
    color: rock,
  },
  loadingWrap: {
    height: CHART_H,
    alignItems: "center",
    justifyContent: "center",
  },

  // History
  historySection: {
    backgroundColor: stone,
    borderRadius: 16,
    padding: 14,
  },
  historyTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: earth,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(45,42,36,0.06)",
  },
  historyDate: {
    fontSize: 11,
    color: rock,
    fontWeight: "600",
    width: 52,
    marginTop: 1,
  },
  historySetsList: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  historySet: {
    fontSize: 11,
    color: earth,
    fontWeight: "500",
    backgroundColor: "rgba(45,42,36,0.04)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
});
