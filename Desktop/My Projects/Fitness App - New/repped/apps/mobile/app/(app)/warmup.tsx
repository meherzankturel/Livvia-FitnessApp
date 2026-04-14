import {
  View,
  Text,
  ScrollView,
  Pressable,
  Vibration,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useRef, useMemo } from "react";
import { generateWarmup, getWarmupDuration } from "@repped/shared";
import { openYouTube } from "../../src/lib/deeplink";
import { TopoBackground } from "../../src/components/terrain";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Terrain palette
const C = {
  earth: "#2D2A24",
  sand: "#F6F5F0",
  trail: "#34D399",
  rock: "#8E8E7A",
  stone: "#EDEBE5",
};

function getTypeBadge(type: string) {
  if (type === "general") return { bg: "rgba(52,211,153,0.1)", color: C.trail, label: "General" };
  if (type === "dynamic") return { bg: "rgba(245,158,11,0.1)", color: "#F59E0B", label: "Dynamic" };
  return { bg: "rgba(99,102,241,0.1)", color: "#6366F1", label: "Specific" };
}

function formatDuration(seconds: number) {
  return seconds >= 60 ? `${Math.round(seconds / 60)} min` : `${seconds}s`;
}

// ─── View 1: Exercise List Preview ───────────────────────────────────────────

