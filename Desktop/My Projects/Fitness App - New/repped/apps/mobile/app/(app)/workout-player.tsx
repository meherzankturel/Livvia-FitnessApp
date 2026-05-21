import { View, Text, Pressable, TextInput, Vibration, ScrollView, Animated } from "react-native";
import { router } from "expo-router";
import { useState, useEffect, useRef } from "react";
import {
  useAuthStore,
  formatDuration,
  suggestWeight,
  findAlternatives,
  detectPersonalRecord,
  getFocusCue,
  generateFinisher,
  getFinisherCoreNames,
  calculateProgression,
} from "@repped/shared";
import type { Exercise, MuscleGroup, FinisherBlock } from "@repped/shared";
import { supabase } from "../../src/lib/supabase";
import { theme, muscleTints } from "../../src/lib/styles";
import { TopoBackground } from "../../src/components/terrain";
import { BentoWidget } from "../../src/components/terrain";
import ExerciseSwapModal from "../../src/components/ExerciseSwapModal";

// ─── Color shortcuts ────────────────────────────────────────────────────────
const C = theme.colors;

interface ExerciseData {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  targetReps: number;
  restSeconds: number;
  explainWhy: string;
  muscleGroup: string;
  difficulty: string;
  suggestedWeight: number;
  weightReasoning: string;
}

interface LoggedSet {
  setNumber: number;
  reps: number;
  weightKg: number;
}

interface PreviousData {
  sets: { reps: number; weight_kg: number }[];
}

