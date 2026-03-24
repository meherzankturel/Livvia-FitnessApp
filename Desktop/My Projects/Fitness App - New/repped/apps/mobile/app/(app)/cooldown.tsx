import { View, Text, ScrollView, Pressable, Vibration } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { generateCooldown, getCooldownDuration } from "@repped/shared";
import { openYouTube } from "../../src/lib/deeplink";
import { TopoBackground } from "../../src/components/terrain";

export default function Cooldown() {
  const { focus } = useLocalSearchParams<{ focus: string }>();
  const exercises = generateCooldown(focus || "Full Body A");
  const totalDuration = getCooldownDuration(exercises);

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
          // Auto-advance to next stretch
          if (currentExIndex < exercises.length - 1) {
            const nextIdx = currentExIndex + 1;
            setCurrentExIndex(nextIdx);
            return exercises[nextIdx].hold_seconds;
          } else {
            // All stretches done
            setCurrentExIndex(exercises.length);
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
    setTimeLeft(exercises[0].hold_seconds);
    setIsTimerActive(true);
  };

  const skipExercise = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;

    if (currentExIndex < exercises.length - 1) {
      const nextIdx = currentExIndex + 1;
      setCurrentExIndex(nextIdx);
      setTimeLeft(exercises[nextIdx].hold_seconds);
    } else {
      setCurrentExIndex(exercises.length);
      setTimeLeft(0);
    }
  };

  const allDone = currentExIndex >= exercises.length;

  // Timer mode — all stretches completed
  if (isTimerActive && allDone) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F6F5F0", justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
        <TopoBackground />
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🧘</Text>
        <Text style={{ color: "#2D2A24", fontSize: 30, fontWeight: "700", marginBottom: 8 }}>Cool Down Complete!</Text>
        <Text style={{ color: "#8E8E7A", fontSize: 16, textAlign: "center", marginBottom: 32 }}>
          Great recovery session. Your muscles will thank you.
        </Text>

        <Pressable
          onPress={() => router.replace("/(app)")}
          style={{ backgroundColor: "#34D399", borderRadius: 16, paddingVertical: 20, paddingHorizontal: 40, alignItems: "center" }}
        >
          <Text style={{ color: "#2D2A24", fontSize: 20, fontWeight: "700" }}>Done</Text>
        </Pressable>
      </View>
    );
  }

  // Timer mode — active stretch
  if (isTimerActive && !allDone) {
    const currentEx = exercises[currentExIndex];
    const timeDisplay = `${timeLeft}`;

    return (
      <View style={{ flex: 1, backgroundColor: "#F6F5F0", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 64, paddingBottom: 40 }}>
        <TopoBackground />
        <View>
          <Text style={{ color: "#8E8E7A", fontSize: 16, marginBottom: 4 }}>
            Stretch {currentExIndex + 1} of {exercises.length}
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

          <Text style={{ color: "#2D2A24", fontSize: 96, fontWeight: "700", marginBottom: 16 }}>{timeDisplay}</Text>

          <Text style={{ color: "#8E8E7A", fontSize: 16, textAlign: "center", paddingHorizontal: 16, marginBottom: 16 }}>{currentEx.instructions}</Text>

          <Text style={{ color: "#AEAEB2", fontSize: 14, textAlign: "center" }}>
            Targets: {currentEx.target_muscles.join(", ")}
          </Text>

          <Pressable
            onPress={() => openYouTube(currentEx.name + " stretch demo")}
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
            <Text style={{ color: "#8E8E7A", fontSize: 16 }}>Skip Stretch</Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace("/(app)")}
            style={{ borderWidth: 1, borderColor: "#EDEBE5", borderRadius: 16, paddingVertical: 12, alignItems: "center" }}
          >
            <Text style={{ color: "#AEAEB2", fontSize: 14 }}>Skip Cool Down</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Default: stretch list view
  return (
    <View style={{ flex: 1, backgroundColor: "#F6F5F0" }}>
      <TopoBackground />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ paddingHorizontal: 24, paddingTop: 64 }}>
          <Text style={{ color: "#8E8E7A", fontSize: 16, marginBottom: 4 }}>Great Work!</Text>
          <Text style={{ color: "#2D2A24", fontSize: 30, fontWeight: "700", marginBottom: 8 }}>Cool Down</Text>
          <Text style={{ color: "#8E8E7A", fontSize: 16, marginBottom: 24 }}>
            {Math.ceil(totalDuration / 60)} minutes of stretching — helps recovery and reduces soreness
          </Text>

          <View style={{ backgroundColor: "rgba(99,102,241,0.06)", borderWidth: 1, borderColor: "rgba(99,102,241,0.15)", borderRadius: 12, padding: 12, marginBottom: 16 }}>
            <Text style={{ color: "#6366F1", fontSize: 12, fontWeight: "600", marginBottom: 4 }}>Static deep stretches</Text>
            <Text style={{ color: "#8E8E7A", fontSize: 12, lineHeight: 16 }}>
              Hold each stretch for the full duration. Deep holds after training improve flexibility and speed up recovery.
            </Text>
          </View>

          <View style={{ gap: 12, marginBottom: 32 }}>
            {exercises.map((ex, i) => (
              <View key={i} style={{ borderRadius: 16, padding: 20, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "rgba(0,0,0,0.04)" }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <Text style={{ color: "#2D2A24", fontSize: 18, fontWeight: "600" }}>{ex.name}</Text>
                  <Text style={{ color: "#8E8E7A", fontSize: 14 }}>Hold {ex.hold_seconds}s</Text>
                </View>
                <Text style={{ color: "#8E8E7A", fontSize: 14, marginBottom: 8 }}>{ex.instructions}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={{ color: "#AEAEB2", fontSize: 12 }}>
                    Targets: {ex.target_muscles.join(", ")}
                  </Text>
                  <Pressable
                    onPress={() => openYouTube(ex.name + " stretch demo")}
                    style={{ backgroundColor: "rgba(239,68,68,0.08)", borderWidth: 1, borderColor: "rgba(239,68,68,0.2)", borderRadius: 8, paddingVertical: 4, paddingHorizontal: 12 }}
                  >
                    <Text style={{ color: "#EF4444", fontSize: 12, fontWeight: "600" }}>▶ Watch Demo</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>

          <Pressable
            onPress={startTimer}
            style={{ backgroundColor: "#34D399", borderRadius: 16, paddingVertical: 20, alignItems: "center", marginBottom: 16 }}
          >
            <Text style={{ color: "#2D2A24", fontSize: 20, fontWeight: "700" }}>Start Cool Down</Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace("/(app)")}
            style={{ borderWidth: 1, borderColor: "#DDD9CE", borderRadius: 16, paddingVertical: 16, alignItems: "center" }}
          >
            <Text style={{ color: "#8E8E7A", fontSize: 16 }}>Skip Cool Down</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
