import { View, Text, Pressable, TextInput, Vibration, ScrollView } from "react-native";
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

  // Finisher state
  const [showFinisher, setShowFinisher] = useState(false);
  const [finisher, setFinisher] = useState<FinisherBlock | null>(null);
  const [finisherExIdx, setFinisherExIdx] = useState(0);
  const [finisherTimeLeft, setFinisherTimeLeft] = useState(0);
  const [finisherActive, setFinisherActive] = useState(false);
  const [finisherDone, setFinisherDone] = useState(false);
  const finisherTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      router.back();
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
      .select("body_weight_kg, sex, training_history")
      .eq("id", session.user.id)
      .single();

    const pData = {
      bodyWeightKg: profile?.body_weight_kg ?? 70,
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
      library as Exercise[]
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

    const updated = [...exercises];
    updated[currentExIdx] = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      targetSets: exercise.default_sets,
      targetReps: exercise.default_reps,
      restSeconds: exercise.default_rest_seconds,
      explainWhy: "",
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

  const triggerCheckAnimation = () => {
    setShowCheck(true);
    Vibration.vibrate(50);
    if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    checkTimeoutRef.current = setTimeout(() => setShowCheck(false), 800);
  };

  const startFinisher = () => {
    if (!finisher || finisher.exercises.length === 0) return;
    setShowFinisher(false);
    setFinisherActive(true);
    setFinisherExIdx(0);
    setFinisherTimeLeft(finisher.exercises[0].duration_seconds);

    finisherTimerRef.current = setInterval(() => {
      setFinisherTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(finisherTimerRef.current!);
          finisherTimerRef.current = null;
          Vibration.vibrate([0, 200, 100, 200]);
          setFinisherExIdx((prevIdx) => {
            const nextIdx = prevIdx + 1;
            if (finisher && nextIdx < finisher.exercises.length) {
              setFinisherTimeLeft(finisher.exercises[nextIdx].duration_seconds);
              finisherTimerRef.current = setInterval(() => {
                setFinisherTimeLeft((p) => {
                  if (p <= 1) {
                    clearInterval(finisherTimerRef.current!);
                    finisherTimerRef.current = null;
                    Vibration.vibrate([0, 200, 100, 200]);
                    setFinisherExIdx((pIdx) => {
                      if (finisher && pIdx + 1 >= finisher.exercises.length) {
                        setFinisherActive(false);
                        setFinisherDone(true);
                      }
                      return pIdx + 1;
                    });
                    return 0;
                  }
                  return p - 1;
                });
              }, 1000);
              return nextIdx;
            } else {
              setFinisherActive(false);
              setFinisherDone(true);
              return prevIdx;
            }
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const skipFinisher = () => {
    if (finisherTimerRef.current) clearInterval(finisherTimerRef.current);
    setShowFinisher(false);
    setFinisherActive(false);
    setCompleted(true);
  };

  const logSet = async () => {
    if (!workoutLogId) return;
    const currentEx = exercises[currentExIdx];

    const reps = parseInt(repsInput, 10) || currentEx.targetReps;
    const weight = parseFloat(weightInput) || currentEx.suggestedWeight || 0;

    await supabase.from("set_logs").insert({
      workout_log_id: workoutLogId,
      exercise_id: currentEx.exerciseId,
      set_number: currentSet,
      reps,
      weight_kg: weight,
    });

    // Add to logged sets table
    setLoggedSets((prev) => [...prev, { setNumber: currentSet, reps, weightKg: weight }]);

    // Trigger check animation
    triggerCheckAnimation();

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

  // ─── Main Exercise Screen ───
  const progressPct = ((currentExIdx + (currentSet - 1) / currentEx.targetSets) / exercises.length) * 100;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingBottom: 40 }}
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
            <Text style={{ fontSize: 40, color: "#34D399" }}>&#10003;</Text>
          </View>
        </View>
      )}

      {/* ─── Top bar: elapsed time + counter + exit ─── */}
      <View style={{ paddingHorizontal: 24, paddingTop: 64, paddingBottom: 8 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            {/* Elapsed time badge */}
            <View style={{ backgroundColor: C.stone, borderRadius: 100, paddingHorizontal: 12, paddingVertical: 4 }}>
              <Text style={{ color: C.earth, fontSize: 13, fontWeight: "600" }}>{formatElapsed(elapsed)}</Text>
            </View>
            {/* Exercise counter */}
            <Text style={{ color: C.rock, fontSize: 14 }}>
              {currentExIdx + 1} of {exercises.length}
            </Text>
          </View>
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: C.rock, fontSize: 15 }}>Exit</Text>
          </Pressable>
        </View>

        {/* Progress bar */}
        <View style={{ height: 4, backgroundColor: C.stone, borderRadius: 4, marginBottom: 16 }}>
          <View
            style={{
              height: 4,
              backgroundColor: C.earth,
              borderRadius: 4,
              width: `${progressPct}%`,
            }}
          />
        </View>
      </View>

      {/* ─── Exercise header ─── */}
      <View style={{ paddingHorizontal: 24, marginBottom: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <Text style={{ fontSize: 20, fontWeight: "700", color: C.earth, flex: 1 }}>{currentEx.exerciseName}</Text>
          <Pressable onPress={handleSwap}>
            <Text style={{ color: C.rock, fontSize: 14, fontWeight: "500" }}>Swap</Text>
          </Pressable>
        </View>

        {/* Muscle tag pill + suggested weight */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{ backgroundColor: mt.bg, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 3 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: mt.tint }}>
              {currentEx.muscleGroup.replace("_", " ")}
            </Text>
          </View>
          {currentEx.suggestedWeight > 0 && (
            <Text style={{ color: C.rock, fontSize: 13 }}>Suggested: {currentEx.suggestedWeight} kg</Text>
          )}
        </View>
      </View>

      {/* ─── Focus cue (collapsible) ─── */}
      <Pressable onPress={() => setShowCue(!showCue)} style={{ paddingHorizontal: 24, marginBottom: 16 }}>
        <View
          style={{
            borderRadius: 14,
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: "rgba(52,211,153,0.05)",
            borderWidth: 1,
            borderColor: "rgba(52,211,153,0.15)",
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: "#4D7C5B", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8 }}>
              FOCUS CUE
            </Text>
            <Text style={{ color: C.rock, fontSize: 12 }}>{showCue ? "\u25B2" : "\u25BC"}</Text>
          </View>
          {showCue && (
            <Text style={{ color: "#4D7C5B", fontSize: 14, lineHeight: 20, marginTop: 8 }}>
              {getFocusCue(currentEx.exerciseName, currentEx.muscleGroup)}
            </Text>
          )}
        </View>
      </Pressable>

      {/* ─── Set table ─── */}
      <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
        <View
          style={{
            backgroundColor: C.white,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "rgba(0,0,0,0.04)",
            overflow: "hidden",
          }}
        >
          {/* Table header */}
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: C.stone,
            }}
          >
            <Text style={{ width: 36, fontSize: 11, fontWeight: "600", color: C.rock, textTransform: "uppercase" }}>SET</Text>
            <Text style={{ flex: 1, fontSize: 11, fontWeight: "600", color: C.rock, textAlign: "center", textTransform: "uppercase" }}>PREVIOUS</Text>
            <Text style={{ width: 70, fontSize: 11, fontWeight: "600", color: C.rock, textAlign: "center", textTransform: "uppercase" }}>KG</Text>
            <Text style={{ width: 60, fontSize: 11, fontWeight: "600", color: C.rock, textAlign: "center", textTransform: "uppercase" }}>REPS</Text>
            <Text style={{ width: 36, fontSize: 11, fontWeight: "600", color: C.rock, textAlign: "center" }}></Text>
          </View>

          {/* Completed set rows */}
          {loggedSets.map((ls) => (
            <View
              key={ls.setNumber}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: C.white,
                borderTopWidth: 1,
                borderTopColor: "rgba(0,0,0,0.04)",
              }}
            >
              <Text style={{ width: 36, fontSize: 14, color: C.earth }}>{ls.setNumber}</Text>
              <Text style={{ flex: 1, fontSize: 13, color: C.rock, textAlign: "center" }}>
                {prevEx?.sets[ls.setNumber - 1]
                  ? `${prevEx.sets[ls.setNumber - 1].weight_kg} x ${prevEx.sets[ls.setNumber - 1].reps}`
                  : "\u2014"}
              </Text>
              <Text style={{ width: 70, fontSize: 14, fontWeight: "500", color: C.earth, textAlign: "center" }}>{ls.weightKg}</Text>
              <Text style={{ width: 60, fontSize: 14, fontWeight: "500", color: C.earth, textAlign: "center" }}>{ls.reps}</Text>
              <View style={{ width: 36, alignItems: "center", justifyContent: "center" }}>
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#34D399",
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>&#10003;</Text>
                </View>
              </View>
            </View>
          ))}

          {/* Current set row (input) — trail-green left border */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 10,
              backgroundColor: C.white,
              borderTopWidth: 1,
              borderTopColor: "rgba(0,0,0,0.04)",
              borderLeftWidth: 3,
              borderLeftColor: "#34D399",
            }}
          >
            <Text style={{ width: 36, fontSize: 14, fontWeight: "700", color: C.earth }}>{currentSet}</Text>
            <Text style={{ flex: 1, fontSize: 13, color: C.rock, textAlign: "center" }}>
              {prevEx?.sets[currentSet - 1]
                ? `${prevEx.sets[currentSet - 1].weight_kg} x ${prevEx.sets[currentSet - 1].reps}`
                : "\u2014"}
            </Text>
            <TextInput
              style={{
                width: 70,
                fontSize: 14,
                color: C.earth,
                textAlign: "center",
                borderRadius: 12,
                paddingVertical: 8,
                backgroundColor: C.stone,
              }}
              placeholder={currentEx.suggestedWeight > 0 ? String(currentEx.suggestedWeight) : "0"}
              placeholderTextColor={C.rock}
              keyboardType="decimal-pad"
              value={weightInput}
              onChangeText={setWeightInput}
            />
            <TextInput
              style={{
                width: 60,
                fontSize: 14,
                color: C.earth,
                textAlign: "center",
                borderRadius: 12,
                paddingVertical: 8,
                marginLeft: 4,
                backgroundColor: C.stone,
              }}
              placeholder={String(currentEx.targetReps)}
              placeholderTextColor={C.rock}
              keyboardType="number-pad"
              value={repsInput}
              onChangeText={setRepsInput}
            />
            <View style={{ width: 36 }} />
          </View>

          {/* Remaining sets preview */}
          {Array.from({ length: Math.max(0, currentEx.targetSets - currentSet) }).map((_, i) => {
            const setNum = currentSet + i + 1;
            return (
              <View
                key={setNum}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderTopWidth: 1,
                  borderTopColor: "rgba(0,0,0,0.04)",
                }}
              >
                <Text style={{ width: 36, fontSize: 14, color: C.rock }}>{setNum}</Text>
                <Text style={{ flex: 1, fontSize: 13, color: C.rock, textAlign: "center" }}>
                  {prevEx?.sets[setNum - 1]
                    ? `${prevEx.sets[setNum - 1].weight_kg} x ${prevEx.sets[setNum - 1].reps}`
                    : "\u2014"}
                </Text>
                <Text style={{ width: 70, fontSize: 14, color: C.rock, textAlign: "center" }}>{"\u2014"}</Text>
                <Text style={{ width: 60, fontSize: 14, color: C.rock, textAlign: "center" }}>{"\u2014"}</Text>
                <View style={{ width: 36 }} />
              </View>
            );
          })}
        </View>
      </View>

      {/* ─── Log Set button ─── */}
      <View style={{ paddingHorizontal: 24 }}>
        <Pressable
          onPress={logSet}
          style={{
            backgroundColor: C.earth,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
            width: "100%",
          }}
        >
          <Text style={{ color: C.bg, fontSize: 17, fontWeight: "700" }}>
            {currentSet < currentEx.targetSets
              ? `Log Set ${currentSet}`
              : currentExIdx < exercises.length - 1
              ? "Next Exercise"
              : "Complete Workout"}
          </Text>
        </Pressable>
      </View>

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