export default function WorkoutPlayer() {
  const session = useAuthStore((s) => s.session);
  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [repsInput, setRepsInput] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [resting, setResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [workoutLogId, setWorkoutLogId] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const [completed, setCompleted] = useState(false);
  const [focus, setFocus] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Elapsed workout timer
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Logged sets for current exercise (table view)
  const [loggedSets, setLoggedSets] = useState<LoggedSet[]>([]);

  // Previous session data per exercise
  const [previousData, setPreviousData] = useState<Record<string, PreviousData>>({});

  // Set completion animation
  const [showCheck, setShowCheck] = useState(false);
  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Swap modal state
  const [swapVisible, setSwapVisible] = useState(false);
  const [swapAlternatives, setSwapAlternatives] = useState<Exercise[]>([]);

  // PR detection state
  const [prMessage, setPrMessage] = useState<string | null>(null);
  const prTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Progression suggestion state
  const [progressionMsg, setProgressionMsg] = useState<string | null>(null);
  const progressionOpacity = useRef(new Animated.Value(0)).current;
  const progressionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Finisher state
  const [showFinisher, setShowFinisher] = useState(false);
  const [finisher, setFinisher] = useState<FinisherBlock | null>(null);
  const [finisherExIdx, setFinisherExIdx] = useState(0);
  const [finisherTimeLeft, setFinisherTimeLeft] = useState(0);
  const [finisherActive, setFinisherActive] = useState(false);
  const [finisherDone, setFinisherDone] = useState(false);
  const finisherTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // RPE tracking state
  const [showRpeSelector, setShowRpeSelector] = useState(false);
  const [rpeValues, setRpeValues] = useState<number[]>([]);
  const [sessionAvgRpe, setSessionAvgRpe] = useState<number | null>(null);
  const rpeSelectorOpacity = useRef(new Animated.Value(0)).current;
  // Tracks the most recently inserted set_log so RPE taps can attach to it
  const lastSetLogIdRef = useRef<string | null>(null);

  // Profile data for weight suggestions
  const [profileData, setProfileData] = useState<{
    bodyWeightKg: number;
    sex: string;
    trainingHistory: string;
  }>({ bodyWeightKg: 70, sex: "male", trainingHistory: "beginner" });

  // Show focus cue toggle
  const [showCue, setShowCue] = useState(false);

  useEffect(() => {
    loadWorkout();
    // Start elapsed timer
    elapsedRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (prTimeoutRef.current) clearTimeout(prTimeoutRef.current);
      if (progressionTimeoutRef.current) clearTimeout(progressionTimeoutRef.current);
      if (finisherTimerRef.current) clearInterval(finisherTimerRef.current);
      if (elapsedRef.current) clearInterval(elapsedRef.current);
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    };
  }, []);

  // Reset logged sets when exercise changes
  useEffect(() => {
    setLoggedSets([]);
    setShowCue(false);
  }, [currentExIdx]);

  const loadWorkout = async () => {
    if (!session?.user?.id) return;

    const day = new Date().getDay() === 0 ? 7 : new Date().getDay();

    const { data: plan } = await supabase
      .from("workout_plans")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("day", day)
      .eq("is_rest_day", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!plan) {
      router.replace("/(app)" as any);
      return;
    }

    setFocus(plan.focus || "");

    // Create workout log
    const { data: log } = await supabase
      .from("workout_logs")
      .insert({
        user_id: session.user.id,
        workout_plan_id: plan.id,
      })
      .select()
      .single();

    if (log) setWorkoutLogId(log.id);

    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("weight_kg, sex, training_history")
      .eq("id", session.user.id)
      .single();

    const pData = {
      bodyWeightKg: profile?.weight_kg ?? 70,
      sex: profile?.sex ?? "male",
      trainingHistory: profile?.training_history ?? "beginner",
    };
    setProfileData(pData);

    const { data: planExercises } = await supabase
      .from("workout_plan_exercises")
      .select("*, exercises(*)")
      .eq("workout_plan_id", plan.id)
      .order("order");

    if (planExercises) {
      const enriched: ExerciseData[] = [];
      const prevMap: Record<string, PreviousData> = {};

      for (const pe of planExercises) {
        // Get last logged weight for suggestion
        const { data: lastLog } = await supabase
          .from("set_logs")
          .select("weight_kg")
          .eq("exercise_id", pe.exercise_id)
          .gt("weight_kg", 0)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        const suggestion = suggestWeight({
          bodyWeightKg: pData.bodyWeightKg,
          sex: pData.sex as any,
          trainingHistory: pData.trainingHistory as any,
          muscleGroup: (pe.exercises?.muscle_group ?? "full_body") as MuscleGroup,
          lastLoggedWeight: lastLog?.weight_kg,
        });

        // Fetch previous session sets for this exercise
        const { data: prevSets } = await supabase
          .from("set_logs")
          .select("reps, weight_kg, set_number")
          .eq("exercise_id", pe.exercise_id)
          .order("created_at", { ascending: false })
          .limit(pe.target_sets * 2); // Get enough to find last session

        if (prevSets && prevSets.length > 0) {
          // Take the most recent N sets (up to target_sets)
          const recent = (prevSets as any[]).slice(0, pe.target_sets);
          prevMap[pe.exercise_id] = {
            sets: recent.map((s: any) => ({ reps: s.reps, weight_kg: s.weight_kg })),
          };
        }

        enriched.push({
          exerciseId: pe.exercise_id,
          exerciseName: pe.exercises?.name ?? "Unknown",
          targetSets: pe.target_sets,
          targetReps: pe.target_reps,
          restSeconds: pe.rest_seconds,
          explainWhy: pe.explain_why ?? "",
          muscleGroup: pe.exercises?.muscle_group ?? "full_body",
          difficulty: pe.exercises?.difficulty ?? "intermediate",
          suggestedWeight: suggestion.suggestedKg,
          weightReasoning: suggestion.reasoning,
        });
      }

      setExercises(enriched);
      setPreviousData(prevMap);
    }
  };

  const formatElapsed = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const startRestTimer = (seconds: number) => {
    setResting(true);
    setRestTime(seconds);

    timerRef.current = setInterval(() => {
      setRestTime((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setResting(false);
          Vibration.vibrate([0, 200, 100, 200]);
          return 0;
        }
        if (prev === 11) Vibration.vibrate(100);
        return prev - 1;
      });
    }, 1000);
  };

  const skipRest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setResting(false);
    setRestTime(0);
  };

  const handleSwap = async () => {
    const currentEx = exercises[currentExIdx];
    const { data: library } = await supabase
      .from("exercises")
      .select("*")
      .eq("muscle_group", currentEx.muscleGroup);
    if (!library) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("available_equipment")
      .eq("id", session?.user?.id ?? "")
      .single();

    const equipment = profile?.available_equipment ?? ["barbell", "dumbbell", "bodyweight", "cable", "machine"];

    const alternatives = findAlternatives(
      currentEx.exerciseId,
      currentEx.muscleGroup as MuscleGroup,
      equipment,
      currentEx.difficulty,
      library as Exercise[],
      currentEx.exerciseName
    );
    setSwapAlternatives(alternatives);
    setSwapVisible(true);
  };

  const handleSwapSelect = (exercise: Exercise) => {
    const suggestion = suggestWeight({
      bodyWeightKg: profileData.bodyWeightKg,
      sex: profileData.sex as any,
      trainingHistory: profileData.trainingHistory as any,
      muscleGroup: exercise.muscle_group,
    });

    // Preserve the original exercise's goal-aware sets/reps/rest — the swap
    // should only change WHAT exercise, not HOW it's programmed
    const original = exercises[currentExIdx];
    const updated = [...exercises];
    updated[currentExIdx] = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      targetSets: original.targetSets,
      targetReps: original.targetReps,
      restSeconds: original.restSeconds,
      explainWhy: `Swapped in for ${original.exerciseName} — targets the same muscle with different equipment.`,
      muscleGroup: exercise.muscle_group,
      difficulty: exercise.difficulty,
      suggestedWeight: suggestion.suggestedKg,
      weightReasoning: suggestion.reasoning,
    };
    setExercises(updated);
    setCurrentSet(1);
    setLoggedSets([]);
    setSwapVisible(false);
  };

  const showPR = (message: string) => {
    setPrMessage(message);
    Vibration.vibrate([0, 300, 100, 300]);
    if (prTimeoutRef.current) clearTimeout(prTimeoutRef.current);
    prTimeoutRef.current = setTimeout(() => setPrMessage(null), 5000);
  };

  const showProgressionSuggestion = (message: string) => {
    setProgressionMsg(message);
    progressionOpacity.setValue(0);
    Animated.timing(progressionOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    if (progressionTimeoutRef.current) clearTimeout(progressionTimeoutRef.current);
    progressionTimeoutRef.current = setTimeout(() => {
      Animated.timing(progressionOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => setProgressionMsg(null));
    }, 4500);
  };

  const triggerCheckAnimation = () => {
    setShowCheck(true);
    Vibration.vibrate(50);
    if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    checkTimeoutRef.current = setTimeout(() => setShowCheck(false), 800);
  };

  // Refs for finisher single-interval pattern
  const finisherExIdxRef = useRef(0);
  const finisherTimeLeftRef = useRef(0);
  const finisherRef = useRef<FinisherBlock | null>(null);

  const startFinisher = () => {
    if (!finisher || finisher.exercises.length === 0) return;
    setShowFinisher(false);
    setFinisherActive(true);
    setFinisherExIdx(0);
    setFinisherTimeLeft(finisher.exercises[0].duration_seconds);

    // Store in refs so the single interval can read current values
    finisherExIdxRef.current = 0;
    finisherTimeLeftRef.current = finisher.exercises[0].duration_seconds;
    finisherRef.current = finisher;

    if (finisherTimerRef.current) clearInterval(finisherTimerRef.current);

    finisherTimerRef.current = setInterval(() => {
      const fb = finisherRef.current;
      if (!fb) return;

      finisherTimeLeftRef.current -= 1;
      const timeLeft = finisherTimeLeftRef.current;
      setFinisherTimeLeft(timeLeft);

      if (timeLeft <= 0) {
        Vibration.vibrate([0, 200, 100, 200]);
        const nextIdx = finisherExIdxRef.current + 1;

        if (nextIdx < fb.exercises.length) {
          // Advance to next finisher exercise
          finisherExIdxRef.current = nextIdx;
          finisherTimeLeftRef.current = fb.exercises[nextIdx].duration_seconds;
          setFinisherExIdx(nextIdx);
          setFinisherTimeLeft(fb.exercises[nextIdx].duration_seconds);
        } else {
          // All finisher exercises done
          if (finisherTimerRef.current) clearInterval(finisherTimerRef.current);
          finisherTimerRef.current = null;
          setFinisherActive(false);
          setFinisherDone(true);
        }
      }
    }, 1000);
  };

  const skipFinisher = () => {
    if (finisherTimerRef.current) clearInterval(finisherTimerRef.current);
    setShowFinisher(false);
    setFinisherActive(false);
    setCompleted(true);
  };

  const handleRpeSelect = (rpe: number) => {
    setRpeValues((prev) => {
      const updated = [...prev, rpe];
      const avg = updated.reduce((a, b) => a + b, 0) / updated.length;
      setSessionAvgRpe(avg);
      return updated;
    });
    // Persist RPE on the set_log row this selector belongs to
    const setLogId = lastSetLogIdRef.current;
    lastSetLogIdRef.current = null;
    if (setLogId) {
      void (supabase.from("set_logs").update({ rpe } as any).eq("id", setLogId) as any);
    }
    // Fade out RPE selector
    Animated.timing(rpeSelectorOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowRpeSelector(false));
  };

  const dismissRpeSelector = () => {
    Animated.timing(rpeSelectorOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowRpeSelector(false));
  };

  const getRpeFeedback = (avgRpe: number): string => {
    if (avgRpe >= 9) return "Tough session! Consider a lighter day next time.";
    if (avgRpe <= 6.5) return "Felt easy? You might be ready for heavier weights.";
    return "Right in the zone. Great effort.";
  };

  const logSet = async () => {
    if (!workoutLogId) return;
    const currentEx = exercises[currentExIdx];

    const reps = parseInt(repsInput, 10) || currentEx.targetReps;
    const weight = parseFloat(weightInput) || currentEx.suggestedWeight || 0;

    const { data: insertedSet } = await (supabase
      .from("set_logs")
      .insert({
        workout_log_id: workoutLogId,
        exercise_id: currentEx.exerciseId,
        set_number: currentSet,
        reps,
        weight_kg: weight,
      } as any)
      .select("id")
      .single() as any);
    lastSetLogIdRef.current = (insertedSet as { id?: string } | null)?.id ?? null;

    // Add to logged sets table
    setLoggedSets((prev) => [...prev, { setNumber: currentSet, reps, weightKg: weight }]);

    // Trigger check animation
    triggerCheckAnimation();

    // Show RPE selector after a brief delay
    setTimeout(() => {
      setShowRpeSelector(true);
      rpeSelectorOpacity.setValue(0);
      Animated.timing(rpeSelectorOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
      // Auto-dismiss after 6 seconds if no selection
      setTimeout(() => {
        dismissRpeSelector();
      }, 6000);
    }, 900);

    // PR detection
    if (weight > 0) {
      const { data: bestLog } = await supabase
        .from("set_logs")
        .select("weight_kg")
        .eq("exercise_id", currentEx.exerciseId)
        .order("weight_kg", { ascending: false })
        .limit(1)
        .single();

      const currentBest = bestLog?.weight_kg ?? null;
      const pr = detectPersonalRecord(currentBest, weight, reps);

      if (pr) {
        await supabase.from("personal_records").insert({
          user_id: session?.user?.id,
          exercise_id: currentEx.exerciseId,
          record_type: pr.type,
          value: pr.value,
        });
        showPR(
          pr.type === "weight"
            ? `New PR! ${pr.value} kg on ${currentEx.exerciseName}!`
            : `New estimated 1RM PR! ${pr.value} kg on ${currentEx.exerciseName}!`
        );
      }
    }

    setRepsInput("");
    setWeightInput("");

    // Show progression suggestion when all sets for this exercise are done
    if (currentSet >= currentEx.targetSets) {
      const allReps = [...loggedSets.map((s) => s.reps), reps];
      const avgWeight =
        [...loggedSets.map((s) => s.weightKg), weight].reduce((a, b) => a + b, 0) / allReps.length;
      const progression = calculateProgression(
        avgWeight,
        currentEx.targetReps,
        currentEx.targetSets,
        allReps,
        currentEx.muscleGroup as MuscleGroup
      );

      if (progression.newWeight > avgWeight) {
        showProgressionSuggestion(
          `Next time: try ${progression.newWeight % 1 === 0 ? progression.newWeight : progression.newWeight.toFixed(1)} kg (+${(progression.newWeight - avgWeight) % 1 === 0 ? (progression.newWeight - avgWeight) : (progression.newWeight - avgWeight).toFixed(1)})`
        );
      } else if (progression.newWeight < avgWeight) {
        showProgressionSuggestion(
          `Next time: drop to ${progression.newWeight % 1 === 0 ? progression.newWeight : progression.newWeight.toFixed(1)} kg — nail the form`
        );
      } else {
        showProgressionSuggestion(
          `Great form — keep at ${avgWeight % 1 === 0 ? avgWeight : avgWeight.toFixed(1)} kg next session`
        );
      }
    }

    if (currentSet < currentEx.targetSets) {
      setCurrentSet(currentSet + 1);
      startRestTimer(currentEx.restSeconds);
    } else if (currentExIdx < exercises.length - 1) {
      setCurrentExIdx(currentExIdx + 1);
      setCurrentSet(1);
      startRestTimer(currentEx.restSeconds);
    } else {
      // Workout complete
      await supabase
        .from("workout_logs")
        .update({ completed_at: new Date().toISOString() })
        .eq("id", workoutLogId);

      const finisherBlock = generateFinisher(focus);
      setFinisher(finisherBlock);
      setShowFinisher(true);
    }
  };

  // ─── Helper: muscle tag pill ───
  const getMt = (group: string) => muscleTints[group.toLowerCase()] || muscleTints.default;

  // ─── Finisher Prompt ───
  if (showFinisher && finisher) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
        <TopoBackground />

        <Text style={{ fontSize: 24, fontWeight: "700", color: C.earth, marginBottom: 8, textAlign: "center" }}>
          Burn?
        </Text>
        <Text style={{ fontSize: 14, color: C.rock, textAlign: "center", marginBottom: 8 }}>
          {Math.ceil(finisher.totalDurationSeconds / 60)} min HIIT + Core burn
        </Text>

        {/* Exercise list preview */}
        <View style={{ width: "100%", marginBottom: 28 }}>
          {finisher.exercises.map((e, i) => (
            <View
              key={i}
              style={{
                backgroundColor: C.stone,
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginBottom: 8,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: C.earth }}>{e.name}</Text>
              <Text style={{ fontSize: 12, color: C.rock }}>{e.duration_seconds}s</Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={startFinisher}
          style={{
            backgroundColor: C.earth,
            borderRadius: 16,
            paddingVertical: 18,
            alignItems: "center",
            width: "100%",
            marginBottom: 12,
          }}
        >
          <Text style={{ color: C.bg, fontSize: 18, fontWeight: "700" }}>Let's Go</Text>
        </Pressable>
        <Pressable
          onPress={skipFinisher}
          style={{
            borderWidth: 1,
            borderColor: C.rock,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
            width: "100%",
          }}
        >
          <Text style={{ color: C.rock, fontSize: 15 }}>Skip</Text>
        </Pressable>
      </View>
    );
  }

  // ─── Finisher Active ───
  if (finisherActive && finisher && finisherExIdx < finisher.exercises.length) {
    const fEx = finisher.exercises[finisherExIdx];
    const progressPct = ((finisherExIdx + 1) / finisher.exercises.length) * 100;
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 64, paddingBottom: 40 }}>
        <TopoBackground />

        <View>
          <Text style={{ fontSize: 14, color: C.rock, marginBottom: 6 }}>
            Finisher {finisherExIdx + 1} of {finisher.exercises.length}
          </Text>
          {/* Progress bar */}
          <View style={{ height: 4, backgroundColor: C.stone, borderRadius: 4, marginBottom: 24 }}>
            <View style={{ height: 4, backgroundColor: C.earth, borderRadius: 4, width: `${progressPct}%` }} />
          </View>
        </View>

        <View style={{ alignItems: "center" }}>
          {/* Type pill */}
          <View
            style={{
              backgroundColor: fEx.type === "hiit" ? "#FEF3C7" : "#E8E4F8",
              borderRadius: 100,
              paddingHorizontal: 12,
              paddingVertical: 4,
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: fEx.type === "hiit" ? "#F59E0B" : "#6366F1",
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              {fEx.type === "hiit" ? "HIIT" : "CORE"}
            </Text>
          </View>

          <Text style={{ fontSize: 20, fontWeight: "700", color: C.earth, marginBottom: 16, textAlign: "center" }}>
            {fEx.name}
          </Text>
          <Text style={{ fontSize: 48, fontWeight: "800", color: C.earth, marginBottom: 16 }}>
            {finisherTimeLeft}
          </Text>
          <Text style={{ fontSize: 14, color: C.rock, textAlign: "center", paddingHorizontal: 16 }}>
            {fEx.instructions}
          </Text>
        </View>

        <Pressable
          onPress={skipFinisher}
          style={{
            borderWidth: 1,
            borderColor: C.earth,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
          }}
        >
          <Text style={{ color: C.earth, fontSize: 15 }}>End Finisher</Text>
        </Pressable>
      </View>
    );
  }

  // ─── Finisher Done ───
  if (finisherDone) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
        <TopoBackground />
        <Text style={{ fontSize: 24, fontWeight: "700", color: C.earth, marginBottom: 8 }}>Finisher Crushed!</Text>
        <Text style={{ fontSize: 15, color: C.rock, textAlign: "center", marginBottom: 32 }}>
          That extra burn makes all the difference.
        </Text>
        <Pressable
          onPress={() => { setFinisherDone(false); setCompleted(true); }}
          style={{
            backgroundColor: C.earth,
            borderRadius: 16,
            paddingHorizontal: 32,
            paddingVertical: 16,
          }}
        >
          <Text style={{ color: C.bg, fontSize: 16, fontWeight: "600" }}>Continue</Text>
        </Pressable>
      </View>
    );
  }

  // ─── Completion State ───
  if (completed) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
        <TopoBackground />

        <Text style={{ fontSize: 28, fontWeight: "700", color: C.earth, marginBottom: 24 }}>
          Summit Reached!
        </Text>

        {/* Stats bento grid 2x2 */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 12, width: "100%" }}>
          <BentoWidget variant="stone" style={{ flex: 1 }}>
            <Text style={{ fontSize: 9, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.8, color: C.rock, marginBottom: 4 }}>
              EXERCISES
            </Text>
            <Text style={{ fontSize: 28, fontWeight: "800", color: C.earth }}>{exercises.length}</Text>
          </BentoWidget>
          <BentoWidget variant="stone" style={{ flex: 1 }}>
            <Text style={{ fontSize: 9, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.8, color: C.rock, marginBottom: 4 }}>
              DURATION
            </Text>
            <Text style={{ fontSize: 28, fontWeight: "800", color: C.earth }}>{formatElapsed(elapsed)}</Text>
          </BentoWidget>
        </View>
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 32, width: "100%" }}>
          <BentoWidget variant="stone" style={{ flex: 1 }}>
            <Text style={{ fontSize: 9, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.8, color: C.rock, marginBottom: 4 }}>
              VOLUME
            </Text>
            <Text style={{ fontSize: 28, fontWeight: "800", color: C.earth }}>
              {loggedSets.reduce((sum, s) => sum + s.weightKg * s.reps, 0).toLocaleString()} kg
            </Text>
          </BentoWidget>
          <BentoWidget variant="dark" style={{ flex: 1 }}>
            <Text style={{ fontSize: 9, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.8, color: C.rock, marginBottom: 4 }}>
              FOCUS
            </Text>
            <Text style={{ fontSize: 18, fontWeight: "700", color: C.bg }}>{focus || "Full Body"}</Text>
          </BentoWidget>
        </View>

        {/* RPE Session Feedback */}
        {sessionAvgRpe !== null && (
          <View
            style={{
              backgroundColor: sessionAvgRpe >= 9 ? "#FEF3C7" : sessionAvgRpe <= 6.5 ? "#D1FAE5" : C.stone,
              borderRadius: 16,
              paddingHorizontal: 20,
              paddingVertical: 16,
              marginBottom: 24,
              width: "100%",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 9, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.8, color: C.rock, marginBottom: 6 }}>
              SESSION INTENSITY
            </Text>
            <Text style={{ fontSize: 22, fontWeight: "800", color: C.earth, marginBottom: 4 }}>
              RPE {sessionAvgRpe.toFixed(1)}
            </Text>
            <Text style={{ fontSize: 13, color: C.rock, textAlign: "center" }}>
              {getRpeFeedback(sessionAvgRpe)}
            </Text>
          </View>
        )}

        <Pressable
          onPress={() => router.replace({ pathname: "/(app)/cooldown", params: { focus } } as any)}
          style={{
            backgroundColor: "#34D399",
            borderRadius: 16,
            paddingHorizontal: 32,
            paddingVertical: 16,
            marginBottom: 12,
            width: "100%",
            alignItems: "center",
          }}
        >
          <Text style={{ color: C.earth, fontSize: 17, fontWeight: "700" }}>Cool Down</Text>
        </Pressable>
        <Pressable
          onPress={() => router.replace("/(app)")}
          style={{
            borderWidth: 1,
            borderColor: C.rock,
            borderRadius: 16,
            paddingHorizontal: 32,
            paddingVertical: 16,
            width: "100%",
            alignItems: "center",
          }}
        >
          <Text style={{ color: C.rock, fontSize: 16 }}>Skip</Text>
        </Pressable>
      </View>
    );
  }

  // ─── Loading ───
  if (exercises.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: "center", alignItems: "center" }}>
        <TopoBackground />
        <Text style={{ color: C.rock, fontSize: 16 }}>Loading workout...</Text>
      </View>
    );
  }

  const currentEx = exercises[currentExIdx];
  const prevEx = previousData[currentEx.exerciseId];
  const mt = getMt(currentEx.muscleGroup);

  // ─── Rest Timer State ───
  if (resting) {
    const nextLabel = currentSet <= currentEx.targetSets
      ? `Set ${currentSet} of ${currentEx.targetSets}`
      : exercises[currentExIdx + 1]?.exerciseName ?? "Done";

    return (
      <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
        <TopoBackground />

        {/* Elapsed time at top */}
        <View style={{ position: "absolute", top: 64, right: 24 }}>
          <View style={{ backgroundColor: C.stone, borderRadius: 100, paddingHorizontal: 12, paddingVertical: 4 }}>
            <Text style={{ color: C.earth, fontSize: 13, fontWeight: "600" }}>{formatElapsed(elapsed)}</Text>
          </View>
        </View>

        {/* Progression suggestion banner */}
        {progressionMsg && (
          <Animated.View
            style={{
              position: "absolute",
              top: 104,
              left: 24,
              right: 24,
              backgroundColor: C.stone,
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 12,
              zIndex: 10,
              opacity: progressionOpacity,
            }}
          >
            <Text style={{ color: C.earth, fontSize: 14, fontWeight: "600", textAlign: "center" }}>
              {progressionMsg}
            </Text>
          </Animated.View>
        )}

        <Text style={{ color: C.rock, fontSize: 16, marginBottom: 16 }}>Rest</Text>
        <Text style={{ color: C.earth, fontSize: 48, fontWeight: "800", marginBottom: 8 }}>
          {formatDuration(restTime)}
        </Text>

        {/* Next up preview card */}
        <View
          style={{
            backgroundColor: C.white,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "rgba(0,0,0,0.04)",
            paddingHorizontal: 20,
            paddingVertical: 14,
            marginBottom: 32,
            width: "100%",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 12, color: C.rock, marginBottom: 4 }}>Next up:</Text>
          <Text style={{ fontSize: 16, fontWeight: "600", color: C.earth }}>{nextLabel}</Text>
        </View>

        <Pressable
          onPress={skipRest}
          style={{
            borderWidth: 1,
            borderColor: C.earth,
            borderRadius: 16,
            paddingHorizontal: 32,
            paddingVertical: 16,
          }}
        >
          <Text style={{ color: C.earth, fontSize: 16 }}>Skip Rest</Text>
        </Pressable>
      </View>
    );
  }

  // ─── Main Exercise Screen — Trail Timeline Layout ───
  const progressPct = ((currentExIdx + (currentSet - 1) / currentEx.targetSets) / exercises.length) * 100;
  const timelineFillPct = ((currentSet - 1) / currentEx.targetSets) * 100;

  // Previous set data for current set
  const prevSetData = prevEx?.sets[currentSet - 1];
  const prevLabel = prevSetData ? `${prevSetData.weight_kg} × ${prevSetData.reps}` : null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <TopoBackground />

      {/* PR celebration overlay */}
      {prMessage && (
        <View
          style={{
            position: "absolute",
            top: 96,
            left: 24,
            right: 24,
            borderRadius: 16,
            padding: 16,
            zIndex: 10,
            backgroundColor: "#FEF3C7",
            borderWidth: 1,
            borderColor: "rgba(245,158,11,0.2)",
          }}
        >
          <Text style={{ color: C.earth, fontSize: 16, fontWeight: "700", textAlign: "center" }}>
            {prMessage}
          </Text>
        </View>
      )}

      {/* Progression suggestion banner */}
      {progressionMsg && (
        <Animated.View
          style={{
            position: "absolute",
            top: prMessage ? 160 : 96,
            left: 24,
            right: 24,
            backgroundColor: C.stone,
            borderRadius: 14,
            paddingHorizontal: 16,
            paddingVertical: 12,
            zIndex: 9,
            opacity: progressionOpacity,
          }}
        >
          <Text style={{ color: C.earth, fontSize: 14, fontWeight: "600", textAlign: "center" }}>
            {progressionMsg}
          </Text>
        </Animated.View>
      )}

      {/* Check animation overlay */}
      {showCheck && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 20,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(52,211,153,0.2)",
            }}
          >
            <Text style={{ fontSize: 40, color: C.trail }}>&#10003;</Text>
          </View>
        </View>
      )}

      {/* ─── Top bar ─── */}
      <View style={{ paddingHorizontal: 24, paddingTop: 64, paddingBottom: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: C.earth, fontVariant: ["tabular-nums"] }}>
            {formatElapsed(elapsed)}
          </Text>
          <Text style={{ fontSize: 12, color: C.rock, marginLeft: 8 }}>
            {currentExIdx + 1} / {exercises.length}
          </Text>
          <Pressable onPress={() => router.replace("/(app)" as any)} style={{ marginLeft: "auto" }}>
            <Text style={{ color: C.rock, fontSize: 13 }}>End</Text>
          </Pressable>
        </View>

        {/* Progress bar */}
        <View style={{ height: 3, backgroundColor: C.stone, borderRadius: 2 }}>
          <View style={{ height: 3, backgroundColor: C.trail, borderRadius: 2, width: `${progressPct}%` }} />
        </View>
      </View>

      {/* ─── Exercise header ─── */}
      <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "700", color: C.earth, letterSpacing: -0.7 }}>
          {currentEx.exerciseName}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 5 }}>
          <Text style={{ fontSize: 11, fontWeight: "600", color: C.rock }}>
            {currentEx.muscleGroup.replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
          </Text>
          <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: C.stone }} />
          <Pressable onPress={handleSwap}>
            <Text style={{ fontSize: 11, fontWeight: "600", color: C.trail }}>Swap</Text>
          </Pressable>
          <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: C.stone }} />
          <Text style={{ fontSize: 11, fontWeight: "600", color: C.rock }}>▶ Video</Text>
        </View>
      </View>

      {/* ─── Trail Timeline ─── */}
      <View style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 24, position: "relative" }}>

        {/* Vertical line */}
        <View
          style={{
            position: "absolute",
            left: 38,
            top: 24,
            bottom: 0,
            width: 2,
            backgroundColor: C.stone,
          }}
        >
          <View
            style={{
              width: 2,
              backgroundColor: C.trail,
              borderRadius: 1,
              height: `${timelineFillPct}%`,
            }}
          />
        </View>

        {/* ─── Completed sets ─── */}
        {loggedSets.map((ls) => (
          <View key={ls.setNumber} style={{ flexDirection: "row", gap: 16 }}>
            {/* Dot */}
            <View style={{ width: 30, alignItems: "center", paddingTop: 2 }}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: C.trail,
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1,
                }}
              >
                <Text style={{ fontSize: 7, fontWeight: "700", color: "#fff" }}>✓</Text>
              </View>
            </View>
            {/* Content */}
            <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, paddingTop: 0 }}>
              <Text style={{ fontSize: 11, fontWeight: "600", color: C.rock }}>Set {ls.setNumber}</Text>
              <Text style={{ fontSize: 14, fontWeight: "700", color: C.earth }}>{ls.weightKg} kg × {ls.reps}</Text>
            </View>
          </View>
        ))}

        {/* ─── Current set — expanded card ─── */}
        <View style={{ flexDirection: "row", gap: 16 }}>
          {/* Active dot */}
          <View style={{ width: 30, alignItems: "center", paddingTop: 2 }}>
            <View
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: C.earth,
                zIndex: 1,
              }}
            />
            {/* Glow ring */}
            <View
              style={{
                position: "absolute",
                top: -1,
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: "rgba(52,211,153,0.12)",
                zIndex: 0,
              }}
            />
          </View>
          {/* Card */}
          <View
            style={{
              flex: 1,
              backgroundColor: C.white,
              borderRadius: 18,
              padding: 16,
              marginBottom: 12,
              borderWidth: 1.5,
              borderColor: "rgba(52,211,153,0.08)",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: C.trail, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Set {currentSet}
              </Text>
              {prevLabel && (
                <Text style={{ fontSize: 11, color: C.rock }}>Last: {prevLabel}</Text>
              )}
            </View>

            {/* Inputs */}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              <View style={{ flex: 1, alignItems: "center" }}>
                <TextInput
                  style={{
                    width: "100%",
                    paddingVertical: 14,
                    paddingHorizontal: 8,
                    borderRadius: 14,
                    backgroundColor: C.bg,
                    borderWidth: 2,
                    borderColor: "transparent",
                    textAlign: "center",
                    fontSize: 30,
                    fontWeight: "800",
                    color: C.earth,
                  }}
                  placeholder={currentEx.suggestedWeight > 0 ? String(currentEx.suggestedWeight) : "0"}
                  placeholderTextColor={C.rock}
                  keyboardType="decimal-pad"
                  value={weightInput}
                  onChangeText={setWeightInput}
                />
                <Text style={{ fontSize: 9, fontWeight: "600", color: C.rock, textTransform: "uppercase", letterSpacing: 0.3, marginTop: 4 }}>
                  kg
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: "center" }}>
                <TextInput
                  style={{
                    width: "100%",
                    paddingVertical: 14,
                    paddingHorizontal: 8,
                    borderRadius: 14,
                    backgroundColor: C.bg,
                    borderWidth: 2,
                    borderColor: "transparent",
                    textAlign: "center",
                    fontSize: 30,
                    fontWeight: "800",
                    color: C.earth,
                  }}
                  placeholder={String(currentEx.targetReps)}
                  placeholderTextColor={C.rock}
                  keyboardType="number-pad"
                  value={repsInput}
                  onChangeText={setRepsInput}
                />
                <Text style={{ fontSize: 9, fontWeight: "600", color: C.rock, textTransform: "uppercase", letterSpacing: 0.3, marginTop: 4 }}>
                  reps
                </Text>
              </View>
            </View>

            {/* Log button inside card */}
            <Pressable
              onPress={logSet}
              style={{
                backgroundColor: C.earth,
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
                marginTop: 12,
              }}
            >
              <Text style={{ color: C.bg, fontSize: 14, fontWeight: "700" }}>
                {currentSet < currentEx.targetSets
                  ? "Log Set"
                  : currentExIdx < exercises.length - 1
                  ? "Next Exercise"
                  : "Complete Workout"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ─── Future sets ─── */}
        {Array.from({ length: Math.max(0, currentEx.targetSets - currentSet) }).map((_, i) => {
          const setNum = currentSet + i + 1;
          return (
            <View key={setNum} style={{ flexDirection: "row", gap: 16 }}>
              {/* Future dot */}
              <View style={{ width: 30, alignItems: "center", paddingTop: 2 }}>
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: C.stone,
                    opacity: 0.5,
                    zIndex: 1,
                  }}
                />
              </View>
              {/* Content */}
              <View style={{ flex: 1, paddingBottom: 16 }}>
                <Text style={{ fontSize: 11, color: C.rock, opacity: 0.4 }}>Set {setNum}</Text>
                <Text style={{ fontSize: 10, color: C.rock, opacity: 0.25, marginTop: 2 }}>
                  Target: {currentEx.targetReps} reps
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* ─── Focus cue ─── */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 24, marginTop: 8 }}>
        <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: C.trail, opacity: 0.6 }} />
        <Text style={{ fontSize: 11, color: C.rock }}>
          {getFocusCue(currentEx.exerciseName, currentEx.muscleGroup)}
        </Text>
      </View>

      {/* RPE Quick-Tap Selector */}
      {showRpeSelector && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: 40,
            left: 24,
            right: 24,
            backgroundColor: C.white,
            borderRadius: 18,
            padding: 14,
            zIndex: 25,
            borderWidth: 1.5,
            borderColor: "rgba(0,0,0,0.06)",
            opacity: rpeSelectorOpacity,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: "700", color: C.rock, textTransform: "uppercase", letterSpacing: 0.5, textAlign: "center", marginBottom: 10 }}>
            How did that feel?
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              onPress={() => handleRpeSelect(6.5)}
              style={{
                flex: 1,
                backgroundColor: "#D1FAE5",
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#059669" }}>Easy</Text>
              <Text style={{ fontSize: 10, color: "#059669", marginTop: 2 }}>RPE 6-7</Text>
            </Pressable>
            <Pressable
              onPress={() => handleRpeSelect(8)}
              style={{
                flex: 1,
                backgroundColor: C.stone,
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "700", color: C.earth }}>Right</Text>
              <Text style={{ fontSize: 10, color: C.rock, marginTop: 2 }}>RPE 8</Text>
            </Pressable>
            <Pressable
              onPress={() => handleRpeSelect(9.5)}
              style={{
                flex: 1,
                backgroundColor: "#FEF3C7",
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#D97706" }}>Hard</Text>
              <Text style={{ fontSize: 10, color: "#D97706", marginTop: 2 }}>RPE 9-10</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}

      {/* Exercise swap modal */}
      <ExerciseSwapModal
        visible={swapVisible}
        alternatives={swapAlternatives}
        onSelect={handleSwapSelect}
        onClose={() => setSwapVisible(false)}
      />
    </ScrollView>
  );
}
