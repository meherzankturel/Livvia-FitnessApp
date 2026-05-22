/**
 * Conditioning Player — timer-based circuit screen.
 *
 * Used for ACSM-prescribed conditioning days on fat-loss user plans. Reads
 * the assigned template (HIIT Circuit / Cardio Endurance / etc.), runs a
 * countdown per exercise, auto-advances to the next, and writes a
 * workout_logs row on completion. No weight or rep logging — this is timed
 * work, not resistance training.
 *
 * Expo Go-safe: built-in Animated API only, no SVG, no Reanimated worklets.
 */

import { View, Text, Pressable, ScrollView, Animated, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  getConditioningTemplates,
  useAuthStore,
  type Equipment,
} from "@repped/shared";
import { supabase } from "../../src/lib/supabase";
import { TopoBackground } from "../../src/components/terrain";
import { BackButton } from "../../src/components/BackButton";

const C = {
  earth: "#2D2A24",
  sand: "#F6F5F0",
  trail: "#34D399",
  rock: "#8E8E7A",
  stone: "#EDEBE5",
};

type Stage = "preview" | "active" | "done";

export default function ConditioningPlayer() {
  const session = useAuthStore((s) => s.session);
  const params = useLocalSearchParams<{ templateName?: string; equipment?: string; planId?: string }>();
  const templateName = params.templateName ?? "";
  const equipment = (params.equipment ?? "bodyweight") as Equipment;
  const planId = params.planId ?? "";

  const templates = getConditioningTemplates(equipment);
  const template = templates.find((t) => t.name === templateName) ?? templates[0];

  const [stage, setStage] = useState<Stage>("preview");
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [paused, setPaused] = useState(false);
  const [workoutLogId, setWorkoutLogId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const totalDuration = template?.exercises.reduce((sum, e) => sum + e.duration_seconds, 0) ?? 0;
  const totalMinutes = Math.round(totalDuration / 60);

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Reset progress animation per exercise
  useEffect(() => {
    if (stage !== "active" || !template) return;
    const ex = template.exercises[exerciseIdx];
    if (!ex) return;
    setSecondsLeft(ex.duration_seconds);
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: ex.duration_seconds * 1000,
      useNativeDriver: false,
    }).start();
  }, [exerciseIdx, stage]);

  // Tick the countdown
  useEffect(() => {
    if (stage !== "active" || paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          advanceExercise();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [stage, paused, exerciseIdx]);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleStart = async () => {
    if (!session?.user?.id || !planId) {
      // No plan id — start without logging (offline / dev mode)
      setStage("active");
      return;
    }
    // Create workout_logs row at session start
    const { data: log } = await ((supabase.from("workout_logs") as any)
      .insert({ user_id: session.user.id, workout_plan_id: planId })
      .select("id")
      .single());
    if (log) setWorkoutLogId((log as any).id);
    setStage("active");
  };

  const advanceExercise = () => {
    if (!template) return;
    if (exerciseIdx < template.exercises.length - 1) {
      setExerciseIdx((i) => i + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    advanceExercise();
  };

  const handleComplete = async () => {
    if (workoutLogId) {
      await ((supabase.from("workout_logs") as any)
        .update({ completed_at: new Date().toISOString() })
        .eq("id", workoutLogId));
    }
    setStage("done");
  };

  const handleQuit = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    router.replace("/(app)" as any);
  };

  // ─── No template fallback ─────────────────────────────────────────────────
  if (!template) {
    return (
      <View style={[s.container, { justifyContent: "center", alignItems: "center" }]}>
        <TopoBackground />
        <Text style={s.title}>Conditioning template not found</Text>
        <Pressable onPress={() => router.replace("/(app)" as any)} style={[s.btn, { marginTop: 24 }]}>
          <Text style={s.btnText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  // ─── PREVIEW STAGE ────────────────────────────────────────────────────────
  if (stage === "preview") {
    return (
      <View style={s.container}>
        <TopoBackground />
        <ScrollView contentContainerStyle={s.scroll}>
          <BackButton onPress={handleQuit} style={s.back} />
          <Text style={s.eyebrow}>CONDITIONING · {totalMinutes} MIN</Text>
          <Text style={s.title}>{template.name}</Text>
          <Text style={s.subtitle}>{template.description}</Text>
          <View style={{ marginTop: 24 }}>
            {template.exercises.map((ex, i) => (
              <View key={i} style={s.exerciseRow}>
                <View style={s.exerciseNum}><Text style={s.exerciseNumText}>{i + 1}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.exerciseName}>{ex.name}</Text>
                  <Text style={s.exerciseDuration}>{formatDuration(ex.duration_seconds)}</Text>
                  <Text style={s.exerciseInstructions}>{ex.instructions}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
        <View style={s.footer}>
          <Pressable onPress={handleStart} style={s.startBtn}>
            <Text style={s.startBtnText}>Start Workout</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ─── DONE STAGE ───────────────────────────────────────────────────────────
  if (stage === "done") {
    return (
      <View style={[s.container, { justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }]}>
        <TopoBackground />
        <Text style={{ fontSize: 56, marginBottom: 16 }}>✓</Text>
        <Text style={s.title}>Conditioning complete</Text>
        <Text style={[s.subtitle, { textAlign: "center", marginTop: 8 }]}>
          {totalMinutes} minutes logged. Nice work — that's calories burned and recovery work done.
        </Text>
        <Pressable onPress={() => router.navigate("/(app)" as any)} style={[s.btn, { marginTop: 32 }]}>
          <Text style={s.btnText}>Back to Today</Text>
        </Pressable>
      </View>
    );
  }

  // ─── ACTIVE STAGE ─────────────────────────────────────────────────────────
  const current = template.exercises[exerciseIdx];
  const total = template.exercises.length;
  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <View style={s.container}>
      <TopoBackground />
      <View style={s.activeTop}>
        <Pressable onPress={handleQuit}>
          <Text style={{ color: C.earth, fontSize: 18, fontFamily: "Quicksand_600SemiBold", fontWeight: "600" }}>‹ Quit</Text>
        </Pressable>
        <Text style={s.activeCount}>{exerciseIdx + 1} / {total}</Text>
      </View>

      <View style={s.activeBody}>
        <Text style={s.eyebrow}>{current.type.toUpperCase()}</Text>
        <Text style={s.activeName}>{current.name}</Text>
        <Text style={s.activeInstructions}>{current.instructions}</Text>

        <Text style={s.timer}>{formatClock(secondsLeft)}</Text>

        <View style={s.progressTrack}>
          <Animated.View style={[s.progressFill, { width: progressWidth }]} />
        </View>
      </View>

      <View style={s.activeControls}>
        <Pressable onPress={() => setPaused((p) => !p)} style={[s.controlBtn, { backgroundColor: C.stone }]}>
          <Text style={[s.controlBtnText, { color: C.earth }]}>{paused ? "Resume" : "Pause"}</Text>
        </Pressable>
        <Pressable onPress={handleSkip} style={[s.controlBtn, { backgroundColor: C.earth }]}>
          <Text style={[s.controlBtnText, { color: C.sand }]}>Skip</Text>
        </Pressable>
      </View>
    </View>
  );
}

function formatDuration(seconds: number): string {
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s > 0 ? `${m}m ${s}s` : `${m} min`;
  }
  return `${seconds}s`;
}

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.sand },
  scroll: { padding: 24, paddingTop: 60, paddingBottom: 140 },
  back: {
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 11, fontFamily: "Quicksand_700Bold", fontWeight: "700", letterSpacing: 1.4,
    color: C.trail, marginBottom: 8,
  },
  title: { fontSize: 28, fontWeight: "800", color: C.earth, lineHeight: 34 },
  subtitle: { fontSize: 14, color: C.rock, lineHeight: 20, marginTop: 6 },

  exerciseRow: {
    flexDirection: "row", gap: 14, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.stone,
  },
  exerciseNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.earth,
    alignItems: "center", justifyContent: "center",
  },
  exerciseNumText: { color: C.sand, fontSize: 13, fontFamily: "Quicksand_700Bold", fontWeight: "700" },
  exerciseName: { fontSize: 16, fontWeight: "700", color: C.earth },
  exerciseDuration: { fontSize: 12, color: C.trail, fontWeight: "600", marginTop: 2 },
  exerciseInstructions: { fontSize: 13, color: C.rock, marginTop: 6, lineHeight: 18 },

  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    padding: 24, paddingBottom: 40,
    backgroundColor: C.sand,
    borderTopWidth: 1, borderTopColor: C.stone,
  },
  startBtn: {
    backgroundColor: C.earth,
    paddingVertical: 18, borderRadius: 18,
    alignItems: "center",
  },
  startBtnText: { color: C.sand, fontSize: 16, fontFamily: "Quicksand_700Bold", fontWeight: "700" },

  // Active stage
  activeTop: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20,
  },
  activeCount: { fontSize: 14, color: C.rock, fontFamily: "Quicksand_600SemiBold", fontWeight: "600" },
  activeBody: {
    flex: 1, paddingHorizontal: 24, justifyContent: "center", alignItems: "center",
  },
  activeName: {
    fontSize: 32, fontWeight: "800", color: C.earth,
    textAlign: "center", marginTop: 8, lineHeight: 38,
  },
  activeInstructions: {
    fontSize: 14, color: C.rock,
    textAlign: "center", marginTop: 12, lineHeight: 20,
    paddingHorizontal: 12,
  },
  timer: {
    fontSize: 88, fontFamily: "Quicksand_400Regular", fontWeight: "300", color: C.earth,
    fontVariant: ["tabular-nums"], marginTop: 32,
    letterSpacing: -2,
  },
  progressTrack: {
    width: "100%", height: 6, backgroundColor: C.stone,
    borderRadius: 3, marginTop: 24, overflow: "hidden",
  },
  progressFill: {
    height: 6, backgroundColor: C.trail, borderRadius: 3,
  },
  activeControls: {
    flexDirection: "row", gap: 12,
    paddingHorizontal: 24, paddingBottom: 40,
  },
  controlBtn: {
    flex: 1, paddingVertical: 16, borderRadius: 16,
    alignItems: "center",
  },
  controlBtnText: { fontSize: 15, fontFamily: "Quicksand_700Bold", fontWeight: "700" },

  // Generic button
  btn: {
    backgroundColor: C.earth, paddingVertical: 14, paddingHorizontal: 24,
    borderRadius: 16,
  },
  btnText: { color: C.sand, fontSize: 15, fontFamily: "Quicksand_700Bold", fontWeight: "700" },
});
