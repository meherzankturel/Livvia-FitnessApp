import { View, Text, ScrollView, RefreshControl } from "react-native";
import { useEffect, useState, useCallback } from "react";
import {
  useAuthStore,
  calculateVolumeLoad,
  calculateWorkoutStreak,
  ACHIEVEMENT_DEFINITIONS,
  calculateMacros,
} from "@repped/shared";
import { supabase } from "../../src/lib/supabase";
import { TopoBackground } from "../../src/components/terrain";
import { ProgressSkeleton } from "../../src/components/SkeletonLoader";
import {
  DayStrip,
  getTodayIndex,
  getWeekBounds,
  OverviewBento,
  NutritionCard,
  StreakAchievementsRow,
  WeeklySummaryCard,
  MonthlySummaryCard,
  RecoveryCard,
} from "../../src/components/progress-v2";

// ─── Icon emoji mapping ─────────────────────────────────────────────────────
const ICON_EMOJI: Record<string, string> = {
  target: "🎯", dumbbell: "🏋️", trophy: "🏆", crown: "👑", star: "⭐",
  flame: "🔥", calendar: "📅", chart: "📈", scale: "⚖️", ruler: "📏",
  check: "✅", heart: "❤️", leaf: "🌿", weight: "🏋️", medal: "🏅",
  lightning: "⚡", sun: "☀️", moon: "🌙", shield: "🛡️", share: "📤",
};

// ─── Date helpers ────────────────────────────────────────────────────────────

