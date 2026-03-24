import { View, Text, Pressable, ScrollView, ActivityIndicator, RefreshControl, Alert } from "react-native";
import { router } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { useAuthStore, suggestWeight, EDUCATIONAL_TIPS, calculateReadiness, type ReadinessLevel, getMissedDayOptions, handleMissedDay } from "@repped/shared";
import type { MissedDayOption, MissedDayStrategy } from "@repped/shared";
import { supabase } from "../../src/lib/supabase";
import type { WorkoutDay } from "@repped/shared";
import { theme } from "../../src/lib/styles";
import { TopoBackground, BentoWidget, AliveDot, VolumeChart, ExpandableExerciseCard, TrailLine } from "../../src/components/terrain";
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
  const [openCardIndex, setOpenCardIndex] = useState<number | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTodaysWorkout();
    await checkWellnessLog();
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

  const loadTodaysWorkout = async () => {
    if (!session?.user?.id) return;
    setLoading(true);

    // Get current day of week (1=Monday, 7=Sunday)
    const now = new Date();
    const day = now.getDay() === 0 ? 7 : now.getDay();
    setDayOfWeek(day);

    // Fetch today's workout plan
    const { data: plan } = await supabase
      .from("workout_plans")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("day", day)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (plan) {
      if (plan.is_rest_day) {
        setTodayWorkout({ day, focus: "Rest", isRestDay: true, exercises: [] });
      } else {
        // Fetch exercises for this plan with full exercise details
        const { data: planExercises } = await supabase
          .from("workout_plan_exercises")
          .select("*, exercises(*)")
          .eq("workout_plan_id", plan.id)
          .order("order");

        // Fetch user profile for weight suggestions
        const { data: profile } = await supabase
          .from("profiles")
          .select("body_weight_kg, sex, training_history")
          .eq("id", session.user.id)
          .single();

        const bodyWeightKg = profile?.body_weight_kg ?? 70;
        const sex = profile?.sex ?? "male";
        const trainingHistory = profile?.training_history ?? "beginner";

        const enrichedExercises: ExerciseData[] = [];

        for (const pe of planExercises || []) {
          // Get last logged weight for this exercise
          const { data: lastLog } = await supabase
            .from("set_logs")
            .select("weight_kg")
            .eq("exercise_id", pe.exercise_id)
            .gt("weight_kg", 0)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          const suggestion = suggestWeight({
            bodyWeightKg,
            sex,
            trainingHistory,
            muscleGroup: pe.exercises?.muscle_group ?? "full_body",
            lastLoggedWeight: lastLog?.weight_kg,
          });

          enrichedExercises.push({
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
          });
        }

        setExerciseData(enrichedExercises);

        const exercises = enrichedExercises.map((e) => ({
          exerciseId: e.exerciseId,
          exerciseName: e.exerciseName,
          targetSets: e.targetSets,
          targetReps: e.targetReps,
          targetRpe: e.targetRpe,
          restSeconds: e.restSeconds,
          explainWhy: e.explainWhy,
        }));

        setTodayWorkout({ day, focus: plan.focus, isRestDay: false, exercises });
      }
    } else {
      setTodayWorkout(null);
    }

    // Check for missed workout from yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDay = yesterday.getDay() === 0 ? 7 : yesterday.getDay();

    const { data: yesterdayPlan } = await supabase
      .from("workout_plans")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("day", yesterdayDay)
      .eq("is_rest_day", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (yesterdayPlan) {
      // Check if yesterday's workout was completed
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      const { data: yesterdayLog } = await supabase
        .from("workout_logs")
        .select("id")
        .eq("workout_plan_id", yesterdayPlan.id)
        .gte("started_at", yesterdayStr)
        .limit(1)
        .single();

      if (!yesterdayLog) {
        // Yesterday's workout was missed
        const missedWorkoutDay = {
          day: yesterdayDay,
          focus: yesterdayPlan.focus,
          isRestDay: false,
          exercises: [], // We just need the focus for the options
        };
        setMissedDay(missedWorkoutDay);

        // Get remaining days of the week
        const remainingDays = [];
        for (let d = day; d <= 7; d++) {
          const { data: dayPlan } = await supabase
            .from("workout_plans")
            .select("focus, is_rest_day, day")
            .eq("user_id", session.user.id)
            .eq("day", d)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();
          if (dayPlan) {
            remainingDays.push({
              day: d,
              focus: dayPlan.focus || "Rest",
              isRestDay: dayPlan.is_rest_day,
              exercises: [],
            });
          }
        }

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

  // Volume chart mock data (will be replaced with real Supabase data)
  const weekVolumeData: DayData[] = [
    { day: "Mon", volume: 3200, status: dayOfWeek > 1 ? "done" : dayOfWeek === 1 ? "today" : "future", label: "3.2k" },
    { day: "Tue", volume: 4100, status: dayOfWeek > 2 ? "done" : dayOfWeek === 2 ? "today" : "future", label: "4.1k" },
    { day: "Wed", volume: 0, status: dayOfWeek > 3 ? "done" : dayOfWeek === 3 ? "today" : "future", label: "rest" },
    { day: "Thu", volume: 5100, status: dayOfWeek > 4 ? "done" : dayOfWeek === 4 ? "today" : "future", label: "5.1k" },
    { day: "Fri", volume: 3800, status: dayOfWeek > 5 ? "done" : dayOfWeek === 5 ? "today" : "future", label: dayOfWeek === 5 ? "today" : "3.8k" },
    { day: "Sat", volume: 4500, status: dayOfWeek > 6 ? "done" : dayOfWeek === 6 ? "today" : "future", label: "plan" },
    { day: "Sun", volume: 0, status: "future", label: "rest" },
  ];

  // ─── Loading ───
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.earth} />
      </View>
    );
  }

  // ─── No plan ───
  if (!todayWorkout) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
        <Text style={{ color: theme.colors.earth, fontSize: 26, fontWeight: "700", marginBottom: 8, letterSpacing: -0.8 }}>
          Welcome to Repped
        </Text>
        <Text style={{ color: theme.colors.rock, fontSize: 15, textAlign: "center", marginBottom: 28, lineHeight: 22 }}>
          Your personalized workout plan is being prepared. Generate one to begin your ascent.
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

    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <TopoBackground />
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.earth} />}
        >
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24, paddingTop: 80 }}>
            <Text style={{ color: theme.colors.earth, fontSize: 26, fontWeight: "700", marginBottom: 6, letterSpacing: -0.8 }}>
              Rest Day
            </Text>
            <Text style={{ color: theme.colors.rock, fontSize: 14, textAlign: "center", marginBottom: 4 }}>
              You've earned this. Recovery is growth.
            </Text>
            <Text style={{ color: theme.colors.rock, fontSize: 15, textAlign: "center", marginBottom: 24, lineHeight: 22 }}>
              Recovery is where the gains happen. Take it easy today.
            </Text>

            <View style={{ backgroundColor: theme.colors.stone, borderRadius: 18, padding: 20, width: "100%", marginBottom: 16 }}>
              <Text style={{ color: theme.colors.earth, fontSize: 14, lineHeight: 22 }}>
                Stay hydrated, get quality sleep, and hit your protein target.
              </Text>
            </View>

            <View style={{ backgroundColor: theme.colors.stone, borderRadius: 18, padding: 20, width: "100%", marginBottom: 16 }}>
              <Text style={{ color: theme.colors.trail, fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>
                Daily Tip
              </Text>
              <Text style={{ color: theme.colors.earth, fontSize: 17, fontWeight: "600", marginBottom: 6 }}>{tip.title}</Text>
              <Text style={{ color: theme.colors.rock, fontSize: 13, lineHeight: 20 }}>{tip.body}</Text>
            </View>

            {!hasWellnessLog && (
              <Pressable
                onPress={() => router.push("/(app)/wellness" as any)}
                style={{ backgroundColor: theme.colors.stone, borderRadius: 18, paddingVertical: 16, alignItems: "center", width: "100%" }}
              >
                <Text style={{ color: theme.colors.rock, fontSize: 14, fontWeight: "600" }}>Log Wellness Check</Text>
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
      <ScrollView
        contentContainerStyle={{ paddingBottom: 180 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.earth} />}
      >
        {/* 1. STATUS BAR */}
        <View style={{ paddingTop: 54, paddingHorizontal: 24, flexDirection: "row", justifyContent: "flex-end", alignItems: "center" }}>
          <AliveDot label="Fresh" />
        </View>

        {/* 2. PERSONAL HERO */}
        <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
          <Text style={{ fontSize: 11, fontWeight: "600", textTransform: "uppercase", color: theme.colors.rock, letterSpacing: 1.2, marginBottom: 10 }}>
            {todayName} · {todayWorkout.focus} · Week {weekNum}
          </Text>
          <Text style={{ fontSize: 26, fontWeight: "700", color: theme.colors.earth, letterSpacing: -0.8, lineHeight: 34 }}>
            {exerciseData.length} exercises today.{" "}
            <Text style={{ color: theme.colors.trail }}>Let's climb.</Text>
          </Text>
        </View>

        {/* 3. BENTO WIDGETS */}
        <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: 24, paddingTop: 20 }}>
          <BentoWidget variant="dark" style={{ flex: 1 }}>
            <Text style={{ fontSize: 32, fontWeight: "800", color: theme.colors.bg }}>0</Text>
            <Text style={{ fontSize: 9, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.8, color: theme.colors.rock, marginTop: 2 }}>
              Day streak
            </Text>
          </BentoWidget>
          <BentoWidget variant="stone" style={{ flex: 1 }}>
            <Text style={{ fontSize: 32, fontWeight: "800", color: theme.colors.earth }}>
              {Math.min(dayOfWeek - 1, 4)}/{4}
            </Text>
            <Text style={{ fontSize: 9, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.8, color: theme.colors.rock, marginTop: 2 }}>
              This week
            </Text>
          </BentoWidget>
          <BentoWidget variant="stone" style={{ flex: 1 }}>
            <Text style={{ fontSize: 32, fontWeight: "800", color: theme.colors.earth }}>12.4k</Text>
            <Text style={{ fontSize: 9, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.8, color: theme.colors.trail, marginTop: 2 }}>
              {"▲ 12%"}
            </Text>
            <Text style={{ fontSize: 9, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.8, color: theme.colors.rock, marginTop: 2 }}>
              Volume kg
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
            <Text style={{ fontSize: 11, color: theme.colors.rock }}>
              {exerciseData.length} waypoints · ~45 min
            </Text>
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
            Begin Ascent ↗
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
