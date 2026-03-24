import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, RefreshControl } from "react-native";
import { useEffect, useState, useCallback } from "react";
import { router } from "expo-router";
import {
  useAuthStore,
  calculateEstimated1RM,
  calculateVolumeLoad,
  calculateWorkoutStreak,
  calculateCompletionRate,
} from "@repped/shared";
import { supabase } from "../../src/lib/supabase";
import { theme } from "../../src/lib/styles";
import { TopoBackground, BentoWidget } from "../../src/components/terrain";

interface ProgressEntry {
  id: string;
  date: string;
  weight_kg: number | null;
}

const COMPOUND_LIFTS = ["Bench Press", "Squat", "Deadlift", "Overhead Press"];
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

// ─── Color aliases ────────────────────────────────────────────────────────────
const C = theme.colors;

// ─── Card style helper ───────────────────────────────────────────────────────
const whiteCard = {
  backgroundColor: C.white,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: C.border,
  padding: 20,
  marginBottom: 16,
} as const;

export default function Progress() {
  const session = useAuthStore((s) => s.session);
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [weightInput, setWeightInput] = useState("");
  const [showInput, setShowInput] = useState(false);

  // Stats
  const [workoutCount, setWorkoutCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);

  // Heatmap
  const [heatmapData, setHeatmapData] = useState<Record<string, boolean>>({});

  // 1RM
  const [estimated1RMs, setEstimated1RMs] = useState<{ name: string; value: number }[]>([]);

  // Volume
  const [volumeThisWeek, setVolumeThisWeek] = useState(0);
  const [volumeLastWeek, setVolumeLastWeek] = useState(0);

  // PRs
  const [recentPRs, setRecentPRs] = useState<{ name: string; value: number; type: string }[]>([]);

  // Body measurements
  const [measurements, setMeasurements] = useState<any>(null);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [showAllEntries, setShowAllEntries] = useState(false);

  // Pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    if (!session?.user?.id) return;
    const uid = session.user.id;

    // Load weight entries
    const { data: weightData } = await supabase
      .from("progress_entries")
      .select("id, date, weight_kg")
      .eq("user_id", uid)
      .order("date", { ascending: false })
      .limit(30);
    setEntries(weightData || []);

    // Load total workout count
    const { count } = await supabase
      .from("workout_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", uid)
      .eq("skipped", false);
    setWorkoutCount(count || 0);

    // Load all workout dates for streak
    const { data: allLogs } = await supabase
      .from("workout_logs")
      .select("started_at")
      .eq("user_id", uid)
      .eq("skipped", false)
      .order("started_at", { ascending: false });
    const workoutDates = ((allLogs as any[]) || []).map((l) => l.started_at);
    setStreak(calculateWorkoutStreak(workoutDates));

    // Completion rate (planned vs completed this week)
    const { data: plans } = await supabase
      .from("workout_plans")
      .select("id")
      .eq("user_id", uid)
      .eq("is_rest_day", false);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: weekLogs } = await supabase
      .from("workout_logs")
      .select("id")
      .eq("user_id", uid)
      .eq("skipped", false)
      .gte("started_at", weekAgo);
    const planned = ((plans as any[]) || []).length;
    const completed = ((weekLogs as any[]) || []).length;
    setCompletionRate(Math.round(calculateCompletionRate(planned, completed) * 100));

    // Heatmap: last 84 days of workout dates
    const heatmapStart = new Date(Date.now() - 84 * 24 * 60 * 60 * 1000).toISOString();
    const { data: heatmapLogs } = await supabase
      .from("workout_logs")
      .select("started_at")
      .eq("user_id", uid)
      .eq("skipped", false)
      .gte("started_at", heatmapStart);
    const map: Record<string, boolean> = {};
    ((heatmapLogs as any[]) || []).forEach((l) => {
      const day = new Date(l.started_at).toISOString().split("T")[0];
      map[day] = true;
    });
    setHeatmapData(map);

    // Estimated 1RM for compound lifts
    const { data: setLogsRaw } = await supabase
      .from("set_logs")
      .select("reps, weight_kg, exercises(name)")
      .eq("user_id", uid)
      .order("weight_kg", { ascending: false });
    const bestSets: Record<string, { weight: number; reps: number }> = {};
    ((setLogsRaw as any[]) || []).forEach((s) => {
      const name = s.exercises?.name;
      if (!name || !COMPOUND_LIFTS.includes(name)) return;
      const est = calculateEstimated1RM(s.weight_kg, s.reps);
      if (!bestSets[name] || est > calculateEstimated1RM(bestSets[name].weight, bestSets[name].reps)) {
        bestSets[name] = { weight: s.weight_kg, reps: s.reps };
      }
    });
    setEstimated1RMs(
      COMPOUND_LIFTS.filter((n) => bestSets[n]).map((n) => ({
        name: n,
        value: calculateEstimated1RM(bestSets[n].weight, bestSets[n].reps),
      }))
    );

    // Volume this week vs last week
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentWorkouts } = await supabase
      .from("workout_logs")
      .select("id, started_at")
      .eq("user_id", uid)
      .eq("skipped", false)
      .gte("started_at", twoWeeksAgo);
    const thisWeekIds: string[] = [];
    const lastWeekIds: string[] = [];
    ((recentWorkouts as any[]) || []).forEach((w) => {
      if (new Date(w.started_at) >= new Date(weekAgo)) thisWeekIds.push(w.id);
      else lastWeekIds.push(w.id);
    });

    const loadVolume = async (ids: string[]) => {
      if (ids.length === 0) return 0;
      const { data } = await supabase.from("set_logs").select("reps, weight_kg").in("workout_log_id", ids);
      return calculateVolumeLoad(((data as any[]) || []).map((s) => ({ reps: s.reps, weight_kg: s.weight_kg })));
    };
    setVolumeThisWeek(await loadVolume(thisWeekIds));
    setVolumeLastWeek(await loadVolume(lastWeekIds));

    // Recent PRs (last 30 days)
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: prs } = await supabase
      .from("personal_records")
      .select("*, exercises(name)")
      .eq("user_id", uid)
      .gte("achieved_at", monthAgo)
      .order("achieved_at", { ascending: false })
      .limit(5);
    setRecentPRs(
      ((prs as any[]) || []).map((p: any) => ({
        name: p.exercises?.name || "",
        value: p.value,
        type: p.record_type,
      }))
    );

    // Body measurements (latest)
    const { data: measData } = await supabase
      .from("body_measurements")
      .select("*")
      .eq("user_id", uid)
      .order("date", { ascending: false })
      .limit(1);
    if (measData && measData.length > 0) setMeasurements(measData[0]);

    setLoading(false);
  };

  const logWeight = async () => {
    if (!session?.user?.id || !weightInput) return;
    const weight = parseFloat(weightInput);
    if (isNaN(weight) || weight <= 0) return;

    await supabase.from("progress_entries").insert({
      user_id: session.user.id,
      weight_kg: weight,
    });

    setWeightInput("");
    setShowInput(false);
    loadAll();
  };

  // Weight trend
  const recentAvg =
    entries.slice(0, 7).reduce((s, e) => s + (e.weight_kg || 0), 0) / Math.min(entries.length, 7);
  const previousAvg =
    entries.slice(7, 14).reduce((s, e) => s + (e.weight_kg || 0), 0) /
    Math.min(Math.max(entries.length - 7, 1), 7);
  const trend = entries.length > 7 ? recentAvg - previousAvg : 0;

  // Build heatmap grid (12 weeks, 84 days)
  const buildHeatmapDays = () => {
    const days: { date: string; hasWorkout: boolean; isToday: boolean }[] = [];
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    for (let i = 83; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      days.push({ date: dateStr, hasWorkout: !!heatmapData[dateStr], isToday: dateStr === todayStr });
    }
    return days;
  };

  // Volume change percentage
  const volumeChange =
    volumeLastWeek > 0 ? Math.round(((volumeThisWeek - volumeLastWeek) / volumeLastWeek) * 100) : 0;

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: "center", alignItems: "center" }}>
        <TopoBackground />
        <ActivityIndicator size="large" color={C.earth} />
      </View>
    );
  }

  const heatmapDays = buildHeatmapDays();
  const dateLabel = new Date()
    .toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
    .toUpperCase();

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopoBackground />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.earth} />
        }
      >
        <View style={{ paddingHorizontal: 24, paddingTop: 60 }}>

          {/* ── 1. HEADER ── */}
          <Text style={{ fontSize: 11, color: C.rock, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 4 }}>
            {dateLabel}
          </Text>
          <Text style={{ fontSize: 24, fontWeight: "700", color: C.earth, marginBottom: 24 }}>
            Your Journey
          </Text>

          {/* ── 2. BENTO STATS 2×2 ── */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
            {/* Top-left: completion */}
            <BentoWidget variant="dark" style={{ flex: 1, minWidth: "45%" }}>
              <Text style={{ fontSize: 36, fontWeight: "800", color: C.stone }}>
                {completionRate}%
              </Text>
              <Text style={{ fontSize: 11, color: C.rock, marginTop: 4, textTransform: "uppercase", letterSpacing: 0.8 }}>
                Complete
              </Text>
            </BentoWidget>

            {/* Top-right: workout count */}
            <BentoWidget variant="stone" style={{ flex: 1, minWidth: "45%" }}>
              <Text style={{ fontSize: 36, fontWeight: "800", color: C.earth }}>
                {workoutCount}
              </Text>
              <Text style={{ fontSize: 11, color: C.rock, marginTop: 4, textTransform: "uppercase", letterSpacing: 0.8 }}>
                Workouts
              </Text>
            </BentoWidget>

            {/* Bottom-left: streak */}
            <BentoWidget variant="stone" style={{ flex: 1, minWidth: "45%" }}>
              <Text style={{ fontSize: 36, fontWeight: "800", color: C.earth }}>
                {streak}
              </Text>
              <Text style={{ fontSize: 11, color: C.rock, marginTop: 4, textTransform: "uppercase", letterSpacing: 0.8 }}>
                Day Streak
              </Text>
            </BentoWidget>

            {/* Bottom-right: volume trend */}
            <BentoWidget variant="dark" style={{ flex: 1, minWidth: "45%" }}>
              <Text style={{ fontSize: 24, fontWeight: "800", color: C.stone }}>
                {volumeThisWeek > 0 ? `${(volumeThisWeek / 1000).toFixed(1)}t` : "—"}
              </Text>
              <Text style={{ fontSize: 11, color: C.rock, marginTop: 4, textTransform: "uppercase", letterSpacing: 0.8 }}>
                Volume
              </Text>
            </BentoWidget>
          </View>

          {/* ── 3. HEATMAP ── */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: C.earth, marginBottom: 12 }}>
              12-Week Activity
            </Text>
            {/* Day labels */}
            <View style={{ flexDirection: "row", marginBottom: 6 }}>
              {DAY_LABELS.map((label, i) => (
                <View key={i} style={{ flex: 1, alignItems: "center" }}>
                  <Text style={{ fontSize: 10, color: C.rock }}>{label}</Text>
                </View>
              ))}
            </View>
            {/* Grid rows */}
            {Array.from({ length: 12 }).map((_, weekIdx) => (
              <View key={weekIdx} style={{ flexDirection: "row", marginBottom: 3 }}>
                {Array.from({ length: 7 }).map((_, dayIdx) => {
                  const idx = weekIdx * 7 + dayIdx;
                  const day = heatmapDays[idx];
                  let bg: string = C.stone; // empty
                  if (day?.isToday) bg = C.trail;
                  else if (day?.hasWorkout) bg = C.earth;
                  return (
                    <View key={dayIdx} style={{ flex: 1, alignItems: "center", paddingHorizontal: 1.5 }}>
                      <View style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: bg }} />
                    </View>
                  );
                })}
              </View>
            ))}
          </View>

          {/* ── 4. WEIGHT ── */}
          <View style={whiteCard}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: C.earth, marginBottom: 12 }}>
              Weight
            </Text>
            <View style={{ flexDirection: "row", alignItems: "baseline", marginBottom: 16 }}>
              <Text style={{ fontSize: 28, fontWeight: "800", color: C.earth }}>
                {entries[0]?.weight_kg ? `${entries[0].weight_kg} kg` : "No entries"}
              </Text>
              {trend !== 0 && (
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    marginLeft: 10,
                    color: trend > 0 ? "#EF4444" : C.trail,
                  }}
                >
                  {trend > 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)} kg
                </Text>
              )}
            </View>

            {showInput ? (
              <View>
                <TextInput
                  style={{
                    backgroundColor: C.stone,
                    borderRadius: 14,
                    paddingHorizontal: 20,
                    paddingVertical: 14,
                    fontSize: 20,
                    color: C.earth,
                    textAlign: "center",
                    marginBottom: 12,
                  }}
                  placeholder="70.0"
                  placeholderTextColor={C.rock}
                  keyboardType="decimal-pad"
                  value={weightInput}
                  onChangeText={setWeightInput}
                  autoFocus
                />
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Pressable
                    onPress={() => setShowInput(false)}
                    style={{
                      flex: 1,
                      backgroundColor: C.stone,
                      borderRadius: 14,
                      paddingVertical: 12,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: C.earth, fontWeight: "600" }}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={logWeight}
                    style={{
                      flex: 1,
                      backgroundColor: C.earth,
                      borderRadius: 14,
                      paddingVertical: 12,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: C.bg, fontWeight: "600" }}>Save</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => setShowInput(true)}
                style={{
                  backgroundColor: C.stone,
                  borderRadius: 14,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: C.earth, fontWeight: "600" }}>Log Weight</Text>
              </Pressable>
            )}
          </View>

          {/* ── 5. ESTIMATED 1RM ── */}
          {estimated1RMs.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: C.earth, marginBottom: 10 }}>
                Estimated 1RM
              </Text>
              {estimated1RMs.map((lift, i) => (
                <View
                  key={lift.name}
                  style={{
                    backgroundColor: C.white,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: C.border,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: i < estimated1RMs.length - 1 ? 8 : 0,
                  }}
                >
                  <Text style={{ fontSize: 14, color: C.earth }}>{lift.name}</Text>
                  <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: C.earth }}>
                      ~{lift.value}
                    </Text>
                    <Text style={{ fontSize: 12, color: C.rock, marginLeft: 3 }}>kg</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ── 6. VOLUME TREND ── */}
          <View style={whiteCard}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: C.earth, marginBottom: 4 }}>
              Volume This Week
            </Text>
            <Text style={{ fontSize: 28, fontWeight: "800", color: C.earth, marginBottom: 4 }}>
              {volumeThisWeek > 0 ? `${(volumeThisWeek / 1000).toFixed(1)} tons` : "—"}
            </Text>
            {volumeLastWeek > 0 && (
              <Text
                style={{
                  fontSize: 13,
                  color: volumeChange >= 0 ? C.trail : "#EF4444",
                  fontWeight: "600",
                }}
              >
                {volumeChange >= 0 ? "+" : ""}{volumeChange}% vs last week
              </Text>
            )}
          </View>

          {/* ── 7. RECENT PRs ── */}
          {recentPRs.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: C.earth, marginBottom: 10 }}>
                Recent PRs
              </Text>
              {recentPRs.map((pr, i) => (
                <View
                  key={i}
                  style={{
                    backgroundColor: C.white,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: C.border,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: i < recentPRs.length - 1 ? 8 : 0,
                  }}
                >
                  <Text style={{ fontSize: 14, color: C.earth, flex: 1 }}>{pr.name}</Text>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: C.earth }}>{pr.value} kg</Text>
                    <Text style={{ fontSize: 11, color: C.rock, marginTop: 2 }}>{pr.type}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ── 8. BODY MEASUREMENTS (collapsible) ── */}
          <View style={{ marginBottom: 16 }}>
            <Pressable
              onPress={() => setShowMeasurements(!showMeasurements)}
              style={{
                backgroundColor: C.stone,
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: C.earth }}>Body Measurements</Text>
              <Text style={{ fontSize: 16, color: C.rock }}>{showMeasurements ? "▲" : "▼"}</Text>
            </Pressable>

            {showMeasurements && (
              <View
                style={{
                  backgroundColor: C.white,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: C.border,
                  padding: 16,
                  marginTop: 6,
                }}
              >
                {measurements ? (
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                    {measurements.chest_cm && (
                      <View style={{ width: "30%" }}>
                        <Text style={{ fontSize: 18, fontWeight: "700", color: C.earth }}>{measurements.chest_cm}</Text>
                        <Text style={{ fontSize: 11, color: C.rock }}>Chest (cm)</Text>
                      </View>
                    )}
                    {measurements.waist_cm && (
                      <View style={{ width: "30%" }}>
                        <Text style={{ fontSize: 18, fontWeight: "700", color: C.earth }}>{measurements.waist_cm}</Text>
                        <Text style={{ fontSize: 11, color: C.rock }}>Waist (cm)</Text>
                      </View>
                    )}
                    {measurements.hips_cm && (
                      <View style={{ width: "30%" }}>
                        <Text style={{ fontSize: 18, fontWeight: "700", color: C.earth }}>{measurements.hips_cm}</Text>
                        <Text style={{ fontSize: 11, color: C.rock }}>Hips (cm)</Text>
                      </View>
                    )}
                    {measurements.bicep_cm && (
                      <View style={{ width: "30%" }}>
                        <Text style={{ fontSize: 18, fontWeight: "700", color: C.earth }}>{measurements.bicep_cm}</Text>
                        <Text style={{ fontSize: 11, color: C.rock }}>Bicep (cm)</Text>
                      </View>
                    )}
                    {measurements.thigh_cm && (
                      <View style={{ width: "30%" }}>
                        <Text style={{ fontSize: 18, fontWeight: "700", color: C.earth }}>{measurements.thigh_cm}</Text>
                        <Text style={{ fontSize: 11, color: C.rock }}>Thigh (cm)</Text>
                      </View>
                    )}
                    {measurements.body_fat_pct && (
                      <View style={{ width: "30%" }}>
                        <Text style={{ fontSize: 18, fontWeight: "700", color: C.earth }}>{measurements.body_fat_pct}%</Text>
                        <Text style={{ fontSize: 11, color: C.rock }}>Body Fat</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <Text style={{ color: C.rock }}>No measurements logged yet.</Text>
                )}
              </View>
            )}
          </View>

          {/* ── 9. QUICK LINKS ── */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <Pressable
              onPress={() => router.push("/achievements" as any)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 100,
                backgroundColor: C.stone,
              }}
            >
              <Text style={{ fontSize: 13, color: C.earth, fontWeight: "600" }}>Achievements</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/weekly-summary" as any)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 100,
                backgroundColor: C.stone,
              }}
            >
              <Text style={{ fontSize: 13, color: C.earth, fontWeight: "600" }}>Weekly Summary</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/wellness" as any)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 100,
                backgroundColor: C.stone,
              }}
            >
              <Text style={{ fontSize: 13, color: C.earth, fontWeight: "600" }}>Wellness</Text>
            </Pressable>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}
