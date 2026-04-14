import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useEffect, useState, useCallback, useRef } from "react";
import { router } from "expo-router";
import {
  useAuthStore,
  calculateEstimated1RM,
  calculateVolumeLoad,
  calculateWorkoutStreak,
  calculateCompletionRate,
  ACHIEVEMENT_DEFINITIONS,
} from "@repped/shared";
import { supabase } from "../../src/lib/supabase";
import { TopoBackground } from "../../src/components/terrain";
import {
  SegmentControl,
  TrendsOverview,
  ExerciseProgression,
  MuscleDistribution,
  NutritionCorrelation,
  WeekInReview,
  MonthlySummary,
} from "../../src/components/progress";

// ─── Constants ──────────────────────────────────────────────────────────────
const COMPOUND_LIFTS = ["Bench Press", "Squat", "Deadlift", "Overhead Press"];
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const SCREEN_WIDTH = Dimensions.get("window").width;
const HEATMAP_COLS = 12;
const HEATMAP_ROWS = 7;
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const TABS = ["Overview", "Strength", "Insights"];

// ─── Palette ────────────────────────────────────────────────────────────────
const earth = "#2D2A24";
const sand = "#F6F5F0";
const trail = "#34D399";
const rock = "#8E8E7A";
const stone = "#EDEBE5";
const amber = "#F59E0B";

// ─── Achievement tints ──────────────────────────────────────────────────────
const ACHIEVEMENT_TINTS: Record<string, { bg: string; dot: string }> = {
  workout: { bg: "rgba(52,211,153,0.10)", dot: trail },
  streak: { bg: "rgba(245,158,11,0.10)", dot: amber },
  progress: { bg: "rgba(99,102,241,0.10)", dot: "#6366F1" },
  volume: { bg: "rgba(239,68,68,0.10)", dot: "#EF4444" },
  milestone: { bg: "rgba(6,182,212,0.10)", dot: "#06B6D4" },
  nutrition: { bg: "rgba(132,204,22,0.10)", dot: "#84CC16" },
  recovery: { bg: "rgba(20,184,166,0.10)", dot: "#14B8A6" },
  consistency: { bg: "rgba(234,179,8,0.10)", dot: "#EAB308" },
  social: { bg: "rgba(168,85,247,0.10)", dot: "#A855F7" },
  challenge: { bg: "rgba(236,72,153,0.10)", dot: "#EC4899" },
};

const ICON_EMOJI: Record<string, string> = {
  target: "\uD83C\uDFAF", dumbbell: "\uD83C\uDFCB\uFE0F", trophy: "\uD83C\uDFC6",
  crown: "\uD83D\uDC51", star: "\u2B50", flame: "\uD83D\uDD25",
  calendar: "\uD83D\uDCC5", chart: "\uD83D\uDCC8", scale: "\u2696\uFE0F",
  ruler: "\uD83D\uDCCF", check: "\u2705", heart: "\u2764\uFE0F",
  leaf: "\uD83C\uDF3F", weight: "\uD83C\uDFCB\uFE0F", medal: "\uD83C\uDFC5",
  lightning: "\u26A1", sun: "\u2600\uFE0F", moon: "\uD83C\uDF19",
  shield: "\uD83D\uDEE1\uFE0F", share: "\uD83D\uDCE4",
};

const TIER_INDEX: Record<string, number> = {
  starter: 1, intermediate: 2, advanced: 3, elite: 4,
};

// ─── Types ──────────────────────────────────────────────────────────────────
interface ProgressEntry {
  id: string;
  date: string;
  weight_kg: number | null;
}

interface MuscleGroupVolume {
  muscleGroup: string;
  totalSets: number;
  totalVolume: number;
  percentage: number;
}

