import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Animated,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { useAuthStore, generateWeeklySummary } from "@repped/shared";
import { supabase } from "../../src/lib/supabase";
import { TopoBackground } from "../../src/components/terrain";

// ── Palette ──────────────────────────────────────────────────────────
const C = {
  earth: "#2D2A24",
  sand: "#F6F5F0",
  trail: "#34D399",
  rock: "#8E8E7A",
  stone: "#EDEBE5",
  trailDark: "#047857",
  amber: "#92400E",
};

// ── Helpers ──────────────────────────────────────────────────────────
const getMonday = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

// ── Types ────────────────────────────────────────────────────────────
interface DayTimeline {
  dayName: string;
  date: string;
  isToday: boolean;
  isWorkout: boolean;
  focus: string;
  exercises: string[];
  prs: string[];
}

export default function WeeklySummaryScreen() {
  // ── Business logic (preserved) ───────────────────────────────────
  const session = useAuthStore((s) => s.session);
  const [summary, setSummary] = useState<any>(null);
  const [prevWeekVolume, setPrevWeekVolume] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState<DayTimeline[]>([]);

  // ── Animations ───────────────────────────────────────────────────
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.8)).current;
  const dotAnims = useRef(
    Array.from({ length: 7 }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    loadSummary();
  }, []);

  // Trigger animations after data loads
  useEffect(() => {
    if (!loading && summary) {
      // Ring entrance
      Animated.parallel([
        Animated.timing(ringOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(ringScale, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();

      // Timeline dots stagger
      Animated.stagger(
        80,
        dotAnims.map((anim) =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          })
        )
      ).start();
    }
  }, [loading, summary]);

  const getMotivationalMessage = (completionRate: number) => {
    if (completionRate >= 80) return { text: "Crushing it!", color: C.trail };
    if (completionRate >= 50)
      return { text: "Good progress!", color: "#F59E0B" };
    return { text: "Let's bounce back!", color: "#EF4444" };
  };

  const getVolumeComparison = (
    currentVolume: number,
    previousVolume: number | null
  ) => {
    if (!previousVolume || previousVolume === 0) return null;
    const pctChange = Math.round(
      ((currentVolume - previousVolume) / previousVolume) * 100
    );
    if (pctChange === 0)
      return { text: "Same volume as last week", color: "#AEAEB2" };
    const direction = pctChange > 0 ? "up" : "down";
    return {
      text: `Volume ${direction} ${Math.abs(pctChange)}% from last week`,
      color: pctChange > 0 ? C.trail : "#EF4444",
    };
  };

  const getHighlight = (s: any) => {
    if (s.personalRecords?.length > 0) {
      const best = s.personalRecords[0];
      return {
        label: "Best Lift",
        value: `${best.exerciseName} - ${best.value} kg`,
      };
    }
    if (s.workoutStreak > 1) {
      return {
        label: "Longest Streak",
        value: `${s.workoutStreak} weeks running`,
      };
    }
    if (s.totalWorkouts > 0) {
      return {
        label: "Workouts Completed",
        value: `${s.totalWorkouts} sessions this week`,
      };
    }
    return null;
  };

  const loadSummary = async () => {
    if (!session?.user?.id) return;
    const uid = session.user.id;

    // Get this week's workout logs
    const weekAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();
    const twoWeeksAgo = new Date(
      Date.now() - 14 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: workoutLogs } = await supabase
      .from("workout_logs")
      .select("id, started_at, completed_at, skipped, workout_plans(focus)")
      .eq("user_id", uid)
      .gte("started_at", weekAgo)
      .eq("skipped", false);

    // Get set logs for this week
    const logIds = ((workoutLogs as any[]) || []).map((l) => l.id);
    let setLogs: any[] = [];
    if (logIds.length > 0) {
      const { data } = await supabase
        .from("set_logs")
        .select("reps, weight_kg, workout_log_id, exercises(name)")
        .in("workout_log_id", logIds);
      setLogs = (data as any[]) || [];
    }

    // Get previous week's workout logs for volume comparison
    const { data: prevWorkoutLogs } = await supabase
      .from("workout_logs")
      .select("id")
      .eq("user_id", uid)
      .gte("started_at", twoWeeksAgo)
      .lt("started_at", weekAgo)
      .eq("skipped", false);
    const prevLogIds = ((prevWorkoutLogs as any[]) || []).map((l) => l.id);
    if (prevLogIds.length > 0) {
      const { data: prevSets } = await supabase
        .from("set_logs")
        .select("reps, weight_kg")
        .in("workout_log_id", prevLogIds);
      const prevVol = ((prevSets as any[]) || []).reduce(
        (sum: number, s: any) => sum + (s.reps || 0) * (s.weight_kg || 0),
        0
      );
      setPrevWeekVolume(prevVol);
    }

    // Get all workout dates for streak
    const { data: allLogs } = await supabase
      .from("workout_logs")
      .select("started_at")
      .eq("user_id", uid)
      .eq("skipped", false)
      .order("started_at", { ascending: false });
    const workoutDates = ((allLogs as any[]) || []).map((l) => l.started_at);

    // Get planned workouts count for this week
    const { data: plans } = await supabase
      .from("workout_plans")
      .select("id")
      .eq("user_id", uid)
      .eq("is_rest_day", false);

    // Get PRs this week
    const { data: prs } = await supabase
      .from("personal_records")
      .select("*, exercises(name)")
      .eq("user_id", uid)
      .gte("achieved_at", weekAgo);

    // Get weight entries
    const { data: weights } = await supabase
      .from("progress_entries")
      .select("weight_kg")
      .eq("user_id", uid)
      .order("date", { ascending: false })
      .limit(7);

    // Get wellness logs
    const { data: wellness } = await supabase
      .from("wellness_logs")
      .select("sleep_quality, energy_level, soreness_level")
      .eq("user_id", uid)
      .gte("date", weekAgo.split("T")[0]);

    const s = generateWeeklySummary({
      setLogs: setLogs.map((s: any) => ({
        reps: s.reps,
        weight_kg: s.weight_kg,
      })),
      workoutCount: ((workoutLogs as any[]) || []).length,
      plannedWorkouts: ((plans as any[]) || []).length,
      workoutDates,
      prs: ((prs as any[]) || []).map((p: any) => ({
        exerciseName: p.exercises?.name || "",
        value: p.value,
        type: p.record_type,
      })),
      weightEntries: ((weights as any[]) || [])
        .map((w: any) => w.weight_kg)
        .filter(Boolean),
      wellnessLogs: ((wellness as any[]) || []).map((w: any) => ({
        sleep: w.sleep_quality,
        energy: w.energy_level,
        soreness: w.soreness_level,
      })),
    });

    // ── Build timeline ──────────────────────────────────────────────
    const todayDate = new Date();
    const todayStr = todayDate.toISOString().split("T")[0];

    // Build a map: dateStr → { focus, exercises[], prs[] }
    const dayMap: Record<
      string,
      { focus: string; exercises: string[]; prs: string[] }
    > = {};

    for (const log of (workoutLogs as any[]) || []) {
      const dateStr = log.started_at
        ? new Date(log.started_at).toISOString().split("T")[0]
        : "";
      if (!dateStr) continue;
      if (!dayMap[dateStr]) {
        dayMap[dateStr] = {
          focus: log.workout_plans?.focus || "",
          exercises: [],
          prs: [],
        };
      }
    }

    // Add exercise names per day from set_logs
    for (const sl of setLogs) {
      // Find which log this set belongs to
      const parentLog = ((workoutLogs as any[]) || []).find(
        (l: any) => l.id === sl.workout_log_id
      );
      if (!parentLog) continue;
      const dateStr = new Date(parentLog.started_at)
        .toISOString()
        .split("T")[0];
      const exName = sl.exercises?.name;
      if (exName && dayMap[dateStr] && !dayMap[dateStr].exercises.includes(exName)) {
        dayMap[dateStr].exercises.push(exName);
      }
    }

    // Add PRs per day
    for (const pr of (prs as any[]) || []) {
      const dateStr = pr.achieved_at
        ? new Date(pr.achieved_at).toISOString().split("T")[0]
        : "";
      if (dateStr && dayMap[dateStr]) {
        dayMap[dateStr].prs.push(
          `${pr.exercises?.name || "Exercise"} ${pr.value} kg`
        );
      }
    }

    const monday = getMonday(todayDate);
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const builtTimeline: DayTimeline[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const entry = dayMap[dateStr];
      builtTimeline.push({
        dayName: dayNames[i],
        date: dateStr,
        isToday: dateStr === todayStr,
        isWorkout: !!entry,
        focus: entry?.focus || "",
        exercises: entry?.exercises || [],
        prs: entry?.prs || [],
      });
    }

    setTimeline(builtTimeline);
    setSummary(s);
    setLoading(false);
  };

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={C.earth} />
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: C.rock }}>No data yet</Text>
      </View>
    );
  }

  const motivation = getMotivationalMessage(summary.completionRate);
  const volumeComp = getVolumeComparison(summary.totalVolume, prevWeekVolume);
  const highlight = getHighlight(summary);

  // Date range label
  const monday = getMonday(new Date());
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  const fmt = (d: Date) =>
    d
      .toLocaleDateString("en-US", { month: "short", day: "numeric" })
      .toUpperCase();
  const dateRange = `${fmt(monday)} – ${fmt(sunday)}`;

  // Streak in days (workoutStreak is weeks, convert)
  const streakDays = summary.workoutStreak * 7;

  // ── Ring geometry ────────────────────────────────────────────────
  const RING_SIZE = 120;
  const RING_BORDER = 7;
  const completionPct = Math.min(100, summary.completionRate);

  // ── Render ───────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <TopoBackground />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* ── 1. Header ─────────────────────────────────────── */}
          <View style={styles.header}>
            <Pressable
              onPress={() => router.navigate("/(app)/progress")}
              style={styles.backBtn}
            >
              <Text style={styles.backArrow}>←</Text>
            </Pressable>
            <Text style={styles.headerTitle}>WEEKLY SUMMARY</Text>
          </View>

          {/* ── 2. Hero ───────────────────────────────────────── */}
          <Text style={styles.dateRange}>{dateRange}</Text>
          <Text style={styles.heroTitle}>This Week</Text>

          <View style={styles.heroRow}>
            {/* Ring */}
            <Animated.View
              style={[
                styles.ringContainer,
                { opacity: ringOpacity, transform: [{ scale: ringScale }] },
              ]}
            >
              {/* Track (full circle, stone) */}
              <View style={styles.ringTrack}>
                {/* Fill segments — use 4 quadrant approach */}
                {completionPct > 0 && (
                  <View style={styles.ringFillWrapper}>
                    {/* Right half (0-50%) */}
                    <View style={styles.ringHalfRight}>
                      <View
                        style={[
                          styles.ringFillHalf,
                          {
                            borderColor: C.trail,
                            transform: [
                              {
                                rotate: `${Math.min(completionPct, 50) * 3.6}deg`,
                              },
                            ],
                          },
                        ]}
                      />
                    </View>
                    {/* Left half (50-100%) */}
                    {completionPct > 50 && (
                      <View style={styles.ringHalfLeft}>
                        <View
                          style={[
                            styles.ringFillHalf,
                            {
                              borderColor: C.trail,
                              transform: [
                                {
                                  rotate: `${(completionPct - 50) * 3.6}deg`,
                                },
                              ],
                            },
                          ]}
                        />
                      </View>
                    )}
                  </View>
                )}
                {/* Center content */}
                <View style={styles.ringInner}>
                  <Text style={styles.ringPct}>{summary.completionRate}%</Text>
                  <Text style={styles.ringLabel}>COMPLETE</Text>
                </View>
              </View>
            </Animated.View>

            {/* Side stats */}
            <View style={styles.sideStats}>
              <Text style={[styles.motivationText, { color: motivation.color }]}>
                {motivation.text}
              </Text>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Volume</Text>
                <Text style={styles.statValue}>
                  {(summary.totalVolume / 1000).toFixed(1)} tons
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Workouts</Text>
                <Text style={styles.statValue}>{summary.totalWorkouts}</Text>
              </View>

              <View style={[styles.statRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.statLabel}>Streak</Text>
                <Text style={[styles.statValue, { color: C.amber }]}>
                  {streakDays > 0 ? `${streakDays} days` : "—"}
                </Text>
              </View>
            </View>
          </View>

          {/* ── 3. Timeline ───────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Your Week</Text>
          <View style={styles.timelineContainer}>
            {/* Vertical connecting line */}
            <View style={styles.timelineLine} />

            {timeline.map((day, i) => (
              <Animated.View
                key={day.date}
                style={[
                  styles.timelineDay,
                  {
                    opacity: dotAnims[i],
                    transform: [
                      {
                        translateY: dotAnims[i].interpolate({
                          inputRange: [0, 1],
                          outputRange: [8, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {/* Dot */}
                <View
                  style={[
                    styles.timelineDot,
                    day.isToday
                      ? styles.dotToday
                      : day.isWorkout
                        ? styles.dotWorkout
                        : styles.dotRest,
                  ]}
                />

                {/* Content */}
                <View style={styles.timelineContent}>
                  <View style={styles.timelineHeader}>
                    <Text
                      style={[
                        styles.timelineDayName,
                        day.isToday && { color: C.trail },
                        !day.isWorkout &&
                          !day.isToday && {
                            color: C.rock,
                            fontWeight: "500",
                          },
                      ]}
                    >
                      {day.dayName}
                    </Text>
                    {day.focus ? (
                      <Text style={styles.timelineFocus}>{day.focus}</Text>
                    ) : null}
                  </View>

                  {day.isWorkout ? (
                    <>
                      <Text style={styles.timelineExercises}>
                        {day.exercises.length > 0
                          ? day.exercises.join(", ")
                          : "Workout completed"}
                      </Text>
                      {day.prs.map((pr, j) => (
                        <View key={j} style={styles.prBadge}>
                          <Text style={styles.prText}>🏆 {pr}</Text>
                        </View>
                      ))}
                    </>
                  ) : (
                    <Text style={styles.timelineRest}>Rest day</Text>
                  )}
                </View>
              </Animated.View>
            ))}
          </View>

          {/* ── 4. Weight Change ───────────────────────────────── */}
          {summary.weightTrend !== null && (
            <View style={styles.weightRow}>
              <Text style={styles.weightLabel}>Weight Change</Text>
              <Text
                style={[
                  styles.weightValue,
                  {
                    color:
                      summary.weightTrend > 0 ? "#EF4444" : C.trail,
                  },
                ]}
              >
                {summary.weightTrend > 0 ? "+" : ""}
                {summary.weightTrend} kg
              </Text>
            </View>
          )}

          {/* ── 5. Wellness Tiles ─────────────────────────────── */}
          {(summary.avgSleep || summary.avgEnergy || summary.avgSoreness) && (
            <>
              <Text style={styles.wellnessLabel}>WELLNESS</Text>
              <View style={styles.wellnessRow}>
                {summary.avgSleep != null && (
                  <View style={[styles.wellnessTile, styles.wellnessSleep]}>
                    <Text style={[styles.wellnessValue, { color: C.trailDark }]}>
                      {summary.avgSleep}
                    </Text>
                    <Text style={styles.wellnessTileLabel}>SLEEP</Text>
                  </View>
                )}
                {summary.avgEnergy != null && (
                  <View style={[styles.wellnessTile, styles.wellnessEnergy]}>
                    <Text style={[styles.wellnessValue, { color: C.earth }]}>
                      {summary.avgEnergy}
                    </Text>
                    <Text style={styles.wellnessTileLabel}>ENERGY</Text>
                  </View>
                )}
                {summary.avgSoreness != null && (
                  <View style={[styles.wellnessTile, styles.wellnessSoreness]}>
                    <Text style={[styles.wellnessValue, { color: C.amber }]}>
                      {summary.avgSoreness}
                    </Text>
                    <Text style={styles.wellnessTileLabel}>SORENESS</Text>
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.sand,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 64,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    height: 36,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(45,42,36,0.04)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  backArrow: {
    fontSize: 18,
    color: C.earth,
  },
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 11,
    letterSpacing: 1,
    color: C.rock,
    textTransform: "uppercase",
  },

  // Hero
  dateRange: {
    fontSize: 9,
    color: C.rock,
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: C.earth,
    textAlign: "center",
    marginBottom: 20,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },

  // Ring
  ringContainer: {
    width: 120,
    height: 120,
    marginRight: 20,
  },
  ringTrack: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 7,
    borderColor: C.stone,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  ringFillWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  ringHalfRight: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "50%",
    height: "100%",
    overflow: "hidden",
  },
  ringFillHalf: {
    position: "absolute",
    top: -7,
    left: -60,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 7,
    borderColor: "transparent",
    borderTopColor: C.trail,
    borderRightColor: C.trail,
  },
  ringHalfLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "50%",
    height: "100%",
    overflow: "hidden",
  },
  ringInner: {
    alignItems: "center",
  },
  ringPct: {
    fontSize: 32,
    fontWeight: "900",
    color: C.earth,
  },
  ringLabel: {
    fontSize: 7,
    color: C.rock,
    letterSpacing: 0.5,
    marginTop: -2,
  },

  // Side stats
  sideStats: {
    flex: 1,
  },
  motivationText: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.stone,
  },
  statLabel: {
    fontSize: 13,
    color: C.rock,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "800",
    color: C.earth,
  },

  // Timeline
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: C.earth,
    marginBottom: 14,
  },
  timelineContainer: {
    paddingLeft: 32,
    marginBottom: 28,
  },
  timelineLine: {
    position: "absolute",
    left: 5,
    top: 6,
    bottom: 6,
    width: 2,
    backgroundColor: C.stone,
    borderRadius: 1,
  },
  timelineDay: {
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  timelineDot: {
    position: "absolute",
    left: -27,
    top: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  dotWorkout: {
    backgroundColor: C.earth,
    borderColor: C.earth,
  },
  dotRest: {
    backgroundColor: C.sand,
    borderColor: C.stone,
  },
  dotToday: {
    backgroundColor: C.trail,
    borderColor: C.trail,
  },
  timelineContent: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  timelineDayName: {
    fontSize: 13,
    fontWeight: "700",
    color: C.earth,
  },
  timelineFocus: {
    fontSize: 10,
    color: C.rock,
  },
  timelineExercises: {
    fontSize: 12,
    color: C.rock,
    lineHeight: 18,
  },
  timelineRest: {
    fontSize: 12,
    color: C.rock,
    opacity: 0.5,
  },
  prBadge: {
    alignSelf: "flex-start",
    marginTop: 4,
    backgroundColor: "rgba(52,211,153,0.06)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  prText: {
    fontSize: 10,
    color: C.trailDark,
  },

  // Weight Change
  weightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.stone,
    marginBottom: 24,
  },
  weightLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: C.earth,
  },
  weightValue: {
    fontSize: 16,
    fontWeight: "800",
    color: C.trail,
  },

  // Wellness
  wellnessLabel: {
    fontSize: 10,
    color: C.rock,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  wellnessRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  wellnessTile: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  wellnessSleep: {
    backgroundColor: "rgba(52,211,153,0.04)",
  },
  wellnessEnergy: {
    backgroundColor: C.stone,
  },
  wellnessSoreness: {
    backgroundColor: "rgba(245,158,11,0.04)",
  },
  wellnessValue: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  wellnessTileLabel: {
    fontSize: 8,
    color: C.rock,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
