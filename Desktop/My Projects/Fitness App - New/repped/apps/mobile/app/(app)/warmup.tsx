import { View, Text, ScrollView, Pressable, Vibration } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { generateWarmup, getWarmupDuration } from "@repped/shared";
import { openYouTube } from "../../src/lib/deeplink";
import { TopoBackground } from "../../src/components/terrain";

export default function Warmup() {
  const { focus } = useLocalSearchParams<{ focus: string }>();
  const exercises = generateWarmup(focus || "Full Body A");
  const totalDuration = getWarmupDuration(exercises);

  const [isTimerActive, setIsTimerActive] = useState(false);
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isTimerActive) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          Vibration.vibrate([0, 200, 100, 200]);
          // Auto-advance to next exercise
          if (currentExIndex < exercises.length - 1) {
            const nextIdx = currentExIndex + 1;
            setCurrentExIndex(nextIdx);
            return exercises[nextIdx].duration_seconds;
          } else {
            // All exercises done
            setCurrentExIndex(exercises.length); // signals completion
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerActive, currentExIndex]);

  const startTimer = () => {
    setCurrentExIndex(0);
    setTimeLeft(exercises[0].duration_seconds);
    setIsTimerActive(true);
  };

  const skipExercise = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;

    if (currentExIndex < exercises.length - 1) {
      const nextIdx = currentExIndex + 1;
      setCurrentExIndex(nextIdx);
      setTimeLeft(exercises[nextIdx].duration_seconds);
    } else {
      setCurrentExIndex(exercises.length);
      setTimeLeft(0);
    }
  };

  const allDone = currentExIndex >= exercises.length;

  // Timer mode — all exercises completed
  if (isTimerActive && allDone) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F6F5F0", justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
        <TopoBackground />
        <Text style={{ fontSize: 48, marginBottom: 16 }}>✅</Text>
        <Text style={{ color: "#2D2A24", fontSize: 30, fontWeight: "700", marginBottom: 8 }}>Warm-up Complete!</Text>
        <Text style={{ color: "#8E8E7A", fontSize: 16, textAlign: "center", marginBottom: 32 }}>
          You're ready to crush this workout.
        </Text>

        <Pressable
          onPress={() => router.push("/(app)/workout-player" as any)}
          style={{ backgroundColor: "#2D2A24", borderRadius: 16, paddingVertical: 20, paddingHorizontal: 40, alignItems: "center", marginBottom: 16 }}
        >
          <Text style={{ color: "#F6F5F0", fontSize: 20, fontWeight: "700" }}>Start Workout</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/(app)/workout-player" as any)}
          style={{ borderWidth: 1, borderColor: "#DDD9CE", borderRadius: 16, paddingVertical: 16, paddingHorizontal: 40, alignItems: "center" }}
        >
          <Text style={{ color: "#8E8E7A", fontSize: 16 }}>Skip Warm-up</Text>
        </Pressable>
      </View>
    );
  }

  // Timer mode — active exercise
  if (isTimerActive && !allDone) {
    const currentEx = exercises[currentExIndex];
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeDisplay = minutes > 0
      ? `${minutes}:${seconds.toString().padStart(2, "0")}`
      : `${seconds}`;

    // Determine type badge colors
    const typeBg = currentEx.type === "general"
      ? "rgba(52,211,153,0.1)"
      : currentEx.type === "dynamic"
      ? "rgba(245,158,11,0.1)"
      : "rgba(99,102,241,0.1)";
    const typeColor = currentEx.type === "general"
      ? "#34D399"
      : currentEx.type === "dynamic"
      ? "#F59E0B"
      : "#6366F1";

    return (
      <View style={{ flex: 1, backgroundColor: "#F6F5F0", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 64, paddingBottom: 40 }}>
        <TopoBackground />
        <View>
          <Text style={{ color: "#8E8E7A", fontSize: 16, marginBottom: 4 }}>
            Exercise {currentExIndex + 1} of {exercises.length}
          </Text>

          {/* Progress bar */}
          <View style={{ backgroundColor: "#DDD9CE", borderRadius: 99, height: 8, marginBottom: 32 }}>
            <View
              style={[
                { backgroundColor: "#2D2A24", borderRadius: 99, height: 8 },
                { width: `${((currentExIndex + 1) / exercises.length) * 100}%` },
              ]}
            />
          </View>
        </View>

        <View style={{ alignItems: "center" }}>
          <Text style={{ color: "#2D2A24", fontSize: 30, fontWeight: "700", marginBottom: 16, textAlign: "center" }}>{currentEx.name}</Text>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 12, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99, backgroundColor: typeBg, color: typeColor }}>
              {currentEx.type === "general" ? "General" : currentEx.type === "dynamic" ? "Dynamic" : "Specific"}
            </Text>
          </View>

          <Text style={{ color: "#2D2A24", fontSize: 96, fontWeight: "700", marginBottom: 16 }}>{timeDisplay}</Text>

          <Text style={{ color: "#8E8E7A", fontSize: 16, textAlign: "center", paddingHorizontal: 16 }}>{currentEx.instructions}</Text>

          <Pressable
            onPress={() => openYouTube(currentEx.name + " exercise demo")}
            style={{ backgroundColor: "rgba(239,68,68,0.1)", borderWidth: 1, borderColor: "rgba(239,68,68,0.3)", borderRadius: 12, paddingVertical: 8, paddingHorizontal: 16, marginTop: 12 }}
          >
            <Text style={{ color: "#EF4444", fontSize: 14, fontWeight: "600" }}>▶ Watch Demo</Text>
          </Pressable>
        </View>

        <View>
          <Pressable
            onPress={skipExercise}
            style={{ borderWidth: 1, borderColor: "#DDD9CE", borderRadius: 16, paddingVertical: 16, alignItems: "center", marginBottom: 16 }}
          >
            <Text style={{ color: "#8E8E7A", fontSize: 16 }}>Skip Exercise</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/(app)/workout-player" as any)}
            style={{ borderWidth: 1, borderColor: "#EDEBE5", borderRadius: 16, paddingVertical: 12, alignItems: "center" }}
          >
            <Text style={{ color: "#AEAEB2", fontSize: 14 }}>Skip Warm-up</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Default: exercise list view
  return (
    <View style={{ flex: 1, backgroundColor: "#F6F5F0" }}>
      <TopoBackground />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ paddingHorizontal: 24, paddingTop: 64 }}>
          <Text style={{ color: "#8E8E7A", fontSize: 16, marginBottom: 4 }}>Before You Start</Text>
          <Text style={{ color: "#2D2A24", fontSize: 30, fontWeight: "700", marginBottom: 8 }}>Warm Up</Text>
          <Text style={{ color: "#8E8E7A", fontSize: 16, marginBottom: 24 }}>
            {Math.ceil(totalDuration / 60)} minutes — prevents injury and improves performance
          </Text>

          <View style={{ backgroundColor: "rgba(245,158,11,0.06)", borderWidth: 1, borderColor: "rgba(245,158,11,0.2)", borderRadius: 12, padding: 12, marginBottom: 16 }}>
            <Text style={{ color: "#F59E0B", fontSize: 12, fontWeight: "600", marginBottom: 4 }}>All warmups are dynamic stretches</Text>
            <Text style={{ color: "#8E8E7A", fontSize: 12, lineHeight: 16 }}>
              Static stretching before lifting reduces muscle performance. Dynamic movements prep your muscles without weakening them.
            </Text>
          </View>

          <View style={{ gap: 12, marginBottom: 32 }}>
            {exercises.map((ex, i) => {
              const typeBg = ex.type === "general"
                ? "rgba(52,211,153,0.1)"
                : ex.type === "dynamic"
                ? "rgba(245,158,11,0.1)"
                : "rgba(99,102,241,0.1)";
              const typeColor = ex.type === "general"
                ? "#34D399"
                : ex.type === "dynamic"
                ? "#F59E0B"
                : "#6366F1";

              return (
                <View key={i} style={{ borderRadius: 16, padding: 20, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "rgba(0,0,0,0.04)" }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <Text style={{ color: "#2D2A24", fontSize: 18, fontWeight: "600" }}>{ex.name}</Text>
                    <Text style={{ color: "#8E8E7A", fontSize: 14 }}>
                      {ex.duration_seconds >= 60
                        ? `${Math.round(ex.duration_seconds / 60)} min`
                        : `${ex.duration_seconds}s`}
                    </Text>
                  </View>
                  <Text style={{ color: "#8E8E7A", fontSize: 14 }}>{ex.instructions}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                    <Text style={{ fontSize: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99, backgroundColor: typeBg, color: typeColor }}>
                      {ex.type === "general" ? "General" : ex.type === "dynamic" ? "Dynamic" : "Specific"}
                    </Text>
                    <Pressable
                      onPress={() => openYouTube(ex.name + " exercise demo")}
                      style={{ backgroundColor: "rgba(239,68,68,0.08)", borderWidth: 1, borderColor: "rgba(239,68,68,0.2)", borderRadius: 8, paddingVertical: 4, paddingHorizontal: 12 }}
                    >
                      <Text style={{ color: "#EF4444", fontSize: 12, fontWeight: "600" }}>▶ Watch Demo</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>

          <Pressable
            onPress={startTimer}
            style={{ backgroundColor: "#2D2A24", borderRadius: 16, paddingVertical: 20, alignItems: "center", marginBottom: 16 }}
          >
            <Text style={{ color: "#F6F5F0", fontSize: 20, fontWeight: "700" }}>Start Warm-up</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/(app)/workout-player" as any)}
            style={{ borderWidth: 1, borderColor: "#DDD9CE", borderRadius: 16, paddingVertical: 16, alignItems: "center" }}
          >
            <Text style={{ color: "#8E8E7A", fontSize: 16 }}>Skip Warm-up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
