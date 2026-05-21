import { View, Text, ScrollView, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import {
  useAuthStore,
  calculateVolumeLoad,
  calculateWorkoutStreak,
  calculateMacros,
  ACHIEVEMENT_DEFINITIONS,
} from "@repped/shared";
import { supabase } from "../../src/lib/supabase";
import { TopoBackground } from "../../src/components/terrain";
import { ProgressSkeleton } from "../../src/components/SkeletonLoader";
import {
  getWeekBounds,
  OverviewBento,
  NutritionCard,
  StreakAchievementsRow,
  WeeklySummaryCard,
} from "../../src/components/progress-v2";

// ─── Date helpers ────────────────────────────────────────────────────────────

/** "Apr 21 – 27" */
function formatWeekLabel(): string {
  const { start, end } = getWeekBounds();
  const sMonth = start.toLocaleDateString("en-US", { month: "short" });
  const eMonth = end.toLocaleDateString("en-US", { month: "short" });
  if (sMonth === eMonth) {
    return `${sMonth} ${start.getDate()} – ${end.getDate()}`;
  }
  return `${sMonth} ${start.getDate()} – ${eMonth} ${end.getDate()}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function Progress() {
  const session = useAuthStore((s) => s.session);

  // ── Loading state ──────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── Day strip ──────────────────────────────────────────────────────────────
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());

  // ── Overview (steps / calories / heart rate) ───────────────────────────────
  const [steps, setSteps] = useState(0);
  const [stepsGoal, setStepsGoal] = useState(10000);
  const [activeCalories, setActiveCalories] = useState(0);
  const [heartRate, setHeartRate] = useState(0);

  // ── Nutrition ──────────────────────────────────────────────────────────────
  const [nutritionActual, setNutritionActual] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [nutritionTargets, setNutritionTargets] = useState({ calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });

  // ── Streak ─────────────────────────────────────────────────────────────────
  const [streak, setStreak] = useState(0);

  // ── Achievements ───────────────────────────────────────────────────────────
  const [earnedCount, setEarnedCount] = useState(0);
  const [recentBadgeKeys, setRecentBadgeKeys] = useState<string[]>([]);

  // ── Weekly ─────────────────────────────────────────────────────────────────
  const [weekWorkouts, setWeekWorkouts] = useState(0);
  const [weekPlanned, setWeekPlanned] = useState(0);
  const [weekVolume, setWeekVolume] = useState(0);
  const [weekVolumeChange, setWeekVolumeChange] = useState(0);
  const [weekLabel, setWeekLabel] = useState(formatWeekLabel());
  const [bestLift, setBestLift] = useState<{ weight: number; exercise: string; isPR: boolean } | null>(null);
  const [dayDurations, setDayDurations] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => { loadAll(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA LOADING
  // ═══════════════════════════════════════════════════════════════════════════
  const loadAll = async () => {
    if (!session?.user?.id) return;
    const uid = session.user.id;
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // ── Time boundaries ──
    const { start: weekStart, end: weekEnd } = getWeekBounds();
    const weekStartISO = weekStart.toISOString();
    const weekEndISO = weekEnd.toISOString();

    // Last week boundaries for volume comparison
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(weekStart);
    lastWeekEnd.setTime(lastWeekEnd.getTime() - 1); // 1ms before this week

    // ── Profile (single) ──
    const profileRes = await (supabase as any)
      .from("profiles")
      .select("tdee, goal, weight_kg, days_per_week")
      .eq("id", uid)
      .single();

    const [
      // Workout logs this week (for day strip + durations)
      weekWorkoutLogsRes,
      // All workout logs (for streak)
      allLogsRes,
      // Achievements count
      achRes,
      // Meal logs today
      mealLogsTodayRes,
      // Last week workout logs (for volume comparison)
      lastWeekWorkoutLogsRes,
      // PRs this week
      weekPRsRes,
    ] = await Promise.all([
      (supabase as any)
        .from("workout_logs")
        .select("id, started_at, completed_at")
        .eq("user_id", uid)
        .eq("skipped", false)
        .gte("started_at", weekStartISO)
        .lte("started_at", weekEndISO),
      (supabase as any)
        .from("workout_logs")
        .select("started_at")
        .eq("user_id", uid)
        .eq("skipped", false)
        .order("started_at", { ascending: false }),
      (supabase as any)
        .from("user_achievements")
        .select("achieved_at, achievements(key)")
        .eq("user_id", uid)
        .order("achieved_at", { ascending: false }),
      (supabase as any)
        .from("meal_logs")
        .select("calories, protein_g, carbs_g, fat_g")
        .eq("user_id", uid)
        .eq("date", today),
      (supabase as any)
        .from("workout_logs")
        .select("id, started_at")
        .eq("user_id", uid)
        .eq("skipped", false)
        .gte("started_at", lastWeekStart.toISOString())
        .lt("started_at", weekStartISO),
      (supabase as any)
        .from("personal_records")
        .select("id, exercise_id")
        .eq("user_id", uid)
        .gte("achieved_at", weekStartISO),
    ]);

    // ── Day strip: map started_at to day indices ──
    const thisWeekLogs = ((weekWorkoutLogsRes.data as any[]) || []);
    const daySet = new Set<number>();
    thisWeekLogs.forEach((l: any) => {
      const d = new Date(l.started_at);
      const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
      daySet.add(dayIdx);
    });
    setCompletedDays(daySet);

    // ── Day durations for bar chart ──
    const durations = [0, 0, 0, 0, 0, 0, 0];
    thisWeekLogs.forEach((w: any) => {
      if (!w.completed_at) return;
      const d = new Date(w.started_at);
      const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
      const startMs = new Date(w.started_at).getTime();
      const endMs = new Date(w.completed_at).getTime();
      const mins = Math.round((endMs - startMs) / 60000);
      if (mins > 0 && mins < 300) {
        durations[dayIdx] += mins;
      }
    });
    setDayDurations(durations);

    // ── Streak ──
    const workoutDates = ((allLogsRes.data as any[]) || []).map((l: any) => l.started_at);
    setStreak(calculateWorkoutStreak(workoutDates));

    // ── Achievements ──
    const achRows = ((achRes.data as any[]) || []);
    setEarnedCount(achRows.length);
    // Take up to 4 most recent and resolve their image keys
    const recents: string[] = [];
    for (const row of achRows.slice(0, 4)) {
      const key = row.achievements?.key as string | undefined;
      if (!key) continue;
      const def = ACHIEVEMENT_DEFINITIONS.find((d) => d.key === key);
      if (def) recents.push(def.imageKey);
    }
    setRecentBadgeKeys(recents);

    // ── Nutrition ──
    if (profileRes.data) {
      const { tdee, goal, weight_kg } = profileRes.data as any;
      if (tdee && goal && weight_kg) {
        setNutritionTargets(calculateMacros(tdee, goal, weight_kg));
      }
    }
    const mealLogs = (mealLogsTodayRes.data as any[]) || [];
    const actual = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    mealLogs.forEach((m: any) => {
      actual.calories += m.calories || 0;
      actual.protein += m.protein_g || 0;
      actual.carbs += m.carbs_g || 0;
      actual.fat += m.fat_g || 0;
    });
    setNutritionActual(actual);

    // ── Weekly ──
    const lastWeekLogs = (lastWeekWorkoutLogsRes.data as any[]) || [];
    const planned = (profileRes.data as any)?.days_per_week ?? 0;
    setWeekWorkouts(thisWeekLogs.length);
    setWeekPlanned(planned);
    setWeekLabel(formatWeekLabel());

    // Volume: fetch set_logs via workout_log_ids
    const thisWeekIds = thisWeekLogs.map((w: any) => w.id);
    const lastWeekIds = lastWeekLogs.map((w: any) => w.id);

    const loadVolume = async (ids: string[]): Promise<number> => {
      if (ids.length === 0) return 0;
      const { data } = await (supabase as any)
        .from("set_logs")
        .select("reps, weight_kg")
        .in("workout_log_id", ids);
      return calculateVolumeLoad(
        ((data as any[]) || []).map((s: any) => ({ reps: s.reps, weight_kg: s.weight_kg }))
      );
    };

    const [thisWeekVol, lastWeekVol] = await Promise.all([
      loadVolume(thisWeekIds),
      loadVolume(lastWeekIds),
    ]);
    setWeekVolume(thisWeekVol);
    setWeekVolumeChange(
      lastWeekVol > 0
        ? Math.round(((thisWeekVol - lastWeekVol) / lastWeekVol) * 100)
        : 0
    );

    // ── Best lift this week ──
    if (thisWeekIds.length > 0) {
      const { data: setLogs } = await (supabase as any)
        .from("set_logs")
        .select("weight_kg, exercise_id, exercises(name)")
        .in("workout_log_id", thisWeekIds)
        .order("weight_kg", { ascending: false })
        .limit(1);

      const weekPRData = (weekPRsRes.data as any[]) || [];
      const prExerciseIds = new Set(weekPRData.map((pr: any) => pr.exercise_id));

      if (setLogs && setLogs.length > 0) {
        const top = setLogs[0];
        setBestLift({
          weight: Math.round(top.weight_kg),
          exercise: top.exercises?.name || "Unknown",
          isPR: prExerciseIds.has(top.exercise_id),
        });
      } else {
        setBestLift(null);
      }
    } else {
      setBestLift(null);
    }

    setLoading(false);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F8F7F4", justifyContent: "center", alignItems: "center" }}>
        <TopoBackground />
        <ProgressSkeleton />
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <View style={{ flex: 1, backgroundColor: "#F8F7F4" }}>
      <TopoBackground />

      {/* Fixed header */}
      <View style={{ paddingTop: 60, paddingBottom: 12, paddingHorizontal: 24, backgroundColor: "#F8F7F4", zIndex: 10 }}>
        <Text style={{ fontSize: 17, fontWeight: "600", color: "#1a1a1a", textAlign: "center" }}>
          Dashboard
        </Text>
      </View>
      <View style={{ height: 0.5, backgroundColor: "rgba(0,0,0,0.08)" }} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1a1a1a" />
        }
      >
        {/* Overview header */}
        <Text style={{ fontSize: 19, fontWeight: "700", color: "#1a1a1a", paddingHorizontal: 22, paddingTop: 24, paddingBottom: 10 }}>
          Overview
        </Text>

        {/* Content */}
        <View style={{ paddingHorizontal: 2, gap: 14 }}>
          <OverviewBento
            steps={steps}
            stepsGoal={stepsGoal}
            calories={activeCalories}
            heartRate={heartRate}
          />

          <NutritionCard
            calories={nutritionActual.calories}
            caloriesGoal={nutritionTargets.calories}
            protein={nutritionActual.protein}
            proteinGoal={nutritionTargets.protein_g}
            carbs={nutritionActual.carbs}
            carbsGoal={nutritionTargets.carbs_g}
            fat={nutritionActual.fat}
            fatGoal={nutritionTargets.fat_g}
            onHistoryPress={() => router.push("/(app)/meal-history" as any)}
          />

          <StreakAchievementsRow
            streak={streak}
            completedDays={completedDays}
            earnedCount={earnedCount}
            recentBadgeKeys={recentBadgeKeys}
          />

          <WeeklySummaryCard
            weekLabel={weekLabel}
            workoutsCompleted={weekWorkouts}
            workoutsPlanned={weekPlanned}
            volume={weekVolume}
            volumeChange={weekVolumeChange}
            bestLift={bestLift}
            dayDurations={dayDurations}
          />
        </View>
      </ScrollView>
    </View>
  );
}