/** "24 Apr 2026" */
function formatDateLabel(): string {
  const now = new Date();
  return now.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

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
  const [selectedDay, setSelectedDay] = useState(getTodayIndex());
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());

  // ── Nutrition ──────────────────────────────────────────────────────────────
  const [nutritionActual, setNutritionActual] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [nutritionTargets, setNutritionTargets] = useState({ calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });

  // ── Streak ─────────────────────────────────────────────────────────────────
  const [streak, setStreak] = useState(0);
  const [streakBest, setStreakBest] = useState(0);

  // ── Achievements ───────────────────────────────────────────────────────────
  const [earnedCount, setEarnedCount] = useState(0);
  const [totalAchievements] = useState(ACHIEVEMENT_DEFINITIONS.length);
  const [recentEarnedEmojis, setRecentEarnedEmojis] = useState<string[]>([]);

  // ── Weekly ─────────────────────────────────────────────────────────────────
  const [weekWorkouts, setWeekWorkouts] = useState(0);
  const [weekPlanned, setWeekPlanned] = useState(0);
  const [weekVolume, setWeekVolume] = useState(0);
  const [weekVolumeChange, setWeekVolumeChange] = useState(0);
  const [weekAvgDuration, setWeekAvgDuration] = useState(0);
  const [weekPRs, setWeekPRs] = useState(0);
  const [weekLabel, setWeekLabel] = useState(formatWeekLabel());

  // ── Monthly ────────────────────────────────────────────────────────────────
  const [monthWorkouts, setMonthWorkouts] = useState(0);
  const [monthWorkoutsChange, setMonthWorkoutsChange] = useState(0);
  const [monthVolume, setMonthVolume] = useState(0);
  const [monthVolumeChange, setMonthVolumeChange] = useState(0);
  const [monthAvgDuration, setMonthAvgDuration] = useState(0);
  const [monthPRs, setMonthPRs] = useState(0);
  const [monthCompletionRate, setMonthCompletionRate] = useState(0);
  const [monthLabel, setMonthLabel] = useState("");

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
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

    // ── Parallel queries ──
    // Profile query separately (single() breaks Promise.all type inference)
    const profileRes = await (supabase as any)
      .from("profiles")
      .select("tdee, goal, weight_kg")
      .eq("id", uid)
      .single();

    const [
      // Day strip: workout_logs this week
      weekDayLogsRes,
      // Streak: all workout_logs ordered desc
      allLogsRes,
      // Achievements
      achRes,
      // Meal logs today
      mealLogsTodayRes,
      // Weekly: workout_logs this week (with completed_at for duration)
      weekWorkoutLogsRes,
      // Weekly: workout_logs last week (for volume comparison)
      lastWeekWorkoutLogsRes,
      // Plans (for planned count)
      plansRes,
      // PRs this week
      weekPRsRes,
      // Monthly: this month workouts
      monthWorkoutsRes,
      // Monthly: last month workouts
      lastMonthWorkoutsRes,
      // PRs this month
      monthPRsRes,
    ] = await Promise.all([
      supabase
        .from("workout_logs")
        .select("started_at")
        .eq("user_id", uid)
        .eq("skipped", false)
        .gte("started_at", weekStart.toISOString())
        .lte("started_at", weekEnd.toISOString()),
      supabase
        .from("workout_logs")
        .select("started_at")
        .eq("user_id", uid)
        .eq("skipped", false)
        .order("started_at", { ascending: false }),
      supabase
        .from("user_achievements")
        .select("*, achievements(key)")
        .eq("user_id", uid),
      supabase
        .from("meal_logs")
        .select("calories, protein_g, carbs_g, fat_g")
        .eq("user_id", uid)
        .eq("date", today),
      supabase
        .from("workout_logs")
        .select("id, started_at, completed_at")
        .eq("user_id", uid)
        .eq("skipped", false)
        .gte("started_at", weekAgo),
      supabase
        .from("workout_logs")
        .select("id, started_at")
        .eq("user_id", uid)
        .eq("skipped", false)
        .gte("started_at", twoWeeksAgo)
        .lt("started_at", weekAgo),
      supabase
        .from("workout_plans")
        .select("id")
        .eq("user_id", uid)
        .eq("is_rest_day", false),
      supabase
        .from("personal_records")
        .select("id")
        .eq("user_id", uid)
        .gte("achieved_at", weekAgo),
      supabase
        .from("workout_logs")
        .select("id, started_at, completed_at")
        .eq("user_id", uid)
        .eq("skipped", false)
        .gte("started_at", monthStart),
      supabase
        .from("workout_logs")
        .select("id, started_at, completed_at")
        .eq("user_id", uid)
        .eq("skipped", false)
        .gte("started_at", lastMonthStart)
        .lte("started_at", lastMonthEnd),
      supabase
        .from("personal_records")
        .select("id")
        .eq("user_id", uid)
        .gte("achieved_at", monthStart),
    ]);

    // ── Day strip: map started_at to day indices ──
    const daySet = new Set<number>();
    ((weekDayLogsRes.data as any[]) || []).forEach((l) => {
      const d = new Date(l.started_at);
      const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1; // 0=Mon … 6=Sun
      daySet.add(dayIdx);
    });
    setCompletedDays(daySet);

    // ── Streak ──
    const workoutDates = ((allLogsRes.data as any[]) || []).map((l) => l.started_at);
    const currentStreak = calculateWorkoutStreak(workoutDates);
    setStreak(currentStreak);
    setStreakBest(Math.max(currentStreak, currentStreak)); // simple: best = current for now

    // ── Achievements ──
    const achData = (achRes.data as any[]) || [];
    const earnedKeys = achData.map((a) => a.achievements?.key).filter(Boolean) as string[];
    setEarnedCount(earnedKeys.length);
    // Last 3 earned → map to emoji
    const recentKeys = earnedKeys.slice(-3);
    const emojis = recentKeys.map((key) => {
      const def = ACHIEVEMENT_DEFINITIONS.find((d) => d.key === key);
      return def ? (ICON_EMOJI[def.icon] || "🏆") : "🏆";
    });
    setRecentEarnedEmojis(emojis);

    // ── Nutrition ──
    if (profileRes.data) {
      const { tdee, goal, weight_kg } = profileRes.data as any;
      if (tdee && goal && weight_kg) {
        const targets = calculateMacros(tdee, goal, weight_kg);
        setNutritionTargets(targets);
      }
    }
    const mealLogs = (mealLogsTodayRes.data as any[]) || [];
    const actual = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    mealLogs.forEach((m) => {
      actual.calories += m.calories || 0;
      actual.protein += m.protein_g || 0;
      actual.carbs += m.carbs_g || 0;
      actual.fat += m.fat_g || 0;
    });
    setNutritionActual(actual);

    // ── Weekly ──
    const thisWeekLogs = (weekWorkoutLogsRes.data as any[]) || [];
    const lastWeekLogs = (lastWeekWorkoutLogsRes.data as any[]) || [];
    const planned = ((plansRes.data as any[]) || []).length;
    setWeekWorkouts(thisWeekLogs.length);
    setWeekPlanned(planned);
    setWeekLabel(formatWeekLabel());

    // Volume: fetch set_logs via workout_log_ids
    const thisWeekIds = thisWeekLogs.map((w) => w.id);
    const lastWeekIds = lastWeekLogs.map((w) => w.id);

    const loadVolume = async (ids: string[]): Promise<number> => {
      if (ids.length === 0) return 0;
      const { data } = await supabase
        .from("set_logs")
        .select("reps, weight_kg")
        .in("workout_log_id", ids);
      return calculateVolumeLoad(
        ((data as any[]) || []).map((s) => ({ reps: s.reps, weight_kg: s.weight_kg }))
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

    // Week PRs
    setWeekPRs(((weekPRsRes.data as any[]) || []).length);

    // Week avg duration
    const weekDurations = thisWeekLogs
      .filter((w) => w.completed_at)
      .map((w) => {
        const s = new Date(w.started_at).getTime();
        const e = new Date(w.completed_at).getTime();
        return Math.round((e - s) / 60000);
      })
      .filter((d) => d > 0 && d < 300);
    setWeekAvgDuration(
      weekDurations.length > 0
        ? Math.round(weekDurations.reduce((a, b) => a + b, 0) / weekDurations.length)
        : 0
    );

    // ── Monthly ──
    const thisMonthLogs = (monthWorkoutsRes.data as any[]) || [];
    const lastMonthLogs = (lastMonthWorkoutsRes.data as any[]) || [];
    setMonthWorkouts(thisMonthLogs.length);
    setMonthWorkoutsChange(thisMonthLogs.length - lastMonthLogs.length);
    setMonthLabel(now.toLocaleDateString("en-US", { month: "long" }));

    // Monthly PRs
    setMonthPRs(((monthPRsRes.data as any[]) || []).length);

    // Monthly volume
    const thisMonthIds = thisMonthLogs.map((w: any) => w.id);
    const lastMonthIds = lastMonthLogs.map((w: any) => w.id);
    const [thisMonthVol, lastMonthVol] = await Promise.all([
      loadVolume(thisMonthIds),
      loadVolume(lastMonthIds),
    ]);
    setMonthVolume(thisMonthVol);
    setMonthVolumeChange(
      lastMonthVol > 0
        ? Math.round(((thisMonthVol - lastMonthVol) / lastMonthVol) * 100)
        : 0
    );

    // Monthly avg duration
    const monthDurations = thisMonthLogs
      .filter((w: any) => w.completed_at)
      .map((w: any) => {
        const s = new Date(w.started_at).getTime();
        const e = new Date(w.completed_at).getTime();
        return Math.round((e - s) / 60000);
      })
      .filter((d: number) => d > 0 && d < 300);
    setMonthAvgDuration(
      monthDurations.length > 0
        ? Math.round(monthDurations.reduce((a: number, b: number) => a + b, 0) / monthDurations.length)
        : 0
    );

    // Monthly completion rate
    if (planned > 0) {
      const dayOfMonth = now.getDate();
      const expectedWorkouts = Math.round((planned / 7) * dayOfMonth);
      setMonthCompletionRate(
        expectedWorkouts > 0
          ? Math.min(thisMonthLogs.length / expectedWorkouts, 1)
          : 0
      );
    } else {
      setMonthCompletionRate(0);
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
        {/* Date row */}
        <View style={{ paddingTop: 16, paddingBottom: 12, paddingHorizontal: 22, flexDirection: "row" }}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#2DB877" }}>Today, </Text>
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#1a1a1a" }}>{formatDateLabel()}</Text>
        </View>

        {/* Day strip */}
        <DayStrip
          completedDays={completedDays}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
        />

        {/* Content with horizontal padding */}
        <View style={{ paddingHorizontal: 2, gap: 14, marginTop: 14 }}>
          <OverviewBento
            steps={7235}
            stepsGoal={10000}
            calories={325}
            heartRate={73}
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
          />

          <StreakAchievementsRow
            streak={streak}
            streakBest={streakBest}
            completedDays={completedDays}
            earnedCount={earnedCount}
            totalAchievements={totalAchievements}
            recentEarnedEmojis={recentEarnedEmojis}
          />

          <WeeklySummaryCard
            weekLabel={weekLabel}
            workoutsCompleted={weekWorkouts}
            workoutsPlanned={weekPlanned}
            volume={weekVolume}
            volumeChange={weekVolumeChange}
            avgDuration={weekAvgDuration}
            prs={weekPRs}
          />

          <MonthlySummaryCard
            monthLabel={monthLabel}
            workouts={monthWorkouts}
            workoutsChange={monthWorkoutsChange}
            volume={monthVolume}
            volumeChange={monthVolumeChange}
            avgDuration={monthAvgDuration}
            prs={monthPRs}
            completionRate={monthCompletionRate}
          />

          <RecoveryCard />
        </View>
      </ScrollView>
    </View>
  );
}