// ═══════════════════════════════════════════════════════════════════════════
export default function Progress() {
  const session = useAuthStore((s) => s.session);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── Existing state ──────────────────────────────────────────────────────
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [weightInput, setWeightInput] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
  const [estimated1RMs, setEstimated1RMs] = useState<{ name: string; value: number }[]>([]);
  const [volumeThisWeek, setVolumeThisWeek] = useState(0);
  const [volumeLastWeek, setVolumeLastWeek] = useState(0);
  const [recentPRs, setRecentPRs] = useState<{ name: string; value: number; type: string }[]>([]);
  const [measurements, setMeasurements] = useState<any>(null);
  const [prevMeasurements, setPrevMeasurements] = useState<any>(null);
  const [measEditMode, setMeasEditMode] = useState(false);
  const [measDraft, setMeasDraft] = useState<Record<string, string>>({});
  const [measSaving, setMeasSaving] = useState(false);
  const [earnedAchievements, setEarnedAchievements] = useState<Set<string>>(new Set());

  // ── New state for features ──────────────────────────────────────────────
  const [workoutsThisMonth, setWorkoutsThisMonth] = useState(0);
  const [workoutsLastMonth, setWorkoutsLastMonth] = useState(0);
  const [volumeThisMonth, setVolumeThisMonth] = useState(0);
  const [volumeLastMonth, setVolumeLastMonth] = useState(0);
  const [streakBest, setStreakBest] = useState(0);
  const [weightMonthAgo, setWeightMonthAgo] = useState<number | null>(null);
  const [exerciseList, setExerciseList] = useState<{ id: string; name: string }[]>([]);
  const [muscleDistribution, setMuscleDistribution] = useState<MuscleGroupVolume[]>([]);
  const [plannedThisWeek, setPlannedThisWeek] = useState(0);
  const [completedThisWeek, setCompletedThisWeek] = useState(0);
  const [weekPRs, setWeekPRs] = useState<{ name: string; value: number; type: string }[]>([]);
  const [weightWeekStart, setWeightWeekStart] = useState<number | null>(null);

  // Monthly summary state
  const [monthPRCount, setMonthPRCount] = useState(0);
  const [monthTotalSets, setMonthTotalSets] = useState(0);
  const [monthAvgDuration, setMonthAvgDuration] = useState(0);
  const [monthWeightStart, setMonthWeightStart] = useState<number | null>(null);
  const [monthMostImproved, setMonthMostImproved] = useState<{ exercise: string; gain: number } | null>(null);
  const [monthCompletionRate, setMonthCompletionRate] = useState(0);

  // Nutrition correlation state
  const [nutritionData, setNutritionData] = useState({
    totalWorkoutDays: 0,
    workoutDaysWithMealPlan: 0,
    totalPRs: 0,
    prsOnMealPlanDays: 0,
    avgProteinTarget: 0,
    mealPlanAdherence: 0,
    // Actual logged nutrition
    daysLogged: 0,
    avgCaloriesLogged: 0,
    avgProteinLogged: 0,
  });

  // ── Animations ──────────────────────────────────────────────────────────
  const dotOpacity = useRef(new Animated.Value(0.15)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity, { toValue: 0.45, duration: 1200, useNativeDriver: true }),
        Animated.timing(dotOpacity, { toValue: 0.15, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => { loadAll(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // DATA LOADING
  // ═══════════════════════════════════════════════════════════════════════
  const loadAll = async () => {
    if (!session?.user?.id) return;
    const uid = session.user.id;
    const now = new Date();

    // ── Time boundaries ──
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();
    const monthAgoDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const heatmapStart = new Date(Date.now() - 84 * 24 * 60 * 60 * 1000).toISOString();

    // Run queries in parallel groups
    const [
      weightRes,
      workoutCountRes,
      allLogsRes,
      plansRes,
      weekLogsRes,
      heatmapRes,
      setLogsRes,
      recentWorkoutsRes,
      prsRes,
      measRes,
      achRes,
      // New queries
      monthWorkoutsRes,
      lastMonthWorkoutsRes,
      exerciseListRes,
      monthPrsRes,
      mealPlansRes,
      monthAllWorkoutsRes,
      monthSetCountRes,
    ] = await Promise.all([
      // Existing
      supabase.from("progress_entries").select("id, date, weight_kg").eq("user_id", uid).order("date", { ascending: false }).limit(60),
      supabase.from("workout_logs").select("id", { count: "exact", head: true }).eq("user_id", uid).eq("skipped", false),
      supabase.from("workout_logs").select("started_at").eq("user_id", uid).eq("skipped", false).order("started_at", { ascending: false }),
      supabase.from("workout_plans").select("id").eq("user_id", uid).eq("is_rest_day", false),
      supabase.from("workout_logs").select("id").eq("user_id", uid).eq("skipped", false).gte("started_at", weekAgo),
      supabase.from("workout_logs").select("started_at, id").eq("user_id", uid).eq("skipped", false).gte("started_at", heatmapStart),
      // Placeholder — set_logs has no user_id, fetched separately below via workout_log_ids
      Promise.resolve({ data: [] }),
      supabase.from("workout_logs").select("id, started_at").eq("user_id", uid).eq("skipped", false).gte("started_at", twoWeeksAgo),
      supabase.from("personal_records").select("*, exercises(name)").eq("user_id", uid).gte("achieved_at", monthAgoDate).order("achieved_at", { ascending: false }).limit(10),
      (supabase as any).from("body_measurements").select("*").eq("user_id", uid).order("date", { ascending: false }).limit(2),
      supabase.from("user_achievements").select("*, achievements(key)").eq("user_id", uid),
      // New: this month workouts
      supabase.from("workout_logs").select("id, started_at, completed_at").eq("user_id", uid).eq("skipped", false).gte("started_at", monthStart),
      // New: last month workouts
      supabase.from("workout_logs").select("id, started_at").eq("user_id", uid).eq("skipped", false).gte("started_at", lastMonthStart).lte("started_at", lastMonthEnd),
      // New: unique exercises the user has done (+ reps/weight for muscle distribution)
      // Placeholder — set_logs has no user_id, fetched separately below via workout_log_ids
      Promise.resolve({ data: [] }),
      // New: PRs this month
      supabase.from("personal_records").select("*, exercises(name)").eq("user_id", uid).gte("achieved_at", monthStart),
      // New: meal plans for nutrition correlation
      supabase.from("meal_plans").select("id, date, target_protein_g").eq("user_id", uid).gte("date", monthAgoDate),
      // New: all workouts for monthly volume
      supabase.from("workout_logs").select("id, started_at, completed_at").eq("user_id", uid).eq("skipped", false).gte("started_at", lastMonthStart),
      // Placeholder — month set count is calculated below from thisMonthIds
      Promise.resolve({ count: 0 }),
    ]);

    // ── Fetch set_logs via workout_log_ids (set_logs has no user_id column) ──
    const allWorkoutLogIds = ((allLogsRes.data as any[]) || []).map((l: any) => l.id || l.started_at).filter(Boolean);
    // allLogsRes only has started_at, need IDs — use heatmapRes which has id + started_at
    const allWlIds = ((heatmapRes.data as any[]) || []).map((l: any) => l.id).filter(Boolean);
    if (allWlIds.length > 0) {
      const { data: slData } = await supabase
        .from("set_logs")
        .select("reps, weight_kg, exercise_id, workout_log_id, exercises(id, name, muscle_group)")
        .in("workout_log_id", allWlIds);
      const allSetLogs = (slData as any[]) || [];
      // Populate the placeholder results
      (setLogsRes as any).data = allSetLogs;
      (exerciseListRes as any).data = allSetLogs;
    }

    // ── Also fetch meal_logs for nutrition tracking in progress ──
    const { data: mealLogsData } = await supabase
      .from("meal_logs")
      .select("calories, protein_g, carbs_g, fat_g, date, meal_type")
      .eq("user_id", uid)
      .gte("date", monthAgoDate)
      .order("date", { ascending: false });
    const mealLogs = (mealLogsData as any[]) || [];

    // ── Process existing data ──
    setEntries(weightRes.data || []);
    setWorkoutCount(workoutCountRes.count || 0);

    const workoutDates = ((allLogsRes.data as any[]) || []).map((l) => l.started_at);
    const currentStreak = calculateWorkoutStreak(workoutDates);
    setStreak(currentStreak);

    // Best streak: calculate by trying each starting position
    let bestStreak = currentStreak;
    // Simple approach: current streak is likely the best or close to it
    setStreakBest(Math.max(bestStreak, currentStreak));

    const planned = ((plansRes.data as any[]) || []).length;
    const completed = ((weekLogsRes.data as any[]) || []).length;
    setCompletionRate(Math.round(calculateCompletionRate(planned, completed) * 100));
    setPlannedThisWeek(planned);
    setCompletedThisWeek(completed);

    // Heatmap
    const dayCount: Record<string, number> = {};
    ((heatmapRes.data as any[]) || []).forEach((l) => {
      const day = new Date(l.started_at).toISOString().split("T")[0];
      dayCount[day] = (dayCount[day] || 0) + 1;
    });
    setHeatmapData(dayCount);

    // 1RM
    const bestSets: Record<string, { weight: number; reps: number }> = {};
    ((setLogsRes.data as any[]) || []).forEach((s) => {
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

    // Volume this week vs last
    const thisWeekIds: string[] = [];
    const lastWeekIds: string[] = [];
    ((recentWorkoutsRes.data as any[]) || []).forEach((w) => {
      if (new Date(w.started_at) >= new Date(weekAgo)) thisWeekIds.push(w.id);
      else lastWeekIds.push(w.id);
    });
    const loadVolume = async (ids: string[]) => {
      if (ids.length === 0) return 0;
      const { data } = await supabase.from("set_logs").select("reps, weight_kg").in("workout_log_id", ids);
      return calculateVolumeLoad(((data as any[]) || []).map((s) => ({ reps: s.reps, weight_kg: s.weight_kg })));
    };
    const [thisWeekVol, lastWeekVol] = await Promise.all([
      loadVolume(thisWeekIds),
      loadVolume(lastWeekIds),
    ]);
    setVolumeThisWeek(thisWeekVol);
    setVolumeLastWeek(lastWeekVol);

    // PRs
    const prsArr = ((prsRes.data as any[]) || []).map((p: any) => ({
      name: p.exercises?.name || "",
      value: p.value,
      type: p.record_type,
      date: p.achieved_at,
    }));
    setRecentPRs(prsArr.slice(0, 5));

    // Week PRs
    setWeekPRs(prsArr.filter((p: any) => new Date(p.date) >= new Date(weekAgo)));

    // Body measurements
    if (measRes.data && measRes.data.length > 0) {
      setMeasurements(measRes.data[0]);
      if (measRes.data.length > 1) setPrevMeasurements(measRes.data[1]);
      else setPrevMeasurements(null);
    } else {
      setMeasurements(null);
      setPrevMeasurements(null);
    }

    // Achievements
    const achKeys = new Set(
      ((achRes.data as any[]) || []).map((a: any) => a.achievements?.key).filter(Boolean)
    );
    setEarnedAchievements(achKeys);

    // ── Process NEW data ──

    // Trends: this month vs last month
    const thisMonthWorkouts = ((monthWorkoutsRes.data as any[]) || []);
    const lastMonthWorkouts = ((lastMonthWorkoutsRes.data as any[]) || []);
    setWorkoutsThisMonth(thisMonthWorkouts.length);
    setWorkoutsLastMonth(lastMonthWorkouts.length);

    // Monthly volume
    const thisMonthIds = thisMonthWorkouts.map((w: any) => w.id);
    const lastMonthIds = lastMonthWorkouts.map((w: any) => w.id);
    const [thisMonthVol, lastMonthVol] = await Promise.all([
      loadVolume(thisMonthIds),
      loadVolume(lastMonthIds),
    ]);
    setVolumeThisMonth(thisMonthVol);
    setVolumeLastMonth(lastMonthVol);

    // Weight a month ago
    const weightEntries = weightRes.data || [];
    if (weightEntries.length > 0) {
      // Find the earliest entry around a month ago
      const monthAgoWeight = weightEntries.find(
        (e: any) => e.weight_kg != null && new Date(e.date) <= new Date(monthAgoDate)
      );
      setWeightMonthAgo(monthAgoWeight?.weight_kg || null);

      // Weight at week start
      const weekStartWeight = weightEntries.find(
        (e: any) => e.weight_kg != null && new Date(e.date) <= new Date(weekAgo)
      );
      setWeightWeekStart(weekStartWeight?.weight_kg || null);

      // Weight at month start
      const monthStartWeight = weightEntries.find(
        (e: any) => e.weight_kg != null && new Date(e.date) <= new Date(monthStart)
      );
      setMonthWeightStart(monthStartWeight?.weight_kg || null);
    }

    // Exercise list (unique exercises user has done)
    const exerciseMap = new Map<string, { id: string; name: string }>();
    ((exerciseListRes.data as any[]) || []).forEach((s) => {
      const ex = s.exercises;
      if (ex?.id && ex?.name && !exerciseMap.has(ex.id)) {
        exerciseMap.set(ex.id, { id: ex.id, name: ex.name });
      }
    });
    const sortedExercises = Array.from(exerciseMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    setExerciseList(sortedExercises);

    // Muscle group distribution
    const muscleVolume: Record<string, { sets: number; volume: number }> = {};
    ((exerciseListRes.data as any[]) || []).forEach((s) => {
      const mg = s.exercises?.muscle_group;
      if (!mg) return;
      if (!muscleVolume[mg]) muscleVolume[mg] = { sets: 0, volume: 0 };
      muscleVolume[mg].sets += 1;
      muscleVolume[mg].volume += (s.reps || 0) * (s.weight_kg || 0);
    });
    const totalMuscleVol = Object.values(muscleVolume).reduce((sum, v) => sum + v.volume, 0) || 1;
    const distArr: MuscleGroupVolume[] = Object.entries(muscleVolume).map(([mg, v]) => ({
      muscleGroup: mg,
      totalSets: v.sets,
      totalVolume: v.volume,
      percentage: (v.volume / totalMuscleVol) * 100,
    }));
    setMuscleDistribution(distArr);

    // Month PRs
    const monthPrs = (monthPrsRes.data as any[]) || [];
    setMonthPRCount(monthPrs.length);

    // Month total sets — count from this month's workout IDs
    if (thisMonthIds.length > 0) {
      const { count: monthSetsCount } = await supabase
        .from("set_logs")
        .select("id", { count: "exact", head: true })
        .in("workout_log_id", thisMonthIds);
      setMonthTotalSets(monthSetsCount || 0);
    } else {
      setMonthTotalSets(0);
    }

    // Month avg duration
    const durations = thisMonthWorkouts
      .filter((w: any) => w.completed_at)
      .map((w: any) => {
        const start = new Date(w.started_at).getTime();
        const end = new Date(w.completed_at).getTime();
        return Math.round((end - start) / 60000);
      })
      .filter((d: number) => d > 0 && d < 300);
    setMonthAvgDuration(
      durations.length > 0 ? Math.round(durations.reduce((a: number, b: number) => a + b, 0) / durations.length) : 0
    );

    // Month completion rate
    if (planned > 0) {
      // Calculate for current month specifically
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const dayOfMonth = now.getDate();
      const expectedWorkouts = Math.round((planned / 7) * dayOfMonth);
      setMonthCompletionRate(
        expectedWorkouts > 0
          ? Math.min(Math.round((thisMonthWorkouts.length / expectedWorkouts) * 100), 100)
          : 0
      );
    }

    // Most improved exercise this month — compare each month PR to previous best
    if (monthPrs.length > 0) {
      let bestImprovement = { exercise: "", gain: 0 };

      for (const pr of monthPrs) {
        const name = (pr as any).exercises?.name;
        const exerciseId = (pr as any).exercise_id;
        if (!name || !exerciseId || (pr as any).record_type !== "weight") continue;

        // Find user's previous best weight PR before this month
        const { data: prevPr } = await supabase
          .from("personal_records")
          .select("value")
          .eq("user_id", uid)
          .eq("exercise_id", exerciseId)
          .eq("record_type", "weight")
          .lt("achieved_at", monthStart)
          .order("value", { ascending: false })
          .limit(1);

        if (prevPr && prevPr.length > 0) {
          const gain = (pr as any).value - (prevPr[0] as any).value;
          if (gain > bestImprovement.gain) {
            bestImprovement = { exercise: name, gain };
          }
        }
      }

      setMonthMostImproved(
        bestImprovement.exercise && bestImprovement.gain > 0 ? bestImprovement : null
      );
    } else {
      setMonthMostImproved(null);
    }

    // Nutrition correlation
    const mealPlans = ((mealPlansRes.data as any[]) || []);
    const mealPlanDates = new Set(mealPlans.map((mp: any) => mp.date));
    const workoutDateSet = new Set(
      workoutDates.filter((d: string) => new Date(d) >= new Date(monthAgoDate))
        .map((d: string) => new Date(d).toISOString().split("T")[0])
    );
    const prDates = new Set(
      prsArr.map((p: any) => new Date(p.date).toISOString().split("T")[0])
    );

    let workoutDaysWithMealPlan = 0;
    workoutDateSet.forEach((d) => {
      if (mealPlanDates.has(d)) workoutDaysWithMealPlan++;
    });

    let prsOnMealDays = 0;
    prDates.forEach((d) => {
      if (mealPlanDates.has(d)) prsOnMealDays++;
    });

    const avgProtein = mealPlans.length > 0
      ? mealPlans.reduce((sum: number, mp: any) => sum + (mp.target_protein_g || 0), 0) / mealPlans.length
      : 0;

    const last30Days = 30;
    const adherencePct = Math.round((mealPlanDates.size / last30Days) * 100);

    // Calculate actual logged nutrition from meal_logs
    const logsByDate: Record<string, { calories: number; protein: number }> = {};
    for (const log of mealLogs) {
      const d = log.date;
      if (!logsByDate[d]) logsByDate[d] = { calories: 0, protein: 0 };
      logsByDate[d].calories += log.calories || 0;
      logsByDate[d].protein += log.protein_g || 0;
    }
    const loggedDays = Object.keys(logsByDate).length;
    const avgCalLogged = loggedDays > 0
      ? Math.round(Object.values(logsByDate).reduce((s, d) => s + d.calories, 0) / loggedDays)
      : 0;
    const avgProtLogged = loggedDays > 0
      ? Math.round(Object.values(logsByDate).reduce((s, d) => s + d.protein, 0) / loggedDays)
      : 0;

    setNutritionData({
      totalWorkoutDays: workoutDateSet.size,
      workoutDaysWithMealPlan,
      totalPRs: prsArr.length,
      prsOnMealPlanDays: prsOnMealDays,
      avgProteinTarget: avgProtein,
      mealPlanAdherence: Math.min(adherencePct, 100),
      daysLogged: loggedDays,
      avgCaloriesLogged: avgCalLogged,
      avgProteinLogged: avgProtLogged,
    });

    setLoading(false);
  };

  // ── Weight logging ──────────────────────────────────────────────────────
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

  // ── Measurements ────────────────────────────────────────────────────────
  const measFieldsFull = [
    { key: "weight_kg", label: "Weight", unit: "kg" },
    { key: "body_fat_pct", label: "Body Fat", unit: "%" },
    { key: "chest_cm", label: "Chest", unit: "cm" },
    { key: "waist_cm", label: "Waist", unit: "cm" },
    { key: "left_arm_cm", label: "Left Arm", unit: "cm" },
    { key: "right_arm_cm", label: "Right Arm", unit: "cm" },
    { key: "left_thigh_cm", label: "Left Thigh", unit: "cm" },
    { key: "right_thigh_cm", label: "Right Thigh", unit: "cm" },
  ];

  const saveMeasurements = async () => {
    if (!session?.user?.id) return;
    setMeasSaving(true);
    const today = new Date().toISOString().split("T")[0];

    // Weight and body fat go to progress_entries (separate table)
    const weightVal = parseFloat(measDraft["weight_kg"] || "");
    const bfVal = parseFloat(measDraft["body_fat_pct"] || "");
    if ((!isNaN(weightVal) && weightVal > 0) || (!isNaN(bfVal) && bfVal > 0)) {
      const progressRow: Record<string, any> = {
        user_id: session.user.id,
        date: today,
      };
      if (!isNaN(weightVal) && weightVal > 0) progressRow.weight_kg = weightVal;
      if (!isNaN(bfVal) && bfVal > 0) progressRow.body_fat_pct = bfVal;
      await (supabase as any).from("progress_entries").insert(progressRow);
    }

    // Body measurements go to body_measurements table
    const measRow: Record<string, any> = {
      user_id: session.user.id,
      date: today,
    };
    const measKeys = ["chest_cm", "waist_cm", "left_arm_cm", "right_arm_cm", "left_thigh_cm", "right_thigh_cm"];
    let hasMeas = false;
    for (const key of measKeys) {
      const val = parseFloat(measDraft[key] || "");
      if (!isNaN(val) && val > 0) {
        measRow[key] = val;
        hasMeas = true;
      } else {
        measRow[key] = null;
      }
    }
    if (hasMeas) {
      await (supabase as any).from("body_measurements").insert(measRow);
    }

    setMeasEditMode(false);
    setMeasSaving(false);
    await loadAll();
  };

  const enterMeasEditMode = () => {
    const draft: Record<string, string> = {};
    measFieldsFull.forEach(({ key }) => {
      draft[key] = measurements?.[key] != null ? String(measurements[key]) : "";
    });
    setMeasDraft(draft);
    setMeasEditMode(true);
  };

  const getMeasTrend = (key: string): "up" | "down" | null => {
    if (!measurements || !prevMeasurements) return null;
    const curr = measurements[key];
    const prev = prevMeasurements[key];
    if (curr == null || prev == null) return null;
    if (curr > prev) return "up";
    if (curr < prev) return "down";
    return null;
  };

  // ── Derived values ──────────────────────────────────────────────────────
  const recentAvg = entries.slice(0, 7).reduce((s, e) => s + (e.weight_kg || 0), 0) / Math.min(entries.length, 7) || 0;
  const previousAvg = entries.slice(7, 14).reduce((s, e) => s + (e.weight_kg || 0), 0) / Math.min(Math.max(entries.length - 7, 1), 7) || 0;
  const weightTrend = entries.length > 7 ? recentAvg - previousAvg : 0;

  const volumeChange = volumeLastWeek > 0
    ? Math.round(((volumeThisWeek - volumeLastWeek) / volumeLastWeek) * 100) : 0;

  const max1RM = Math.max(...estimated1RMs.map((l) => l.value), 1);

  const earnedCount = earnedAchievements.size;
  const totalAchievements = ACHIEVEMENT_DEFINITIONS.length;
  const achievementCards = ACHIEVEMENT_DEFINITIONS.slice(0, 12).map((def) => ({
    ...def,
    earned: earnedAchievements.has(def.key),
  }));

  // Heatmap
  const heatmapPadding = 48;
  const dayLabelWidth = 18;
  const heatmapGridWidth = SCREEN_WIDTH - heatmapPadding - dayLabelWidth - 4;
  const cellSize = Math.floor(heatmapGridWidth / HEATMAP_COLS) - 2;

  const buildHeatmapGrid = () => {
    const days: { date: string; count: number; isToday: boolean }[] = [];
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    for (let i = 83; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      days.push({ date: dateStr, count: heatmapData[dateStr] || 0, isToday: dateStr === todayStr });
    }
    return days;
  };

  const buildMonthLabels = () => {
    const labels: { text: string; colIdx: number }[] = [];
    const now = new Date();
    let lastMonth = -1;
    for (let colIdx = 0; colIdx < HEATMAP_COLS; colIdx++) {
      const dayOffset = 83 - colIdx * 7;
      const d = new Date(now);
      d.setDate(d.getDate() - dayOffset);
      const month = d.getMonth();
      if (month !== lastMonth) {
        labels.push({ text: MONTH_SHORT[month], colIdx });
        lastMonth = month;
      }
    }
    return labels;
  };

  // Week label
  const now = new Date();
  const weekStart = new Date(now);
  const dayOfWeek = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekLabel = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} \u2013 ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const dateLabel = now
    .toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
    .toUpperCase();

  // ═══════════════════════════════════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <View style={s.loadingContainer}>
        <TopoBackground />
        <ActivityIndicator size="large" color={earth} />
      </View>
    );
  }

  const heatmapDays = buildHeatmapGrid();

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <View style={s.screen}>
      <TopoBackground />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={earth} />
        }
      >
        <View style={s.content}>

          {/* ── HEADER ── */}
          <Text style={s.dateLabel}>{dateLabel}</Text>
          <Text style={s.heroTitle}>Your Journey</Text>

          {/* ── SEGMENT CONTROL ── */}
          <SegmentControl tabs={TABS} active={activeTab} onChange={setActiveTab} />

          {/* ════════════════════════════════════════════════════════════ */}
          {/* TAB 0: OVERVIEW                                            */}
          {/* ════════════════════════════════════════════════════════════ */}
          {activeTab === 0 && (
            <>
              {/* Trends Overview */}
              <TrendsOverview
                workoutsThisMonth={workoutsThisMonth}
                workoutsLastMonth={workoutsLastMonth}
                volumeThisMonth={volumeThisMonth}
                volumeLastMonth={volumeLastMonth}
                streak={streak}
                streakBest={streakBest}
                weightCurrent={entries[0]?.weight_kg || null}
                weightMonthAgo={weightMonthAgo}
              />

              {/* Activity Heatmap */}
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Activity</Text>
                <Text style={s.sectionMeta}>Last 12 weeks</Text>
              </View>
              <View style={{ flexDirection: "row", paddingLeft: 24 + 18, paddingRight: 24, marginBottom: 4 }}>
                {buildMonthLabels().map((ml, i) => (
                  <Text key={i} style={{ position: "absolute", left: ml.colIdx * (cellSize + 2), fontSize: 8, color: rock, fontWeight: "600" as const }}>
                    {ml.text}
                  </Text>
                ))}
                <View style={{ height: 12 }} />
              </View>
              <View style={s.heatmapContainer}>
                <View style={s.heatmapDayLabels}>
                  {DAY_LABELS.map((label, i) => (
                    <Text key={i} style={[s.heatmapDayLabel, { height: cellSize + 2 }]}>{label}</Text>
                  ))}
                </View>
                <View style={s.heatmapGrid}>
                  {Array.from({ length: HEATMAP_COLS }).map((_, colIdx) => (
                    <View key={colIdx} style={s.heatmapColumn}>
                      {Array.from({ length: HEATMAP_ROWS }).map((_, rowIdx) => {
                        const idx = colIdx * HEATMAP_ROWS + rowIdx;
                        const day = heatmapDays[idx];
                        let bg = stone;
                        if (day?.isToday) bg = trail;
                        else if (day?.count >= 2) bg = earth;
                        else if (day?.count === 1) bg = "rgba(45,42,36,0.20)";
                        return (
                          <View
                            key={rowIdx}
                            style={[s.heatmapCell, { width: cellSize, height: cellSize, backgroundColor: bg }]}
                          />
                        );
                      })}
                    </View>
                  ))}
                </View>
              </View>
              <View style={s.heatmapLegend}>
                <Text style={s.heatmapLegendText}>Less</Text>
                <View style={[s.heatmapLegendBox, { backgroundColor: stone }]} />
                <View style={[s.heatmapLegendBox, { backgroundColor: "rgba(45,42,36,0.08)" }]} />
                <View style={[s.heatmapLegendBox, { backgroundColor: "rgba(45,42,36,0.20)" }]} />
                <View style={[s.heatmapLegendBox, { backgroundColor: earth }]} />
                <Text style={s.heatmapLegendText}>More</Text>
              </View>

              {/* Week in Review */}
              <WeekInReview
                weekLabel={weekLabel}
                workoutsCompleted={completedThisWeek}
                workoutsPlanned={plannedThisWeek}
                volumeThisWeek={volumeThisWeek}
                volumeLastWeek={volumeLastWeek}
                streak={streak}
                prs={weekPRs}
                weightStart={weightWeekStart}
                weightEnd={entries[0]?.weight_kg || null}
              />

              {/* Achievements */}
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Achievements</Text>
                <Pressable onPress={() => router.push("/achievements" as any)}>
                  <Text style={s.sectionLink}>
                    {earnedCount} of {totalAchievements} \u00B7 View all \u203A
                  </Text>
                </Pressable>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.achievementScroll}
                style={{ marginBottom: 24, marginHorizontal: -24 }}
              >
                {achievementCards.map((ach) => {
                  const tint = ACHIEVEMENT_TINTS[ach.category] || ACHIEVEMENT_TINTS.workout;
                  const tierNum = TIER_INDEX[ach.tier] || 1;
                  return (
                    <View
                      key={ach.key}
                      style={[
                        s.achievementCard,
                        { backgroundColor: ach.earned ? tint.bg : stone, opacity: ach.earned ? 1 : 0.4 },
                      ]}
                    >
                      {ach.earned && (
                        <View style={s.newBadge}>
                          <Text style={s.newBadgeText}>NEW</Text>
                        </View>
                      )}
                      <Text style={s.achievementEmoji}>{ICON_EMOJI[ach.icon] || "\uD83C\uDFC6"}</Text>
                      <Text style={s.achievementName} numberOfLines={2}>{ach.name}</Text>
                      <View style={s.tierDots}>
                        {[1, 2, 3, 4].map((t) => (
                          <View
                            key={t}
                            style={[s.tierDot, { backgroundColor: t <= tierNum ? tint.dot : "rgba(0,0,0,0.08)" }]}
                          />
                        ))}
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </>
          )}

          {/* ════════════════════════════════════════════════════════════ */}
          {/* TAB 1: STRENGTH                                            */}
          {/* ════════════════════════════════════════════════════════════ */}
          {activeTab === 1 && (
            <>
              {/* Exercise Progression */}
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Exercise Progression</Text>
              </View>
              <ExerciseProgression
                userId={session?.user?.id || ""}
                exerciseList={exerciseList}
              />

              {/* 1RM Bar Chart */}
              {estimated1RMs.length > 0 && (
                <View style={s.oneRmSection}>
                  <Text style={s.microLabel}>ESTIMATED 1RM</Text>
                  {estimated1RMs.map((lift, i) => {
                    const ratio = lift.value / max1RM;
                    return (
                      <View key={lift.name} style={s.oneRmRow}>
                        <Text style={s.oneRmName}>{lift.name}</Text>
                        <View style={s.oneRmTrack}>
                          <View
                            style={[
                              s.oneRmFill,
                              {
                                width: `${Math.round(ratio * 100)}%`,
                                backgroundColor: i === 0 ? trail : i < 3 ? "rgba(45,42,36,0.30)" : "rgba(45,42,36,0.15)",
                              },
                            ]}
                          />
                        </View>
                        <Text style={s.oneRmValue}>{Math.round(lift.value)}</Text>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Muscle Distribution */}
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Muscle Balance</Text>
                <Text style={s.sectionMeta}>by volume</Text>
              </View>
              <MuscleDistribution distribution={muscleDistribution} />

              {/* Recent PRs */}
              {recentPRs.length > 0 && (
                <>
                  <View style={s.sectionHeader}>
                    <Text style={s.sectionTitle}>Recent PRs</Text>
                    <Text style={s.sectionMeta}>Last 30 days</Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={s.prScroll}
                    style={{ marginBottom: 24, marginHorizontal: -24 }}
                  >
                    {recentPRs.map((pr, i) => (
                      <View key={i} style={s.prCard}>
                        <Text style={s.prIcon}>{"\uD83C\uDFC6"}</Text>
                        <Text style={s.prName} numberOfLines={1}>{pr.name}</Text>
                        <Text style={s.prValue}>{pr.value}</Text>
                        <Text style={s.prType}>{pr.type}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </>
              )}

              {/* Volume section */}
              <View style={s.volumeSection}>
                <View style={s.volumeLeft}>
                  <Text style={s.microLabel}>WEEKLY VOLUME</Text>
                  <Text style={s.volumeBigNum}>
                    {volumeThisWeek > 0 ? `${(volumeThisWeek / 1000).toFixed(1)}` : "\u2014"}
                  </Text>
                  {volumeThisWeek > 0 && <Text style={s.volumeUnit}>tons</Text>}
                  {volumeLastWeek > 0 && (
                    <Text style={[s.trendText, { color: volumeChange >= 0 ? trail : "#EF4444" }]}>
                      {volumeChange >= 0 ? "+" : ""}{volumeChange}% vs last week
                    </Text>
                  )}
                </View>
                <View style={s.volumeRight}>
                  {[0.3, 0.5, 0.7, 0.4, 0.8, 0.6, 1.0].map((h, i) => (
                    <View
                      key={i}
                      style={[s.volumeBar, { height: h * 44, backgroundColor: i === 6 ? trail : "rgba(45,42,36,0.10)" }]}
                    />
                  ))}
                </View>
              </View>
            </>
          )}

          {/* ════════════════════════════════════════════════════════════ */}
          {/* TAB 2: INSIGHTS                                            */}
          {/* ════════════════════════════════════════════════════════════ */}
          {activeTab === 2 && (
            <>
              {/* Monthly Summary */}
              <MonthlySummary
                monthLabel={monthLabel}
                workoutsThisMonth={workoutsThisMonth}
                workoutsLastMonth={workoutsLastMonth}
                volumeThisMonth={volumeThisMonth}
                volumeLastMonth={volumeLastMonth}
                prsThisMonth={monthPRCount}
                weightStart={monthWeightStart}
                weightEnd={entries[0]?.weight_kg || null}
                mostImproved={monthMostImproved}
                completionRate={monthCompletionRate}
                totalSets={monthTotalSets}
                avgDuration={monthAvgDuration}
              />

              {/* Nutrition Correlation */}
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Nutrition \u00D7 Training</Text>
              </View>
              <NutritionCorrelation {...nutritionData} />

              {/* Body Measurements */}
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Measurements</Text>
                {!measEditMode ? (
                  <Pressable onPress={enterMeasEditMode}>
                    <Text style={s.sectionLink}>Update</Text>
                  </Pressable>
                ) : (
                  <Pressable onPress={() => setMeasEditMode(false)}>
                    <Text style={[s.sectionLink, { color: rock }]}>Cancel</Text>
                  </Pressable>
                )}
              </View>

              {measEditMode ? (
                <View style={s.measEditCard}>
                  {measFieldsFull.map((f) => (
                    <View key={f.key} style={s.measEditRow}>
                      <Text style={s.measEditLabel}>{f.label}</Text>
                      <View style={s.measEditInputWrap}>
                        <TextInput
                          style={s.measEditInput}
                          placeholder="\u2014"
                          placeholderTextColor={rock}
                          keyboardType="decimal-pad"
                          value={measDraft[f.key] || ""}
                          onChangeText={(v) => setMeasDraft((prev) => ({ ...prev, [f.key]: v }))}
                        />
                        <Text style={s.measEditUnit}>{f.unit}</Text>
                      </View>
                    </View>
                  ))}
                  <Pressable
                    onPress={saveMeasurements}
                    style={[s.measSaveBtn, measSaving && { opacity: 0.6 }]}
                    disabled={measSaving}
                  >
                    <Text style={s.measSaveBtnText}>{measSaving ? "Saving..." : "Save Measurements"}</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={s.measDisplayCard}>
                  {measurements ? (
                    <View style={s.measGrid}>
                      {measFieldsFull.map((f) => {
                        const val = measurements[f.key];
                        const trend = getMeasTrend(f.key);
                        return (
                          <View key={f.key} style={s.measGridItem}>
                            <Text style={s.measGridLabel}>{f.label}</Text>
                            <View style={s.measGridValueRow}>
                              <Text style={s.measGridValue}>{val != null ? `${val}` : "\u2014"}</Text>
                              {val != null && <Text style={s.measGridUnit}>{f.unit}</Text>}
                              {trend === "up" && (
                                <Text style={[s.measTrend, { color: f.key === "weight_kg" || f.key === "waist_cm" || f.key === "body_fat_pct" ? "#EF4444" : trail }]}>
                                  {"\u2191"}
                                </Text>
                              )}
                              {trend === "down" && (
                                <Text style={[s.measTrend, { color: f.key === "weight_kg" || f.key === "waist_cm" || f.key === "body_fat_pct" ? trail : "#EF4444" }]}>
                                  {"\u2193"}
                                </Text>
                              )}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  ) : (
                    <View style={s.measEmptyState}>
                      <Text style={s.measEmptyIcon}>{"\uD83D\uDCCF"}</Text>
                      <Text style={s.measEmptyText}>No measurements logged yet</Text>
                      <Pressable onPress={enterMeasEditMode}>
                        <Text style={s.measEmptyAction}>Log your first entry</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              )}

              {/* Weight Section */}
              <View style={s.weightSection}>
                <View style={s.weightLeft}>
                  <Text style={s.microLabel}>WEIGHT</Text>
                  <Text style={s.weightBigNum}>
                    {entries[0]?.weight_kg ? `${entries[0].weight_kg}` : "\u2014"}
                  </Text>
                  {entries[0]?.weight_kg && <Text style={s.weightUnit}>kg</Text>}
                  {weightTrend !== 0 && (
                    <Text style={[s.trendText, { color: weightTrend > 0 ? "#EF4444" : trail }]}>
                      {weightTrend > 0 ? "+" : ""}{weightTrend.toFixed(1)} kg
                    </Text>
                  )}
                  {!showInput && (
                    <Pressable onPress={() => setShowInput(true)}>
                      <Text style={s.logWeightBtn}>+ Log weight</Text>
                    </Pressable>
                  )}
                </View>
                <View style={s.weightRight}>
                  {(() => {
                    const recent7 = entries.slice(0, 7).reverse().map((e) => e.weight_kg || 0);
                    if (recent7.length === 0) return null;
                    const minW = Math.min(...recent7.filter(Boolean)) * 0.95;
                    const maxW = Math.max(...recent7.filter(Boolean)) * 1.05;
                    const range = maxW - minW || 1;
                    return recent7.map((w, i) => (
                      <View
                        key={i}
                        style={[
                          s.sparkLine,
                          {
                            height: w > 0 ? Math.max(((w - minW) / range) * 50, 4) : 4,
                            backgroundColor: i === recent7.length - 1 ? trail : "rgba(45,42,36,0.08)",
                          },
                        ]}
                      />
                    ));
                  })()}
                </View>
              </View>

              {showInput && (
                <View style={s.weightInputContainer}>
                  <TextInput
                    style={s.weightTextInput}
                    placeholder="70.0"
                    placeholderTextColor={rock}
                    keyboardType="decimal-pad"
                    value={weightInput}
                    onChangeText={setWeightInput}
                    autoFocus
                  />
                  <View style={s.weightInputActions}>
                    <Pressable onPress={() => setShowInput(false)} style={s.cancelBtn}>
                      <Text style={s.cancelBtnText}>Cancel</Text>
                    </Pressable>
                    <Pressable onPress={logWeight} style={s.saveBtn}>
                      <Text style={s.saveBtnText}>Save</Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {/* Quick Links */}
              <View style={s.quickLinks}>
                <Pressable onPress={() => router.push("/weekly-summary" as any)} style={s.quickLinkPill}>
                  <Text style={s.quickLinkText}>Weekly Summary</Text>
                </Pressable>
                <Pressable onPress={() => router.push("/wellness" as any)} style={s.quickLinkPill}>
                  <Text style={s.quickLinkText}>Wellness</Text>
                </Pressable>
              </View>
            </>
          )}

        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: sand },
  loadingContainer: { flex: 1, backgroundColor: sand, justifyContent: "center", alignItems: "center" },
  content: { paddingHorizontal: 24, paddingTop: 60 },

  // Header
  dateLabel: { fontSize: 10, color: rock, textTransform: "uppercase", letterSpacing: 1, textAlign: "center", marginBottom: 4 },
  heroTitle: { fontSize: 22, fontWeight: "700", color: earth, textAlign: "center", marginBottom: 20 },

  // Section headers
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: earth },
  sectionLink: { fontSize: 10, color: trail, fontWeight: "600" },
  sectionMeta: { fontSize: 10, color: rock },

  // Heatmap
  heatmapContainer: { flexDirection: "row", marginBottom: 6 },
  heatmapDayLabels: { width: 18, marginRight: 4 },
  heatmapDayLabel: { fontSize: 8, color: rock, textAlign: "right", textAlignVertical: "center", lineHeight: 14, includeFontPadding: false },
  heatmapGrid: { flexDirection: "row", flex: 1, justifyContent: "space-between" },
  heatmapColumn: { gap: 2 },
  heatmapCell: { borderRadius: 3 },
  heatmapLegend: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 3, marginBottom: 28 },
  heatmapLegendText: { fontSize: 8, color: rock, marginHorizontal: 2 },
  heatmapLegendBox: { width: 10, height: 10, borderRadius: 2 },

  // Achievement cards
  achievementScroll: { paddingHorizontal: 24, gap: 10 },
  achievementCard: { width: 100, borderRadius: 18, padding: 12, alignItems: "center", justifyContent: "center", minHeight: 120 },
  newBadge: { position: "absolute", top: 6, right: 6, backgroundColor: trail, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 6 },
  newBadgeText: { fontSize: 7, fontWeight: "800", color: "#FFFFFF", letterSpacing: 0.5 },
  achievementEmoji: { fontSize: 28, marginBottom: 6 },
  achievementName: { fontSize: 10, fontWeight: "600", color: earth, textAlign: "center", marginBottom: 6 },
  tierDots: { flexDirection: "row", gap: 3 },
  tierDot: { width: 5, height: 5, borderRadius: 2.5 },

  // 1RM
  oneRmSection: { marginBottom: 24 },
  oneRmRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  oneRmName: { fontSize: 11, color: earth, width: 90 },
  oneRmTrack: { flex: 1, height: 8, backgroundColor: stone, borderRadius: 4, overflow: "hidden", marginHorizontal: 8 },
  oneRmFill: { height: 8, borderRadius: 4 },
  oneRmValue: { fontSize: 14, fontWeight: "800", color: earth, width: 36, textAlign: "right" },
  microLabel: { fontSize: 9, color: rock, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },

  // Volume
  volumeSection: { flexDirection: "row", alignItems: "flex-end", marginBottom: 28 },
  volumeLeft: { flex: 1 },
  volumeRight: { flexDirection: "row", alignItems: "flex-end", gap: 4, height: 48 },
  volumeBigNum: { fontSize: 28, fontWeight: "800", color: earth, lineHeight: 32 },
  volumeUnit: { fontSize: 12, color: rock, marginBottom: 2 },
  volumeBar: { width: 8, borderRadius: 4 },
  trendText: { fontSize: 10, fontWeight: "600", marginTop: 2 },

  // PR cards
  prScroll: { paddingHorizontal: 24, gap: 10 },
  prCard: { backgroundColor: "rgba(52,211,153,0.04)", borderWidth: 1, borderColor: "rgba(52,211,153,0.06)", borderRadius: 16, padding: 14, width: 130, alignItems: "flex-start" },
  prIcon: { fontSize: 18, marginBottom: 6 },
  prName: { fontSize: 11, color: "#047857", fontWeight: "500", marginBottom: 4 },
  prValue: { fontSize: 22, fontWeight: "800", color: earth, marginBottom: 2 },
  prType: { fontSize: 9, color: trail, fontWeight: "600", textTransform: "uppercase" },

  // Weight
  weightSection: { flexDirection: "row", alignItems: "flex-end", marginBottom: 8 },
  weightLeft: { flex: 1 },
  weightRight: { flexDirection: "row", alignItems: "flex-end", gap: 4, height: 56 },
  sparkLine: { width: 6, borderRadius: 3 },
  weightBigNum: { fontSize: 40, fontWeight: "900", color: earth, lineHeight: 44 },
  weightUnit: { fontSize: 14, color: rock, marginTop: -4, marginBottom: 2 },
  logWeightBtn: { fontSize: 10, color: trail, fontWeight: "600", marginTop: 6 },
  weightInputContainer: { marginBottom: 20 },
  weightTextInput: { backgroundColor: stone, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 14, fontSize: 20, color: earth, textAlign: "center", marginBottom: 10 },
  weightInputActions: { flexDirection: "row", gap: 10 },
  cancelBtn: { flex: 1, backgroundColor: stone, borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  cancelBtnText: { color: earth, fontWeight: "600", fontSize: 14 },
  saveBtn: { flex: 1, backgroundColor: earth, borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  saveBtnText: { color: sand, fontWeight: "600", fontSize: 14 },

  // Body Measurements
  measDisplayCard: { backgroundColor: stone, borderRadius: 18, padding: 16, marginBottom: 24 },
  measGrid: { flexDirection: "row", flexWrap: "wrap" },
  measGridItem: { width: "48%" as any, paddingVertical: 10, paddingHorizontal: 4, marginHorizontal: "1%" as any },
  measGridLabel: { fontSize: 9, color: rock, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 3 },
  measGridValueRow: { flexDirection: "row", alignItems: "baseline", gap: 3 },
  measGridValue: { fontSize: 20, fontWeight: "800", color: earth },
  measGridUnit: { fontSize: 11, color: rock, fontWeight: "500" },
  measTrend: { fontSize: 14, fontWeight: "700", marginLeft: 2 },
  measEmptyState: { alignItems: "center", paddingVertical: 20 },
  measEmptyIcon: { fontSize: 28, marginBottom: 8 },
  measEmptyText: { fontSize: 13, color: rock, marginBottom: 8 },
  measEmptyAction: { fontSize: 13, color: trail, fontWeight: "600" },
  measEditCard: { backgroundColor: stone, borderRadius: 18, padding: 16, marginBottom: 24 },
  measEditRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  measEditLabel: { fontSize: 13, color: earth, fontWeight: "500", width: 80 },
  measEditInputWrap: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: sand, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginLeft: 12 },
  measEditInput: { flex: 1, fontSize: 16, color: earth, fontWeight: "600", padding: 0 },
  measEditUnit: { fontSize: 12, color: rock, fontWeight: "500", marginLeft: 4 },
  measSaveBtn: { backgroundColor: earth, borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 6 },
  measSaveBtnText: { color: sand, fontWeight: "700", fontSize: 14 },

  // Quick links
  quickLinks: { flexDirection: "row", gap: 10, marginBottom: 16 },
  quickLinkPill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100, backgroundColor: stone },
  quickLinkText: { fontSize: 13, color: earth, fontWeight: "600" },
});
