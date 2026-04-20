import { View, Text, Pressable, ScrollView, ActivityIndicator, RefreshControl, Alert, Modal, Animated, Image } from "react-native";
import { router } from "expo-router";
import { useEffect, useState, useCallback, useRef } from "react";
import { useAuthStore, suggestWeight, EDUCATIONAL_TIPS, calculateReadiness, type ReadinessLevel, getMissedDayOptions, handleMissedDay, calculateWorkoutStreak, assessInjuryForWorkout, type InjuryAssessment, applyPeriodization, TRAINING_PHASES, type TrainingPhase } from "@repped/shared";
import type { MissedDayOption, MissedDayStrategy } from "@repped/shared";
import { supabase } from "../../src/lib/supabase";
import type { WorkoutDay } from "@repped/shared";
import { theme } from "../../src/lib/styles";
import { TopoBackground, BentoWidget, AliveDot, VolumeChart, ExpandableExerciseCard, TrailLine } from "../../src/components/terrain";
import { Avatar } from "../../src/components/Avatar";
import { AvatarPicker } from "../../src/components/AvatarPicker";
import { HomeSkeleton } from "../../src/components/SkeletonLoader";
import type { DayData } from "../../src/components/terrain";

interface ExerciseData {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  targetReps: number;
  targetRpe?: number;
  restSeconds: number;
  explainWhy: string;
  instructions: string;
  explainEli5: string;
  animationUrl: string | null;
  muscleGroup: string;
  suggestedWeight: number;
  weightReasoning: string;
}