function ExerciseListView({
  exercises,
  totalDuration,
  onStart,
  onSkip,
}: {
  exercises: any[];
  totalDuration: number;
  onStart: () => void;
  onSkip: () => void;
}) {
  // Animations
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroTranslateY = useRef(new Animated.Value(18)).current;
  const breathingDot = useRef(new Animated.Value(0.15)).current;
  const pulseY = useRef(new Animated.Value(0)).current;
  const dotAnimations = useRef(exercises.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Hero fade in
    Animated.parallel([
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(heroTranslateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Breathing dot loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathingDot, {
          toValue: 0.35,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(breathingDot, {
          toValue: 0.15,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse traveling down the timeline
    const timelineHeight = exercises.length * 120 + 40;
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseY, {
          toValue: timelineHeight,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseY, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Staggered dot fade-in
    const staggerAnims = dotAnimations.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 350,
        delay: 200 + i * 100,
        useNativeDriver: true,
      })
    );
    Animated.stagger(100, staggerAnims).start();
  }, []);

  const pulseOpacity = pulseY.interpolate({
    inputRange: [0, 40, 80, 120],
    outputRange: [0, 0.4, 0.4, 0],
    extrapolate: "clamp",
  });

  return (
    <View style={s.root}>
      <TopoBackground />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* ── Header ── */}
        <View style={s.headerRow}>
          <Text style={s.headerLabel}>WARM UP</Text>
        </View>

        {/* ── Dark Hero Card ── */}
        <Animated.View
          style={[
            s.heroCard,
            { opacity: heroOpacity, transform: [{ translateY: heroTranslateY }] },
          ]}
        >
          {/* Diagonal accent lines */}
          <View style={s.heroDiag1} />
          <View style={s.heroDiag2} />

          {/* Breathing green dot */}
          <Animated.View style={[s.breathingDot, { opacity: breathingDot }]} />

          {/* Content row */}
          <View style={s.heroRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.heroTitle}>Get Ready</Text>
              <Text style={s.heroSub}>Dynamic stretches · Prevents injury</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={s.heroDuration}>{Math.ceil(totalDuration / 60)}</Text>
              <Text style={s.heroDurationLabel}>minutes</Text>
            </View>
          </View>

          {/* Info tip pill */}
          <View style={s.infoTip}>
            <Text style={s.infoTipText}>
              💡 Dynamic movements prep your muscles without weakening them.
            </Text>
          </View>
        </Animated.View>

        {/* ── Timeline Section ── */}
        <View style={s.timelineSection}>
          <View style={s.timelineHeader}>
            <Text style={s.timelineTitle}>Exercises</Text>
            <Text style={s.timelineCount}>{exercises.length} exercises</Text>
          </View>

          <View style={s.timelineContainer}>
            {/* Vertical connecting line */}
            <View style={s.timelineLine} />

            {/* Green pulse */}
            <Animated.View
              style={[
                s.timelinePulse,
                {
                  opacity: pulseOpacity,
                  transform: [{ translateY: pulseY }],
                },
              ]}
            />

            {exercises.map((ex, i) => {
              const badge = getTypeBadge(ex.type);
              const isFirst = i === 0;

              return (
                <Animated.View
                  key={i}
                  style={[s.timelineNode, { opacity: dotAnimations[i] }]}
                >
                  {/* Dot */}
                  <View
                    style={[
                      s.timelineDot,
                      isFirst
                        ? s.timelineDotActive
                        : s.timelineDotInactive,
                    ]}
                  />

                  {/* Content */}
                  <View style={s.timelineContent}>
                    <View style={s.timelineNameRow}>
                      <Text style={s.timelineExName}>{ex.name}</Text>
                      <Text style={s.timelineExTime}>{formatDuration(ex.duration_seconds)}</Text>
                    </View>
                    <Text style={s.timelineExDesc}>{ex.instructions}</Text>
                    <View style={s.timelineFooter}>
                      <View style={[s.typePill, { backgroundColor: badge.bg }]}>
                        <Text style={[s.typePillText, { color: badge.color }]}>
                          {badge.label}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => openYouTube(ex.name + " exercise demo")}
                        hitSlop={8}
                      >
                        <Text style={s.demoLink}>▶ Demo</Text>
                      </Pressable>
                    </View>
                  </View>
                </Animated.View>
              );
            })}

            {/* Summit marker */}
            <View style={s.summitRow}>
              <View style={s.summitDot} />
              <Text style={s.summitText}>Ready to start</Text>
            </View>
          </View>
        </View>

        {/* ── Bottom Buttons ── */}
        <View style={s.bottomButtons}>
          <Pressable onPress={onStart} style={s.primaryBtn}>
            <Text style={s.primaryBtnText}>Start Warm-up</Text>
          </Pressable>
          <Pressable onPress={onSkip} style={s.secondaryBtn}>
            <Text style={s.secondaryBtnText}>Skip</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── View 2: Timer Active ────────────────────────────────────────────────────

function TimerActiveView({
  exercises,
  currentExIndex,
  timeLeft,
  onSkipExercise,
  onSkipWarmup,
}: {
  exercises: any[];
  currentExIndex: number;
  timeLeft: number;
  onSkipExercise: () => void;
  onSkipWarmup: () => void;
}) {
  const currentEx = exercises[currentExIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeDisplay =
    minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, "0")}` : `${seconds}`;
  const badge = getTypeBadge(currentEx.type);

  return (
    <View style={s.timerRoot}>
      <TopoBackground />

      {/* Progress */}
      <View>
        <Text style={s.timerProgress}>
          Exercise {currentExIndex + 1} of {exercises.length}
        </Text>
        <View style={s.progressTrack}>
          <View
            style={[
              s.progressFill,
              { width: `${((currentExIndex + 1) / exercises.length) * 100}%` as any },
            ]}
          />
        </View>
      </View>

      {/* Center — Ring Timer */}
      <View style={{ alignItems: "center" }}>
        <Text style={s.timerExName}>{currentEx.name}</Text>

        <View style={[s.timerBadge, { backgroundColor: badge.bg }]}>
          <Text style={[s.timerBadgeText, { color: badge.color }]}>{badge.label}</Text>
        </View>

        {/* Ring */}
        <View style={s.timerRing}>
          <View style={s.timerRingTrack} />
          <View style={s.timerRingFill} />
          <View style={{ alignItems: "center", position: "relative" as const, zIndex: 1 }}>
            <Text style={s.timerDisplay}>{timeDisplay}</Text>
            <Text style={s.timerRingLabel}>seconds</Text>
          </View>
        </View>

        <Text style={s.timerInstructions}>{currentEx.instructions}</Text>

        <Pressable
          onPress={() => openYouTube(currentEx.name + " exercise demo")}
          style={s.timerDemo}
        >
          <Text style={s.timerDemoText}>▶ Watch Demo</Text>
        </Pressable>
      </View>

      {/* Buttons */}
      <View>
        <Pressable onPress={onSkipExercise} style={s.skipExBtn}>
          <Text style={s.skipExText}>Skip Exercise</Text>
        </Pressable>
        <Pressable onPress={onSkipWarmup} style={s.skipWarmupBtn}>
          <Text style={s.skipWarmupText}>Skip Warm-up</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── View 3: Completion ──────────────────────────────────────────────────────

function CompletionView() {
  return (
    <View style={s.completionRoot}>
      <TopoBackground />
      <Text style={s.completionCheck}>✓</Text>
      <Text style={s.completionTitle}>Warm-up Complete!</Text>
      <Text style={s.completionMsg}>You're ready to crush this workout.</Text>

      <Pressable
        onPress={() => router.push("/(app)/workout-player" as any)}
        style={s.completionPrimary}
      >
        <Text style={s.completionPrimaryText}>Start Workout</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/(app)/workout-player" as any)}
        style={s.completionSecondary}
      >
        <Text style={s.completionSecondaryText}>Skip</Text>
      </Pressable>
    </View>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

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
    return <CompletionView />;
  }

  // Timer mode — active exercise
  if (isTimerActive && !allDone) {
    return (
      <TimerActiveView
        exercises={exercises}
        currentExIndex={currentExIndex}
        timeLeft={timeLeft}
        onSkipExercise={skipExercise}
        onSkipWarmup={() => router.push("/(app)/workout-player" as any)}
      />
    );
  }

  // Default: exercise list view
  return (
    <ExerciseListView
      exercises={exercises}
      totalDuration={totalDuration}
      onStart={startTimer}
      onSkip={() => router.push("/(app)/workout-player" as any)}
    />
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // ── Root / Layout ──
  root: {
    flex: 1,
    backgroundColor: C.sand,
  },

  // ── Header ──
  headerRow: {
    paddingTop: 60,
    paddingBottom: 6,
    alignItems: "center",
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: C.rock,
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  // ── Hero Card ──
  heroCard: {
    marginHorizontal: 24,
    marginTop: 14,
    padding: 22,
    borderRadius: 24,
    backgroundColor: C.earth,
    overflow: "hidden",
  },
  heroDiag1: {
    position: "absolute",
    top: -30,
    left: -20,
    width: 200,
    height: 2,
    backgroundColor: "rgba(246,245,240,0.04)",
    transform: [{ rotate: "35deg" }],
  },
  heroDiag2: {
    position: "absolute",
    top: -10,
    left: -20,
    width: 240,
    height: 2,
    backgroundColor: "rgba(246,245,240,0.04)",
    transform: [{ rotate: "35deg" }],
  },
  breathingDot: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.trail,
  },
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: C.sand,
  },
  heroSub: {
    fontSize: 11,
    color: "rgba(246,245,240,0.3)",
    marginTop: 4,
  },
  heroDuration: {
    fontSize: 32,
    fontWeight: "900",
    color: C.sand,
  },
  heroDurationLabel: {
    fontSize: 9,
    color: "rgba(246,245,240,0.2)",
    marginTop: -2,
  },
  infoTip: {
    marginTop: 16,
    backgroundColor: "rgba(52,211,153,0.04)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  infoTipText: {
    fontSize: 11,
    color: C.trail,
    lineHeight: 16,
  },

  // ── Timeline Section ──
  timelineSection: {
    paddingHorizontal: 24,
    marginTop: 28,
  },
  timelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: C.earth,
  },
  timelineCount: {
    fontSize: 10,
    color: C.rock,
  },
  timelineContainer: {
    paddingLeft: 34,
    position: "relative",
  },
  timelineLine: {
    position: "absolute",
    left: 6,
    top: 6,
    bottom: 0,
    width: 2,
    backgroundColor: C.stone,
  },
  timelinePulse: {
    position: "absolute",
    left: 5,
    top: 0,
    width: 4,
    height: 24,
    borderRadius: 2,
    backgroundColor: C.trail,
  },
  timelineNode: {
    position: "relative",
    marginBottom: 18,
  },
  timelineDot: {
    position: "absolute",
    left: -28,
    top: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  timelineDotActive: {
    backgroundColor: C.trail,
    borderColor: C.trail,
    shadowColor: C.trail,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  timelineDotInactive: {
    backgroundColor: C.sand,
    borderColor: C.stone,
  },
  timelineContent: {
    flex: 1,
  },
  timelineNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timelineExName: {
    fontSize: 16,
    fontWeight: "600",
    color: C.earth,
    flex: 1,
  },
  timelineExTime: {
    fontSize: 13,
    color: C.rock,
    marginLeft: 8,
  },
  timelineExDesc: {
    fontSize: 13,
    color: C.rock,
    lineHeight: 19.5,
    marginTop: 4,
  },
  timelineFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  typePillText: {
    fontSize: 10,
    fontWeight: "600",
  },
  demoLink: {
    fontSize: 11,
    color: C.trail,
    fontWeight: "600",
    marginLeft: "auto",
  },

  // Summit marker
  summitRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    position: "relative",
  },
  summitDot: {
    position: "absolute",
    left: -26,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(52,211,153,0.25)",
  },
  summitText: {
    fontSize: 11,
    color: C.trail,
    fontWeight: "600",
  },

  // ── Bottom Buttons ──
  bottomButtons: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 10,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: C.earth,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: "center",
  },
  primaryBtnText: {
    color: C.sand,
    fontSize: 15,
    fontWeight: "600",
  },
  secondaryBtn: {
    flex: 0.5,
    backgroundColor: C.stone,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: C.earth,
    fontSize: 15,
    fontWeight: "600",
  },

  // ── Timer Active (View 2) ──
  timerRoot: {
    flex: 1,
    backgroundColor: C.sand,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 100,
  },
  timerProgress: {
    color: C.rock,
    fontSize: 14,
    marginBottom: 6,
  },
  progressTrack: {
    backgroundColor: C.stone,
    borderRadius: 99,
    height: 8,
    marginBottom: 32,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: C.trail,
    borderRadius: 99,
    height: 8,
  },
  timerExName: {
    color: C.earth,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  timerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
    marginBottom: 16,
  },
  timerBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  timerRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    marginBottom: 14,
    position: "relative" as const,
  },
  timerRingTrack: {
    position: "absolute" as const,
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 80,
    borderWidth: 9,
    borderColor: C.stone,
  },
  timerRingFill: {
    position: "absolute" as const,
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 80,
    borderWidth: 9,
    borderTopColor: C.trail,
    borderRightColor: C.trail,
    borderBottomColor: C.trail,
    borderLeftColor: "transparent",
    transform: [{ rotate: "-90deg" }],
  },
  timerDisplay: {
    color: C.earth,
    fontSize: 48,
    fontWeight: "900" as const,
    letterSpacing: -2,
    lineHeight: 48,
  },
  timerRingLabel: {
    fontSize: 8,
    color: C.rock,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    fontWeight: "600" as const,
    marginTop: 2,
  },
  timerInstructions: {
    color: C.rock,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 16,
    lineHeight: 21,
  },
  timerDemo: {
    backgroundColor: "rgba(52,211,153,0.08)",
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.25)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  timerDemoText: {
    color: C.trail,
    fontSize: 14,
    fontWeight: "600",
  },
  skipExBtn: {
    backgroundColor: C.stone,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  skipExText: {
    color: C.earth,
    fontSize: 16,
    fontWeight: "600",
  },
  skipWarmupBtn: {
    backgroundColor: "transparent",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  skipWarmupText: {
    color: C.rock,
    fontSize: 14,
  },

  // ── Completion (View 3) ──
  completionRoot: {
    flex: 1,
    backgroundColor: C.sand,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  completionCheck: {
    fontSize: 48,
    color: C.trail,
    fontWeight: "700",
    marginBottom: 16,
  },
  completionTitle: {
    color: C.earth,
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 8,
  },
  completionMsg: {
    color: C.rock,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  completionPrimary: {
    backgroundColor: C.earth,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
  },
  completionPrimaryText: {
    color: C.sand,
    fontSize: 20,
    fontWeight: "700",
  },
  completionSecondary: {
    backgroundColor: C.stone,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: "center",
    width: "100%",
  },
  completionSecondaryText: {
    color: C.earth,
    fontSize: 16,
    fontWeight: "600",
  },
});