export default function Today() {
  const session = useAuthStore((s) => s.session);
  const [todayWorkout, setTodayWorkout] = useState<WorkoutDay | null>(null);
  const [exerciseData, setExerciseData] = useState<ExerciseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [hasWellnessLog, setHasWellnessLog] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [readiness, setReadiness] = useState<ReadinessLevel | null>(null);
  const [readinessMessage, setReadinessMessage] = useState<string | null>(null);
  const [missedDay, setMissedDay] = useState<any>(null);
  const [missedDayOptions, setMissedDayOptions] = useState<MissedDayOption[]>([]);
  const [missedDayMessage, setMissedDayMessage] = useState<string | null>(null);
  const [readinessSkipped, setReadinessSkipped] = useState(false);
  const [readinessBannerVisible, setReadinessBannerVisible] = useState(false);
  const [readinessBannerMessage, setReadinessBannerMessage] = useState<string | null>(null);
  const [openCardIndex, setOpenCardIndex] = useState<number | null>(null);
  const [healthCleared, setHealthCleared] = useState(true);
  const [trainingPhase, setTrainingPhase] = useState<TrainingPhase | null>(null);
  const [weekVolumeData, setWeekVolumeData] = useState<DayData[]>([]);
  const [dayStreak, setDayStreak] = useState(0);
  const [weekWorkoutCount, setWeekWorkoutCount] = useState(0);
  const [weekPlannedCount, setWeekPlannedCount] = useState(0);
  const [totalVolumeThisWeek, setTotalVolumeThisWeek] = useState(0);
  const [totalVolumeLastWeek, setTotalVolumeLastWeek] = useState(0);
  const [topWeight, setTopWeight] = useState<{ weight: number; exercise: string; reps: number; isPR: boolean } | null>(null);
  const [topWeightLastWeek, setTopWeightLastWeek] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [injuryAssessment, setInjuryAssessment] = useState<InjuryAssessment | null>(null);

  // Adapt modal state
  const [adaptVisible, setAdaptVisible] = useState(false);
  const [adaptSection, setAdaptSection] = useState<"main" | "equipment" | "focus" | "express">("main");
  const [activeEquipment, setActiveEquipment] = useState<string>("full_gym");
  const [weekPlan, setWeekPlan] = useState<{ day: number; focus: string; isRest: boolean }[]>([]);
  const [adaptLoading, setAdaptLoading] = useState(false);
  const adaptSlide = useRef(new Animated.Value(0)).current;

  const EQUIPMENT_PRESETS = [
    { id: "full_gym", label: "Full Gym", desc: "Barbell, cables, machines" },
    { id: "dumbbells_only", label: "Home / Hotel", desc: "Dumbbells & bodyweight" },
    { id: "bodyweight", label: "Outdoors", desc: "Bodyweight & bands only" },
  ];

  const FOCUS_OPTIONS = ["Push", "Pull", "Legs", "Upper", "Lower", "Full Body A"];

  const EXPRESS_DURATIONS = [
    { minutes: 15, label: "15 min", desc: "3 compound lifts, 2 sets" },
    { minutes: 20, label: "20 min", desc: "4 exercises, 2-3 sets" },
    { minutes: 30, label: "30 min", desc: "5 exercises, 3 sets" },
    { minutes: 45, label: "45 min", desc: "Full session" },
  ];

  const openAdaptModal = async () => {
    setAdaptSection("main");
    setAdaptVisible(true);
    Animated.spring(adaptSlide, { toValue: 1, friction: 8, tension: 65, useNativeDriver: true }).start();

    // Load the week's plan for focus swapping
    if (!session?.user?.id) return;
    const { data: plans } = await supabase
      .from("workout_plans")
      .select("day, focus, is_rest_day")
      .eq("user_id", session.user.id)
      .order("day", { ascending: true });

    if (plans) {
      const unique = new Map<number, { day: number; focus: string; isRest: boolean }>();
      for (const p of (plans as any[])) {
        if (!unique.has(p.day)) {
          unique.set(p.day, { day: p.day, focus: p.focus || "Rest", isRest: p.is_rest_day });
        }
      }
      setWeekPlan(Array.from(unique.values()).sort((a, b) => a.day - b.day));
    }

    // Load profile data (equipment + display name + avatar)
    const { data: profile } = await supabase
      .from("profiles")
      .select("available_equipment, display_name, avatar_url")
      .eq("id", session.user.id)
      .single();
    if (profile) {
      if ((profile as any).display_name) setDisplayName((profile as any).display_name);
      if ((profile as any).avatar_url) setAvatarUrl((profile as any).avatar_url);
    }
    if (profile) {
      const eq = (profile as any).available_equipment;
      if (Array.isArray(eq)) {
        if (eq.includes("barbell") && eq.includes("machine")) setActiveEquipment("full_gym");
        else if (eq.includes("dumbbell")) setActiveEquipment("dumbbells_only");
        else setActiveEquipment("bodyweight");
      }
    }
  };

  const closeAdaptModal = () => {
    Animated.timing(adaptSlide, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setAdaptVisible(false);
      setAdaptSection("main");
    });
  };

  // Shared helper: regenerate exercises for a given focus + equipment, save to DB, reload UI
  const regenerateExercises = async (focus: string, equipmentId: string) => {
    if (!session?.user?.id) return;
    const uid = session.user.id;
    const day = new Date().getDay() === 0 ? 7 : new Date().getDay();

    // 1. Fetch the full exercise library from Supabase
    const { data: library } = await supabase.from("exercises").select("*");
    if (!library || library.length === 0) return;

    // 2. Fetch profile for training history + goal
    const { data: profile } = await supabase
      .from("profiles")
      .select("training_history, goal, current_injuries")
      .eq("id", uid)
      .single();

    const trainingHistory = (profile as any)?.training_history ?? "beginner";
    const goal = (profile as any)?.goal ?? "build_muscle";
    const injuries = (profile as any)?.current_injuries ?? [];

    // 3. Equipment mapping
    const equipmentMap: Record<string, string[]> = {
      full_gym: ["barbell", "dumbbell", "cable", "machine", "bodyweight", "kettlebell", "band", "bench"],
      dumbbells_only: ["dumbbell", "bodyweight", "band", "bench"],
      bodyweight: ["bodyweight", "band"],
    };
    const allowedEquipment = equipmentMap[equipmentId] || equipmentMap.full_gym;

    // 4. Focus → muscle groups
    const focusMuscleMap: Record<string, string[]> = {
      "Full Body A": ["chest", "back", "quads", "core"],
      "Full Body B": ["shoulders", "hamstrings", "glutes", "biceps", "triceps"],
      "Full Body C": ["chest", "back", "quads", "core"],
      "Upper": ["chest", "back", "shoulders", "biceps", "triceps"],
      "Lower": ["quads", "hamstrings", "glutes", "calves", "core"],
      "Push": ["chest", "shoulders", "triceps"],
      "Pull": ["back", "biceps", "core"],
      "Legs": ["quads", "hamstrings", "glutes", "calves"],
    };
    const muscleGroups = focusMuscleMap[focus] || focusMuscleMap["Full Body A"];

    // 5. Volume config
    const volumeBase: Record<string, { sets: number; reps: number; rpe: number }> = {
      beginner: { sets: 3, reps: 10, rpe: 6.5 },
      intermediate: { sets: 4, reps: 8, rpe: 7.5 },
      advanced: { sets: 4, reps: 6, rpe: 8.5 },
    };
    const goalRest: Record<string, number> = { lose_fat: 60, maintain: 90, build_muscle: 120 };
    const vol = volumeBase[trainingHistory] || volumeBase.beginner;
    const restSec = goalRest[goal] || 90;
    const exercisesPerGroup = trainingHistory === "beginner" ? 1 : 2;

    // 6. Filter + pick exercises per muscle group
    const compoundKeywords = [
      "squat", "deadlift", "bench press", "overhead press", "row", "pull-up",
      "pullup", "chin-up", "dip", "lunge", "hip thrust", "leg press", "push-up",
      "pushup", "romanian", "rdl", "front squat", "goblet", "split squat",
    ];
    const isCompound = (name: string) => compoundKeywords.some((kw) => name.toLowerCase().includes(kw));

    const diffOrder = ["beginner", "intermediate", "advanced"];
    const maxDiffIdx = diffOrder.indexOf(trainingHistory);

    const picked: any[] = [];
    const usedIds = new Set<string>();

    for (const mg of muscleGroups) {
      const available = (library as any[]).filter((ex) => {
        if (ex.muscle_group !== mg) return false;
        if (diffOrder.indexOf(ex.difficulty) > maxDiffIdx) return false;
        return (ex.equipment || []).some((eq: string) => allowedEquipment.includes(eq));
      });

      // Shuffle and pick
      const shuffled = [...available].sort(() => Math.random() - 0.5);
      const unused = shuffled.filter((ex) => !usedIds.has(ex.id));
      const pool = unused.length >= exercisesPerGroup ? unused : shuffled;
      const selection = pool.slice(0, exercisesPerGroup);

      for (const ex of selection) {
        usedIds.add(ex.id);
        picked.push(ex);
      }
    }

    // Sort: compounds first
    picked.sort((a, b) => (isCompound(a.name) ? 0 : 1) - (isCompound(b.name) ? 0 : 1));

    // 7. Get today's plan ID
    const { data: plan } = await supabase
      .from("workout_plans")
      .select("id")
      .eq("user_id", uid)
      .eq("day", day)
      .eq("is_rest_day", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!plan) return;
    const planId = (plan as any).id;

    // 8. Update focus on the plan
    await supabase
      .from("workout_plans")
      .update({ focus })
      .eq("id", planId);

    // 9. Delete old exercises for this plan
    await supabase
      .from("workout_plan_exercises")
      .delete()
      .eq("workout_plan_id", planId);

    // 10. Insert new exercises
    const rows = picked.map((ex, i) => ({
      workout_plan_id: planId,
      exercise_id: ex.id,
      order: i + 1,
      target_sets: vol.sets,
      target_reps: vol.reps,
      target_rpe: vol.rpe,
      rest_seconds: restSec,
      explain_why: `Targets your ${ex.muscle_group.replace("_", " ")}`,
    }));

    if (rows.length > 0) {
      await supabase.from("workout_plan_exercises").insert(rows);
    }

    // 11. Update profile equipment if changed
    await supabase
      .from("profiles")
      .update({ available_equipment: allowedEquipment })
      .eq("id", uid);
  };

  const handleEquipmentSwitch = async (equipmentId: string) => {
    if (!session?.user?.id || !todayWorkout) return;
    setAdaptLoading(true);
    setActiveEquipment(equipmentId);

    await regenerateExercises(todayWorkout.focus, equipmentId);

    closeAdaptModal();
    await loadTodaysWorkout();
    setAdaptLoading(false);
  };

  const handleFocusSwap = async (newFocus: string) => {
    if (!session?.user?.id || !todayWorkout) return;
    setAdaptLoading(true);

    await regenerateExercises(newFocus, activeEquipment);

    closeAdaptModal();
    await loadTodaysWorkout();
    setAdaptLoading(false);
  };

  const handleExpressMode = async (minutes: number) => {
    if (!session?.user?.id) return;
    setAdaptLoading(true);

    // Trim the current exercise list: ~7 min per exercise (sets + rest)
    // Keep compounds first (they're already sorted that way from generation)
    const maxExercises = Math.max(3, Math.floor(minutes / 7));
    const trimmed = exerciseData.slice(0, maxExercises);

    // Also reduce sets for express: 2 sets instead of 3-4
    const expressed = trimmed.map((ex) => ({
      ...ex,
      targetSets: Math.min(ex.targetSets, minutes <= 20 ? 2 : 3),
    }));

    // Persist to DB so workout-player reads the trimmed list
    try {
      const uid = session.user.id;
      const day = new Date().getDay() === 0 ? 7 : new Date().getDay();

      // Get current plan ID (same pattern as regenerateExercises)
      const { data: plan } = await supabase
        .from("workout_plans")
        .select("id")
        .eq("user_id", uid)
        .eq("day", day)
        .eq("is_rest_day", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (plan) {
        const planId = (plan as any).id;
        const keptExerciseIds = expressed.map((ex) => ex.exerciseId);

        // Delete exercises that are NOT in the trimmed list
        const { data: allPlanExercises } = await supabase
          .from("workout_plan_exercises")
          .select("id, exercise_id, target_sets")
          .eq("workout_plan_id", planId);

        if (allPlanExercises) {
          const toDelete = (allPlanExercises as any[]).filter(
            (pe) => !keptExerciseIds.includes(pe.exercise_id)
          );
          if (toDelete.length > 0) {
            await supabase
              .from("workout_plan_exercises")
              .delete()
              .in("id", toDelete.map((pe) => pe.id));
          }

          // Update target_sets on remaining exercises if they were reduced
          for (const ex of expressed) {
            const dbRow = (allPlanExercises as any[]).find(
              (pe) => pe.exercise_id === ex.exerciseId
            );
            if (dbRow && dbRow.target_sets !== ex.targetSets) {
              await supabase
                .from("workout_plan_exercises")
                .update({ target_sets: ex.targetSets })
                .eq("id", dbRow.id);
            }
          }
        }
      }
    } catch (err) {
      console.warn("Failed to persist express mode to DB:", err);
    }

    setExerciseData(expressed);

    // Update the todayWorkout to reflect trimmed exercises
    if (todayWorkout) {
      setTodayWorkout({
        ...todayWorkout,
        exercises: expressed.map((e) => ({
          exerciseId: e.exerciseId,
          exerciseName: e.exerciseName,
          targetSets: e.targetSets,
          targetReps: e.targetReps,
          targetRpe: e.targetRpe,
          restSeconds: e.restSeconds,
          explainWhy: e.explainWhy,
        })),
      });
    }

    setAdaptLoading(false);
    closeAdaptModal();
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadTodaysWorkout(), checkWellnessLog(), loadWeeklyStats()]);
    setRefreshing(false);
  }, []);

  // One-time cleanup: delete accidental skip log from today
  useEffect(() => {
    (async () => {
      if (!session?.user?.id) return;
      const today = new Date().toISOString().split("T")[0];
      await supabase
        .from("workout_logs")
        .delete()
        .eq("user_id", session.user.id)
        .eq("skipped", true)
        .eq("life_happened", true)
        .gte("created_at", today);
    })();
  }, []);

  useEffect(() => {
    loadTodaysWorkout();
    checkWellnessLog();
    loadWeeklyStats();
  }, []);

  const checkWellnessLog = async () => {
    if (!session?.user?.id) return;
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("wellness_logs")
      .select("id")
      .eq("user_id", session.user.id)
      .gte("created_at", today)
      .limit(1);
    setHasWellnessLog((data?.length ?? 0) > 0);
  };

  const loadWeeklyStats = async () => {
    if (!session?.user?.id) return;
    setStatsLoading(true);
    try {
      const uid = session.user.id;
      const now = new Date();
      const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // 1=Mon, 7=Sun

      // Get Monday of current week at midnight
      const monday = new Date(now);
      monday.setDate(now.getDate() - (currentDay - 1));
      monday.setHours(0, 0, 0, 0);
      const mondayStr = monday.toISOString();

      // Get Sunday end of current week
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 7);
      const sundayStr = sunday.toISOString();

      // Previous week boundaries
      const prevMonday = new Date(monday);
      prevMonday.setDate(monday.getDate() - 7);
      const prevMondayStr = prevMonday.toISOString();

      // 1. Get workout_logs for current week (non-skipped)
      const { data: weekLogs } = await supabase
        .from("workout_logs")
        .select("id, started_at")
        .eq("user_id", uid)
        .eq("skipped", false)
        .gte("started_at", mondayStr)
        .lt("started_at", sundayStr);

      const thisWeekLogs = (weekLogs as any[]) || [];
      setWeekWorkoutCount(thisWeekLogs.length);

      // 2. Get set_logs for current week workouts to compute daily volume + top weight
      const weekLogIds = thisWeekLogs.map((l) => l.id);
      let setLogs: any[] = [];
      if (weekLogIds.length > 0) {
        const { data } = await supabase
          .from("set_logs")
          .select("reps, weight_kg, workout_log_id, exercise_id, exercises(name)")
          .in("workout_log_id", weekLogIds);
        setLogs = (data as any[]) || [];
      }

      // Build a map: workout_log_id → started_at date
      const logDateMap: Record<string, string> = {};
      for (const log of thisWeekLogs) {
        if (log.started_at) {
          logDateMap[log.id] = new Date(log.started_at).toISOString().split("T")[0];
        }
      }

      // Compute daily volume: dateStr → total volume (kg)
      const dailyVolume: Record<string, number> = {};
      for (const s of setLogs) {
        const dateStr = logDateMap[s.workout_log_id];
        if (dateStr) {
          dailyVolume[dateStr] = (dailyVolume[dateStr] || 0) + (s.reps || 0) * (s.weight_kg || 0);
        }
      }

      // 3. Get workout_plans to know rest days vs workout days
      const { data: plans } = await supabase
        .from("workout_plans")
        .select("day, is_rest_day")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

      // Build a map: day number → is_rest_day (use latest plan per day)
      const restDayMap: Record<number, boolean> = {};
      for (const p of ((plans as any[]) || []).reverse()) {
        restDayMap[p.day] = p.is_rest_day;
      }

      // Count planned (non-rest) workouts this week
      let planned = 0;
      for (let d = 1; d <= 7; d++) {
        if (restDayMap[d] === false) planned++;
      }
      setWeekPlannedCount(planned);

      // 4. Build volume chart data
      const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const chartData: DayData[] = dayLabels.map((label, i) => {
        const dayNum = i + 1; // 1=Mon ... 7=Sun
        const dateForDay = new Date(monday);
        dateForDay.setDate(monday.getDate() + i);
        const dateStr = dateForDay.toISOString().split("T")[0];
        const vol = Math.round(dailyVolume[dateStr] || 0);
        const isRestDay = restDayMap[dayNum] === true;

        let status: "done" | "today" | "future" | "rest";
        if (dayNum < currentDay) {
          status = vol > 0 ? "done" : (isRestDay ? "rest" : "done");
        } else if (dayNum === currentDay) {
          status = "today";
        } else {
          status = "future";
        }

        let displayLabel: string;
        if (isRestDay && dayNum !== currentDay) {
          displayLabel = "rest";
        } else if (dayNum === currentDay && vol === 0) {
          displayLabel = "today";
        } else if (dayNum > currentDay) {
          displayLabel = isRestDay ? "rest" : "plan";
        } else if (vol >= 1000) {
          displayLabel = `${(vol / 1000).toFixed(1)}k`;
        } else if (vol > 0) {
          displayLabel = `${vol}`;
        } else {
          displayLabel = isRestDay ? "rest" : "0";
        }

        return { day: label, volume: vol, status, label: displayLabel };
      });

      setWeekVolumeData(chartData);

      // 5. Total volume this week
      const thisWeekTotal = setLogs.reduce(
        (sum, s) => sum + (s.reps || 0) * (s.weight_kg || 0), 0
      );
      setTotalVolumeThisWeek(Math.round(thisWeekTotal));

      // 5b. Top weight this week — heaviest single weight lifted
      if (setLogs.length > 0) {
        let best: { weight: number; exercise: string; reps: number; exerciseId: string } | null = null;
        for (const s of setLogs) {
          const w = s.weight_kg || 0;
          if (w > 0 && (!best || w > best.weight)) {
            best = { weight: w, exercise: (s.exercises as any)?.name || "Unknown", reps: s.reps || 0, exerciseId: s.exercise_id };
          }
        }
        if (best) {
          // Check if this is a PR — query personal_records for this exercise
          const { data: prData } = await supabase
            .from("personal_records")
            .select("value")
            .eq("user_id", uid)
            .eq("exercise_id", best.exerciseId)
            .eq("record_type", "weight")
            .order("value", { ascending: false })
            .limit(1)
            .single();
          const isPR = !prData || best.weight >= ((prData as any).value || 0);
          setTopWeight({ weight: best.weight, exercise: best.exercise, reps: best.reps, isPR });
        } else {
          setTopWeight(null);
        }
      } else {
        setTopWeight(null);
      }

      // 6. Previous week volume + top weight for comparison
      const { data: prevLogs } = await supabase
        .from("workout_logs")
        .select("id")
        .eq("user_id", uid)
        .eq("skipped", false)
        .gte("started_at", prevMondayStr)
        .lt("started_at", mondayStr);
      const prevLogIds = ((prevLogs as any[]) || []).map((l) => l.id);
      if (prevLogIds.length > 0) {
        const { data: prevSets } = await supabase
          .from("set_logs")
          .select("reps, weight_kg")
          .in("workout_log_id", prevLogIds);
        const prevSetsArr = (prevSets as any[]) || [];
        const prevVol = prevSetsArr.reduce(
          (sum: number, s: any) => sum + (s.reps || 0) * (s.weight_kg || 0), 0
        );
        setTotalVolumeLastWeek(Math.round(prevVol));
        // Previous week top weight
        let prevMax = 0;
        for (const s of prevSetsArr) { if ((s.weight_kg || 0) > prevMax) prevMax = s.weight_kg || 0; }
        setTopWeightLastWeek(prevMax);
      } else {
        setTotalVolumeLastWeek(0);
        setTopWeightLastWeek(0);
      }

      // 7. Workout streak (consecutive weeks with at least one workout)
      const { data: allLogs } = await supabase
        .from("workout_logs")
        .select("started_at")
        .eq("user_id", uid)
        .eq("skipped", false)
        .order("started_at", { ascending: false });
      const workoutDates = ((allLogs as any[]) || []).map((l) => l.started_at);
      setDayStreak(calculateWorkoutStreak(workoutDates));
    } catch (err) {
      // On error, show zeros — chart will show empty state
      console.warn("Failed to load weekly stats:", err);
      const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const now = new Date();
      const currentDay = now.getDay() === 0 ? 7 : now.getDay();
      setWeekVolumeData(
        dayLabels.map((label, i) => ({
          day: label,
          volume: 0,
          status: (i + 1 < currentDay ? "done" : i + 1 === currentDay ? "today" : "future") as "done" | "today" | "future",
          label: i + 1 === currentDay ? "today" : "0",
        }))
      );
    } finally {
      setStatsLoading(false);
    }
  };

  const loadTodaysWorkout = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    const uid = session.user.id;

    // Get current day of week (1=Monday, 7=Sunday)
    const now = new Date();
    const day = now.getDay() === 0 ? 7 : now.getDay();
    setDayOfWeek(day);

    // Yesterday info for missed workout check
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDay = yesterday.getDay() === 0 ? 7 : yesterday.getDay();

    // ── BATCH 1: Fire all independent queries in parallel ──
    const [profileResult, planResult, yesterdayPlanResult] = await Promise.all([
      supabase.from("profiles")
        .select("display_name, avatar_url, weight_kg, sex, training_history, current_injuries, health_cleared, training_phase")
        .eq("id", uid).single(),
      supabase.from("workout_plans")
        .select("*").eq("user_id", uid).eq("day", day)
        .order("created_at", { ascending: false }).limit(1).single(),
      supabase.from("workout_plans")
        .select("*").eq("user_id", uid).eq("day", yesterdayDay).eq("is_rest_day", false)
        .order("created_at", { ascending: false }).limit(1).single(),
    ]);

    const profile = profileResult.data as any;
    if (profile?.display_name) setDisplayName(profile.display_name);
    if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
    if (profile?.health_cleared !== undefined) setHealthCleared(profile.health_cleared);
    if (profile?.training_phase) setTrainingPhase(profile.training_phase as TrainingPhase);

    const plan = planResult.data;
    if (planResult.error) {
      console.error("Load today workout error:", planResult.error.message, planResult.error.details);
    }

    if (plan) {
      if (plan.is_rest_day) {
        setTodayWorkout({ day, focus: "Rest", isRestDay: true, exercises: [] });
      } else {
        // ── BATCH 2: Fetch exercises + all last-logged weights in parallel ──
        const { data: planExercises } = await supabase
          .from("workout_plan_exercises")
          .select("*, exercises(*)")
          .eq("workout_plan_id", plan.id)
          .order("order");

        const bodyWeightKg = profile?.weight_kg ?? 70;
        const sex = profile?.sex ?? "male";
        const trainingHistory = profile?.training_history ?? "beginner";

        // Fetch all last-logged weights in parallel instead of one-by-one
        const exerciseIds = (planExercises || []).map((pe: any) => pe.exercise_id);
        const lastLogPromises = exerciseIds.map((exId: string) =>
          supabase.from("set_logs")
            .select("weight_kg, exercise_id")
            .eq("exercise_id", exId).gt("weight_kg", 0)
            .order("created_at", { ascending: false }).limit(1).single()
        );
        const lastLogResults = await Promise.all(lastLogPromises);
        const lastLogMap = new Map<string, number>();
        for (const r of lastLogResults) {
          if (r.data) lastLogMap.set(r.data.exercise_id, r.data.weight_kg);
        }

        const enrichedExercises: ExerciseData[] = (planExercises || []).map((pe: any) => {
          const suggestion = suggestWeight({
            bodyWeightKg,
            sex,
            trainingHistory,
            muscleGroup: pe.exercises?.muscle_group ?? "full_body",
            lastLoggedWeight: lastLogMap.get(pe.exercise_id),
          });

          return {
            exerciseId: pe.exercise_id,
            exerciseName: pe.exercises?.name ?? "Unknown",
            targetSets: pe.target_sets,
            targetReps: pe.target_reps,
            targetRpe: pe.target_rpe ?? 7,
            restSeconds: pe.rest_seconds,
            explainWhy: pe.explain_why ?? "",
            instructions: pe.exercises?.instructions ?? "",
            explainEli5: pe.exercises?.explain_eli5 ?? "",
            animationUrl: pe.exercises?.animation_url ?? null,
            muscleGroup: pe.exercises?.muscle_group ?? "",
            suggestedWeight: suggestion.suggestedKg,
            weightReasoning: suggestion.reasoning,
          };
        });

        // Apply mesocycle periodization (deload weeks, intro ramp-up, etc.)
        const planCreated = plan.created_at ? new Date(plan.created_at) : new Date();
        const weeksSincePlan = Math.max(1, Math.ceil((Date.now() - planCreated.getTime()) / (7 * 24 * 60 * 60 * 1000)));
        const periodizedExercises = enrichedExercises.map((e) => {
          const p = applyPeriodization(e.targetSets, e.targetReps, e.targetRpe, weeksSincePlan);
          return { ...e, targetSets: p.sets, targetReps: p.reps, targetRpe: p.rpe };
        });

        setExerciseData(periodizedExercises);

        const exercises = periodizedExercises.map((e) => ({
          exerciseId: e.exerciseId,
          exerciseName: e.exerciseName,
          targetSets: e.targetSets,
          targetReps: e.targetReps,
          targetRpe: e.targetRpe,
          restSeconds: e.restSeconds,
          explainWhy: e.explainWhy,
        }));

        // ── Injury Assessment (uses profile already fetched in batch 1) ──
        const activeInjuries = (profile?.current_injuries ?? []) as { key: string; severity: "mild" | "moderate" | "severe" }[];

        if (activeInjuries.length > 0) {
          const assessment = assessInjuryForWorkout(activeInjuries, plan.focus);
          setInjuryAssessment(assessment);

          if (assessment.action === "rest") {
            setTodayWorkout({ day, focus: "Rest", isRestDay: true, exercises: [] });
            setExerciseData([]);
            setLoading(false);
            return;
          }

          if (assessment.action === "modify") {
            const safeExercises = enrichedExercises.filter((ex) => {
              const nameLower = ex.exerciseName.toLowerCase();
              for (const pattern of assessment.unsafeExercisePatterns) {
                if (nameLower.includes(pattern.toLowerCase())) return false;
              }
              if (assessment.unsafeMuscleGroups.includes(ex.muscleGroup)) return false;
              return true;
            });
            setExerciseData(safeExercises);
            const safeWorkoutExercises = safeExercises.map((e) => ({
              exerciseId: e.exerciseId, exerciseName: e.exerciseName,
              targetSets: e.targetSets, targetReps: e.targetReps,
              targetRpe: e.targetRpe, restSeconds: e.restSeconds, explainWhy: e.explainWhy,
            }));
            setTodayWorkout({ day, focus: plan.focus, isRestDay: false, exercises: safeWorkoutExercises });
            setLoading(false);
          } else {
            setTodayWorkout({ day, focus: plan.focus, isRestDay: false, exercises });
          }
        } else {
          setInjuryAssessment(null);
          setTodayWorkout({ day, focus: plan.focus, isRestDay: false, exercises });
        }
      }
    } else {
      setTodayWorkout(null);
    }

    // ── Missed workout check (yesterdayPlan already fetched in batch 1) ──
    const yesterdayPlan = yesterdayPlanResult.data;
    if (yesterdayPlan) {
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      const { data: yesterdayLog } = await supabase
        .from("workout_logs")
        .select("id")
        .eq("workout_plan_id", yesterdayPlan.id)
        .gte("started_at", yesterdayStr)
        .limit(1)
        .single();

      if (!yesterdayLog) {
        const missedWorkoutDay = {
          day: yesterdayDay,
          focus: yesterdayPlan.focus,
          isRestDay: false,
          exercises: [],
        };
        setMissedDay(missedWorkoutDay);

        // Fetch all remaining days in parallel instead of one-by-one loop
        const remainingDayNums = Array.from({ length: 7 - day + 1 }, (_, i) => day + i);
        const dayPlanResults = await Promise.all(
          remainingDayNums.map((d) =>
            supabase.from("workout_plans")
              .select("focus, is_rest_day, day")
              .eq("user_id", uid).eq("day", d)
              .order("created_at", { ascending: false }).limit(1).single()
          )
        );

        const remainingDays = dayPlanResults
          .filter((r) => r.data)
          .map((r) => ({
            day: r.data!.day,
            focus: r.data!.focus || "Rest",
            isRestDay: r.data!.is_rest_day,
            exercises: [],
          }));

        const options = getMissedDayOptions(missedWorkoutDay, remainingDays);
        setMissedDayOptions(options);
      }
    }

    setLoading(false);
  };

  const handleLifeHappens = () => {
    Alert.alert(
      "Skip Today?",
      "Are you sure you want to skip today's workout? You can always come back later.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Skip",
          style: "destructive",
          onPress: async () => {
            if (!session?.user?.id || !todayWorkout) return;

            const { data: plan } = await supabase
              .from("workout_plans")
              .select("id")
              .eq("user_id", session.user.id)
              .eq("day", dayOfWeek)
              .order("created_at", { ascending: false })
              .limit(1)
              .single();

            if (plan) {
              await supabase.from("workout_logs").insert({
                user_id: session.user.id,
                workout_plan_id: plan.id,
                skipped: true,
                life_happened: true,
              });
            }

            setTodayWorkout({ ...todayWorkout, isRestDay: true, focus: "Rest Day" });
          },
        },
      ]
    );
  };

  const handleMissedDayChoice = (strategy: MissedDayStrategy) => {
    if (!missedDay) return;
    setMissedDayMessage(
      strategy === "skip"
        ? "One missed day doesn't define your journey. You'll be back stronger today."
        : strategy === "reschedule"
        ? `Your ${missedDay.focus} workout will be moved to your next rest day.`
        : `Key exercises from ${missedDay.focus} will be added to your next session at lighter volume.`
    );
    setMissedDay(null);
    setMissedDayOptions([]);
    // Auto-dismiss message after 5 seconds
    setTimeout(() => setMissedDayMessage(null), 5000);
  };

  const handleReadiness = (level: ReadinessLevel) => {
    setReadiness(level);
    const result = calculateReadiness(level);
    setReadinessMessage(result.message);

    // Modify exerciseData based on readiness level
    if (level === "fresh" || exerciseData.length === 0) {
      // No modifications for fresh readiness
      return;
    }

    if (level === "okay" || level === "sore") {
      // Reduce sets by 1 (min 2)
      const adjusted = exerciseData.map((ex) => ({
        ...ex,
        targetSets: Math.max(2, ex.targetSets - 1),
      }));
      setExerciseData(adjusted);
      setReadinessBannerMessage(level === "okay"
        ? "Slightly adjusted — maintaining intensity"
        : "Adjusted for recovery — lighter session today");
      setReadinessBannerVisible(true);
    } else if (level === "exhausted") {
      // Reduce sets by 1 (min 2) AND reduce suggested weight by 10%
      const adjusted = exerciseData.map((ex) => ({
        ...ex,
        targetSets: Math.max(2, ex.targetSets - 1),
        suggestedWeight: Math.round(ex.suggestedWeight * 0.9),
      }));
      setExerciseData(adjusted);
      setReadinessBannerMessage("Recovery mode — lower intensity today");
      setReadinessBannerVisible(true);
    }
  };

  // Helper: week dates
  const getWeekDates = (): number[] => {
    const now = new Date();
    const dayIdx = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayIdx);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.getDate();
    });
  };
  const weekDates = getWeekDates();
  const WEEK = ["M", "T", "W", "T", "F", "S", "S"];
  const weekNum = Math.ceil(new Date().getDate() / 7);
  const completionPct = dayOfWeek > 1 ? Math.round(((dayOfWeek - 1) / 5) * 100) : 0;

  const handleStartWorkout = () =>
    router.push({ pathname: "/(app)/injury-check" as any, params: { focus: todayWorkout?.focus } });

  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayName = DAY_NAMES[new Date().getDay()];

  // Volume formatting helper
  const formatVolume = (vol: number): string => {
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`;
    if (vol > 0) return `${vol}`;
    return "0";
  };

  const volumeChangePercent = totalVolumeLastWeek > 0
    ? Math.round(((totalVolumeThisWeek - totalVolumeLastWeek) / totalVolumeLastWeek) * 100)
    : totalVolumeThisWeek > 0 ? 100 : 0;

  // ─── Loading ───
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <TopoBackground />
        <HomeSkeleton />
      </View>
    );
  }

  // ─── No plan ───
  if (!todayWorkout) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
        <Text style={{ color: theme.colors.earth, fontSize: 26, fontWeight: "700", marginBottom: 8, letterSpacing: -0.8 }}>
          Welcome to Livvia
        </Text>
        <Text style={{ color: theme.colors.rock, fontSize: 15, textAlign: "center", marginBottom: 28, lineHeight: 22 }}>
          Your personalized workout plan is being prepared. Generate one to begin your workout.
        </Text>
        <Pressable
          onPress={() => router.push("/(app)/generate-plan" as any)}
          style={{ backgroundColor: theme.colors.earth, borderRadius: 22, paddingHorizontal: 32, paddingVertical: 16 }}
        >
          <Text style={{ color: theme.colors.bg, fontSize: 16, fontWeight: "700" }}>Generate My Plan</Text>
        </Pressable>
      </View>
    );
  }

  // ─── Rest day ───
  if (todayWorkout.isRestDay) {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    const tip = EDUCATIONAL_TIPS[dayOfYear % EDUCATIONAL_TIPS.length];
    const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const now = new Date();
    const dateStr = `${MONTH_NAMES[now.getMonth()]} ${now.getDate()}`;

    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <TopoBackground />
        {/* FIXED PROFILE ROW */}
        <View style={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 12, flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: theme.colors.bg, zIndex: 10 }}>
          <Pressable onPress={() => setShowAvatarPicker(true)}>
            <Avatar
              avatarUrl={avatarUrl}
              fallbackLetter={displayName?.[0] ?? session?.user?.email?.[0] ?? "L"}
              size={44}
            />
          </Pressable>
          <View>
            <Text style={{ fontSize: 14, color: theme.colors.rock }}>
              {(() => { const h = new Date().getHours(); return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening"; })()}
            </Text>
            <Text style={{ fontSize: 17, fontWeight: "700", color: theme.colors.earth }}>
              {displayName ?? session?.user?.email?.split("@")[0] ?? "Athlete"}
            </Text>
          </View>
        </View>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.earth} />}
        >
          {/* HEALTH ADVISORY */}
          {!healthCleared && (
            <View style={{
              backgroundColor: "rgba(245,158,11,0.08)", borderRadius: 14, padding: 14,
              marginHorizontal: 24, marginBottom: 12,
              borderWidth: 1, borderColor: "rgba(245,158,11,0.15)",
            }}>
              <Text style={{ fontSize: 12, color: "#92400E", lineHeight: 18 }}>
                Based on your health screening, we recommend consulting a doctor before intense exercise. Listen to your body.
              </Text>
            </View>
          )}

          {/* HERO — matches workout day pattern */}
          <View style={{ paddingHorizontal: 24 }}>
            <Text style={{ fontSize: 11, fontWeight: "600", textTransform: "uppercase", color: theme.colors.rock, letterSpacing: 1.2, marginBottom: 10 }}>
              {todayName} · {dateStr} · Week {weekNum}
            </Text>
            <Text style={{ fontSize: 26, fontWeight: "700", color: theme.colors.earth, letterSpacing: -0.8, lineHeight: 34 }}>
              Rest day. <Text style={{ color: theme.colors.trail }}>Recover.</Text>
            </Text>
          </View>

          <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
            {/* Injury Rest Banner — only shown when injury forced the rest day */}
            {injuryAssessment?.action === "rest" && (
              <View style={{ backgroundColor: "#FEF3C7", borderRadius: 22, padding: 22, marginBottom: 12, borderWidth: 1, borderColor: "rgba(245,158,11,0.2)" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <Text style={{ fontSize: 18 }}>⚠️</Text>
                  <Text style={{ fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.5, color: "#B45309" }}>
                    Injury Rest Day
                  </Text>
                </View>
                <Text style={{ fontSize: 15, fontWeight: "700", color: "#92400E", marginBottom: 8, lineHeight: 21 }}>
                  {injuryAssessment.triggeringInjuries.map(i => i.label).join(", ")} — {injuryAssessment.triggeringInjuries[0]?.severity} severity
                </Text>
                <Text style={{ fontSize: 14, color: "#92400E", lineHeight: 21, opacity: 0.8 }}>
                  {injuryAssessment.reason}
                </Text>
                {injuryAssessment.recoveryTip.length > 0 && (
                  <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(245,158,11,0.15)" }}>
                    <Text style={{ fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, color: "#B45309", marginBottom: 6 }}>
                      Recovery Tips
                    </Text>
                    <Text style={{ fontSize: 13, color: "#92400E", lineHeight: 20, opacity: 0.8 }}>
                      {injuryAssessment.recoveryTip}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Recovery Focus Card */}
            <View style={{ backgroundColor: theme.colors.stone, borderRadius: 22, padding: 22, marginBottom: 12 }}>
              <Text style={{ fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.5, color: theme.colors.trail, marginBottom: 12 }}>
                Recovery Focus
              </Text>
              <Text style={{ fontSize: 17, fontWeight: "700", color: theme.colors.earth, marginBottom: 8, lineHeight: 23 }}>
                Stay hydrated, sleep deep, hit your protein.
              </Text>
              <Text style={{ fontSize: 14, color: theme.colors.rock, lineHeight: 22 }}>
                Your muscles are repairing from yesterday's session. Give them what they need.
              </Text>
            </View>

            {/* Daily Tip Card */}
            <View style={{ backgroundColor: theme.colors.stone, borderRadius: 22, padding: 22, marginBottom: 12 }}>
              <View style={{ backgroundColor: "rgba(52,211,153,0.08)", alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 14 }}>
                <Text style={{ fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.2, color: theme.colors.trail }}>
                  Daily Tip
                </Text>
              </View>
              <Text style={{ fontSize: 17, fontWeight: "700", color: theme.colors.earth, marginBottom: 8, lineHeight: 23 }}>
                {tip.title}
              </Text>
              <Text style={{ fontSize: 14, color: theme.colors.rock, lineHeight: 22 }}>
                {tip.body}
              </Text>
            </View>

            {/* Wellness CTA */}
            {!hasWellnessLog && (
              <Pressable
                onPress={() => router.push("/(app)/wellness" as any)}
                style={{ backgroundColor: theme.colors.earth, borderRadius: 16, paddingVertical: 17, alignItems: "center", width: "100%" }}
              >
                <Text style={{ color: theme.colors.bg, fontSize: 15, fontWeight: "600" }}>Log Wellness Check</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ─── Main workout view ───
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <TopoBackground />
      {/* FIXED PROFILE ROW */}
      <View style={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 12, flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: theme.colors.bg, zIndex: 10 }}>
        <Pressable onPress={() => setShowAvatarPicker(true)}>
          <Avatar
            avatarUrl={avatarUrl}
            fallbackLetter={displayName?.[0] ?? session?.user?.email?.[0] ?? "L"}
            size={44}
          />
        </Pressable>
        <View>
          <Text style={{ fontSize: 14, color: theme.colors.rock }}>
            {(() => { const h = new Date().getHours(); return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening"; })()}
          </Text>
          <Text style={{ fontSize: 17, fontWeight: "700", color: theme.colors.earth }}>
            {displayName ?? session?.user?.email?.split("@")[0] ?? "Athlete"}
          </Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 180 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.earth} />}
      >
        {/* HEALTH ADVISORY */}
        {!healthCleared && (
          <View style={{
            backgroundColor: "rgba(245,158,11,0.08)", borderRadius: 14, padding: 14,
            marginHorizontal: 24, marginBottom: 12,
            borderWidth: 1, borderColor: "rgba(245,158,11,0.15)",
          }}>
            <Text style={{ fontSize: 12, color: "#92400E", lineHeight: 18 }}>
              Based on your health screening, we recommend consulting a doctor before intense exercise. Listen to your body.
            </Text>
          </View>
        )}

        {/* TRAINING PHASE BADGE */}
        {trainingPhase && trainingPhase !== "hypertrophy" && (
          <View style={{
            alignSelf: "flex-start", marginLeft: 24, marginBottom: 8,
            backgroundColor: "rgba(52,211,153,0.1)", borderRadius: 10,
            paddingHorizontal: 10, paddingVertical: 5,
          }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: theme.colors.trail, textTransform: "uppercase", letterSpacing: 1 }}>
              {TRAINING_PHASES[trainingPhase]?.name ?? "Training"}
            </Text>
          </View>
        )}

        {/* 2. PERSONAL HERO */}
        <View style={{ paddingHorizontal: 24 }}>
          <Text style={{ fontSize: 11, fontWeight: "600", textTransform: "uppercase", color: theme.colors.rock, letterSpacing: 1.2, marginBottom: 10 }}>
            {todayName} · {todayWorkout.focus} · Week {weekNum}
          </Text>
          <Text style={{ fontSize: 26, fontWeight: "700", color: theme.colors.earth, letterSpacing: -0.8, lineHeight: 34 }}>
            {exerciseData.length} exercises today.{" "}
            <Text style={{ color: theme.colors.trail }}>Let's climb.</Text>
          </Text>
        </View>

        {/* READINESS ADJUSTMENT BANNER */}
        {readinessBannerVisible && readinessBannerMessage && readiness && (
          <Pressable
            onPress={() => setReadinessBannerVisible(false)}
            style={{
              marginHorizontal: 24,
              marginTop: 12,
              backgroundColor: theme.colors.stone,
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 10,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: theme.colors.rock, lineHeight: 18 }}>
                {readinessBannerMessage}
              </Text>
              <Text style={{ fontSize: 10, color: theme.colors.rock, marginTop: 2, opacity: 0.6 }}>
                Readiness: {readiness} · tap to dismiss
              </Text>
            </View>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: readiness === "sore" ? "#F59E0B" : readiness === "exhausted" ? "#EF4444" : "#F59E0B",
                marginLeft: 10,
              }}
            />
          </Pressable>
        )}

        {/* INJURY MODIFICATION BANNER */}
        {injuryAssessment?.action === "modify" && (
          <View style={{
            marginHorizontal: 24, marginTop: 12, backgroundColor: "#FEF3C7",
            borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
            borderWidth: 1, borderColor: "rgba(245,158,11,0.15)",
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <Text style={{ fontSize: 14 }}>⚠️</Text>
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#B45309" }}>
                Workout Modified — {injuryAssessment.triggeringInjuries.map(i => i.label).join(", ")}
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: "#92400E", lineHeight: 18 }}>
              {injuryAssessment.reason}
            </Text>
          </View>
        )}

        {/* 3. BENTO WIDGETS */}
        <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: 24, paddingTop: 20 }}>
          {/* STREAK */}
          <BentoWidget variant="stone" style={{ flex: 1, height: 108, justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 26, fontWeight: "800", color: theme.colors.earth, letterSpacing: -0.5 }}>
                  {statsLoading ? "-" : dayStreak}
                </Text>
                <Image source={require("../../assets/fire.png")} style={{ width: 20, height: 20 }} resizeMode="contain" />
              </View>
              <View style={{ height: 15 }} />
            </View>
            <Text style={{ fontSize: 9, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.8, color: theme.colors.rock }}>
              Streak
            </Text>
          </BentoWidget>

          {/* THIS WEEK */}
          <BentoWidget variant="stone" style={{ flex: 1, height: 108, justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                <Text style={{ fontSize: 26, fontWeight: "800", color: theme.colors.earth, letterSpacing: -0.5 }}>
                  {statsLoading ? "-" : weekWorkoutCount}
                </Text>
                <Text style={{ fontSize: 13, fontWeight: "600", color: theme.colors.rock }}>
                  / {weekPlannedCount || 4}
                </Text>
              </View>
              <View style={{ height: 15 }} />
            </View>
            <Text style={{ fontSize: 9, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.8, color: theme.colors.rock }}>
              This week
            </Text>
          </BentoWidget>

          {/* TOP WEIGHT */}
          <BentoWidget variant="stone" style={{ flex: 1, height: 108, justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                <Text style={{ fontSize: 26, fontWeight: "800", color: theme.colors.earth, letterSpacing: -0.5 }}>
                  {statsLoading ? "-" : topWeight ? `${Math.round(topWeight.weight)}` : "0"}
                </Text>
                <Text style={{ fontSize: 13, fontWeight: "600", color: theme.colors.rock }}>kg</Text>
              </View>
              {!statsLoading && topWeight ? (
                <Text style={{ fontSize: 11, fontWeight: "700", color: theme.colors.accent, marginTop: 4 }} numberOfLines={1}>
                  {topWeight.exercise}
                </Text>
              ) : (
                <View style={{ height: 15 }} />
              )}
            </View>
            <Text style={{ fontSize: 9, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.8, color: theme.colors.rock }}>
              Top weight
            </Text>
          </BentoWidget>
        </View>

        {/* 4. VOLUME CHART */}
        <View style={{ marginHorizontal: 24, marginTop: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: theme.colors.earth }}>Weekly Volume</Text>
            <Text style={{ fontSize: 11, color: theme.colors.rock }}>kg per day</Text>
          </View>
          <VolumeChart data={weekVolumeData} />
        </View>

        {/* 5. TRAIL SECTION */}
        <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: theme.colors.earth }}>Today's Route</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Pressable
                onPress={openAdaptModal}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 100,
                  backgroundColor: "rgba(52,211,153,0.08)",
                  borderWidth: 1,
                  borderColor: "rgba(52,211,153,0.15)",
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: "600", color: theme.colors.trail }}>Adapt</Text>
              </Pressable>
              <Text style={{ fontSize: 11, color: theme.colors.rock }}>
                {exerciseData.length} · ~45 min
              </Text>
            </View>
          </View>

          <View style={{ position: "relative" }}>
            <TrailLine />

            {exerciseData.map((ex, i) => {
              const isFirst = i === 0;
              return (
                <View key={ex.exerciseId + i} style={{ flexDirection: "row", gap: 14, marginBottom: 14 }}>
                  {/* Waypoint dot */}
                  <View style={{ width: 32, alignItems: "center", paddingTop: 18 }}>
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        borderWidth: 2,
                        borderColor: isFirst ? theme.colors.trail : "#DDD9CE",
                        backgroundColor: isFirst ? "rgba(52,211,153,0.06)" : theme.colors.bg,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 9,
                          fontWeight: "700",
                          color: isFirst ? theme.colors.trail : theme.colors.rock,
                        }}
                      >
                        {i + 1}
                      </Text>
                    </View>
                  </View>

                  {/* Exercise card */}
                  <View style={{ flex: 1 }}>
                    <ExpandableExerciseCard
                      exerciseName={ex.exerciseName}
                      targetSets={ex.targetSets}
                      targetReps={ex.targetReps}
                      muscleGroup={ex.muscleGroup}
                      suggestedWeight={ex.suggestedWeight}
                      isOpen={openCardIndex === i}
                      onToggle={() => setOpenCardIndex(openCardIndex === i ? null : i)}
                      instructions={ex.instructions}
                    />
                  </View>
                </View>
              );
            })}

            {/* Finish marker */}
            <View style={{ flexDirection: "row", gap: 14, marginBottom: 8, paddingLeft: 2 }}>
              <View style={{ width: 32, alignItems: "center", paddingTop: 4 }}>
                <Text style={{ fontSize: 16 }}>{"\u{1F3C1}"}</Text>
              </View>
              <View style={{ flex: 1, justifyContent: "center" }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: theme.colors.rock }}>
                  Summit — complete all {exerciseData.length}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 6. SECONDARY BUTTONS */}
        <View style={{ flexDirection: "row", gap: 12, paddingHorizontal: 24, marginTop: 4 }}>
          {!hasWellnessLog && (
            <Pressable
              onPress={() => router.push("/(app)/wellness" as any)}
              style={{ flex: 1, backgroundColor: theme.colors.stone, borderRadius: 18, paddingVertical: 16, alignItems: "center" }}
            >
              <Text style={{ color: theme.colors.rock, fontSize: 14, fontWeight: "500" }}>Wellness Check</Text>
            </Pressable>
          )}
          <Pressable
            onPress={handleLifeHappens}
            style={{ flex: 1, backgroundColor: theme.colors.stone, borderRadius: 18, paddingVertical: 16, alignItems: "center" }}
          >
            <Text style={{ color: theme.colors.rock, fontSize: 14, fontWeight: "500" }}>Skip Today</Text>
          </Pressable>
        </View>

        {/* 7. MISSED DAY */}
        {missedDay && missedDayOptions.length > 0 && (
          <View style={{ marginHorizontal: 24, marginTop: 16, backgroundColor: theme.colors.stone, borderRadius: 18, padding: 16 }}>
            <Text style={{ color: "#F59E0B", fontSize: 13, fontWeight: "600", marginBottom: 10 }}>
              Missed {missedDay.focus} yesterday
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {missedDayOptions.map((option) => (
                <Pressable
                  key={option.strategy}
                  onPress={() => handleMissedDayChoice(option.strategy)}
                  style={{ flex: 1, backgroundColor: theme.colors.bg, borderRadius: 12, paddingVertical: 10, alignItems: "center" }}
                >
                  <Text style={{ color: theme.colors.earth, fontSize: 12, fontWeight: "600" }}>{option.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
        {missedDayMessage && (
          <Pressable
            onPress={() => setMissedDayMessage(null)}
            style={{ marginHorizontal: 24, marginTop: 12, backgroundColor: theme.colors.stone, borderRadius: 14, padding: 14 }}
          >
            <Text style={{ color: theme.colors.rock, fontSize: 13 }}>{missedDayMessage}</Text>
          </Pressable>
        )}
      </ScrollView>

      {/* 8. FLOATING CTA */}
      <View style={{ position: "absolute", bottom: 98, left: 20, right: 20 }}>
        <Pressable
          onPress={handleStartWorkout}
          style={{
            backgroundColor: theme.colors.earth,
            borderRadius: 22,
            paddingVertical: 18,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <Text style={{ color: theme.colors.bg, fontSize: 16, fontWeight: "700" }}>
            Begin Workout ↗
          </Text>
        </Pressable>
      </View>

      {/* ─── ADAPT MODAL ─── */}
      <Modal
        visible={adaptVisible}
        transparent
        animationType="none"
        onRequestClose={closeAdaptModal}
      >
        <Pressable
          onPress={closeAdaptModal}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}
        >
          <Animated.View
            style={{
              backgroundColor: theme.colors.bg,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 12,
              paddingBottom: 40,
              paddingHorizontal: 24,
              transform: [{
                translateY: adaptSlide.interpolate({
                  inputRange: [0, 1],
                  outputRange: [400, 0],
                }),
              }],
            }}
          >
            {/* Handle bar */}
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={{ alignItems: "center", marginBottom: 20 }}>
                <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: theme.colors.stone }} />
              </View>

              {/* ─── MAIN MENU ─── */}
              {adaptSection === "main" && (
                <View>
                  <Text style={{ fontSize: 18, fontWeight: "700", color: theme.colors.earth, marginBottom: 4 }}>
                    Adapt Workout
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.colors.rock, marginBottom: 20 }}>
                    Life happens. Adjust today's session.
                  </Text>

                  <Pressable
                    onPress={() => setAdaptSection("equipment")}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: theme.colors.stone,
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 10,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: theme.colors.earth }}>Change Equipment</Text>
                      <Text style={{ fontSize: 11, color: theme.colors.rock, marginTop: 2 }}>Traveling, home gym, outdoors</Text>
                    </View>
                    <Text style={{ fontSize: 14, color: theme.colors.rock }}>›</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setAdaptSection("focus")}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: theme.colors.stone,
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 10,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: theme.colors.earth }}>Swap Focus</Text>
                      <Text style={{ fontSize: 11, color: theme.colors.rock, marginTop: 2 }}>Train a different muscle group today</Text>
                    </View>
                    <Text style={{ fontSize: 14, color: theme.colors.rock }}>›</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setAdaptSection("express")}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: theme.colors.stone,
                      borderRadius: 16,
                      padding: 16,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: theme.colors.earth }}>Express Mode</Text>
                      <Text style={{ fontSize: 11, color: theme.colors.rock, marginTop: 2 }}>Short on time? Trim to essentials</Text>
                    </View>
                    <Text style={{ fontSize: 14, color: theme.colors.rock }}>›</Text>
                  </Pressable>
                </View>
              )}

              {/* ─── EQUIPMENT PRESETS ─── */}
              {adaptSection === "equipment" && (
                <View>
                  <Pressable onPress={() => setAdaptSection("main")} style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 12, color: theme.colors.rock }}>‹ Back</Text>
                  </Pressable>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: theme.colors.earth, marginBottom: 4 }}>
                    What equipment do you have?
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.colors.rock, marginBottom: 16 }}>
                    Exercises will adapt to match.
                  </Text>

                  {EQUIPMENT_PRESETS.map((preset) => (
                    <Pressable
                      key={preset.id}
                      onPress={() => handleEquipmentSwitch(preset.id)}
                      disabled={adaptLoading}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: activeEquipment === preset.id ? theme.colors.earth : theme.colors.stone,
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 10,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: activeEquipment === preset.id ? theme.colors.bg : theme.colors.earth,
                        }}>
                          {preset.label}
                        </Text>
                        <Text style={{
                          fontSize: 11,
                          color: activeEquipment === preset.id ? "rgba(246,245,240,0.4)" : theme.colors.rock,
                          marginTop: 2,
                        }}>
                          {preset.desc}
                        </Text>
                      </View>
                      {activeEquipment === preset.id && (
                        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: theme.colors.trail, alignItems: "center", justifyContent: "center" }}>
                          <Text style={{ fontSize: 10, color: "#fff", fontWeight: "700" }}>✓</Text>
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
              )}

              {/* ─── FOCUS SWAP ─── */}
              {adaptSection === "focus" && (
                <View>
                  <Pressable onPress={() => setAdaptSection("main")} style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 12, color: theme.colors.rock }}>‹ Back</Text>
                  </Pressable>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: theme.colors.earth, marginBottom: 4 }}>
                    What do you want to train?
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.colors.rock, marginBottom: 16 }}>
                    Current: {todayWorkout?.focus}
                  </Text>

                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {FOCUS_OPTIONS.filter((f) => f !== todayWorkout?.focus).map((focus) => (
                      <Pressable
                        key={focus}
                        onPress={() => handleFocusSwap(focus)}
                        disabled={adaptLoading}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          borderRadius: 14,
                          backgroundColor: theme.colors.stone,
                        }}
                      >
                        <Text style={{ fontSize: 13, fontWeight: "600", color: theme.colors.earth }}>{focus}</Text>
                      </Pressable>
                    ))}
                  </View>

                  {/* Week overview */}
                  {weekPlan.length > 0 && (
                    <View style={{ marginTop: 20 }}>
                      <Text style={{ fontSize: 10, fontWeight: "600", color: theme.colors.rock, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>
                        This week's plan
                      </Text>
                      {weekPlan.map((p) => {
                        const dayNames = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                        const isToday = p.day === dayOfWeek;
                        return (
                          <View
                            key={p.day}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              paddingVertical: 6,
                              opacity: p.isRest ? 0.4 : 1,
                            }}
                          >
                            <Text style={{ width: 36, fontSize: 11, fontWeight: isToday ? "700" : "500", color: isToday ? theme.colors.trail : theme.colors.rock }}>
                              {dayNames[p.day]}
                            </Text>
                            <Text style={{ fontSize: 12, color: isToday ? theme.colors.earth : theme.colors.rock, fontWeight: isToday ? "600" : "400" }}>
                              {p.isRest ? "Rest" : p.focus}
                            </Text>
                            {isToday && <Text style={{ fontSize: 9, color: theme.colors.trail, marginLeft: 6 }}>← today</Text>}
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              )}

              {/* ─── EXPRESS MODE ─── */}
              {adaptSection === "express" && (
                <View>
                  <Pressable onPress={() => setAdaptSection("main")} style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 12, color: theme.colors.rock }}>‹ Back</Text>
                  </Pressable>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: theme.colors.earth, marginBottom: 4 }}>
                    How much time do you have?
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.colors.rock, marginBottom: 16 }}>
                    Compounds first. Same muscles, less time.
                  </Text>

                  {EXPRESS_DURATIONS.map((dur) => (
                    <Pressable
                      key={dur.minutes}
                      onPress={() => handleExpressMode(dur.minutes)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: theme.colors.stone,
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 10,
                      }}
                    >
                      <View>
                        <Text style={{ fontSize: 14, fontWeight: "600", color: theme.colors.earth }}>{dur.label}</Text>
                        <Text style={{ fontSize: 11, color: theme.colors.rock, marginTop: 2 }}>{dur.desc}</Text>
                      </View>
                      <Text style={{ fontSize: 20, fontWeight: "800", color: theme.colors.earth }}>{dur.minutes}</Text>
                    </Pressable>
                  ))}
                </View>
              )}

              {adaptLoading && (
                <View style={{ alignItems: "center", paddingVertical: 16 }}>
                  <ActivityIndicator color={theme.colors.earth} />
                  <Text style={{ fontSize: 12, color: theme.colors.rock, marginTop: 8 }}>Adapting workout...</Text>
                </View>
              )}
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* Avatar Picker */}
      <AvatarPicker
        visible={showAvatarPicker}
        userId={session?.user?.id ?? ""}
        currentAvatar={avatarUrl}
        displayName={displayName ?? session?.user?.email?.split("@")[0] ?? "Athlete"}
        onClose={() => setShowAvatarPicker(false)}
        onAvatarChanged={(url) => setAvatarUrl(url || null)}
      />
    </View>
  );
}
