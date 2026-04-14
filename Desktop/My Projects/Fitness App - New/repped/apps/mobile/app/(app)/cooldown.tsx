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
import { generateCooldown, getCooldownDuration } from "@repped/shared";
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
  white: "#FFFFFF",
};

// ─── View 1: Stretch List Preview ─────────────────────────────────────────────

function StretchListView({
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
        {/* Header */}
        <View style={s.headerRow}>
          <Text style={s.headerLabel}>COOL DOWN</Text>
        </View>

        {/* Dark Hero Card */}
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
              <Text style={s.heroTitle}>Recovery Time</Text>
              <Text style={s.heroSub}>Static stretches · Reduces soreness</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={s.heroDuration}>{Math.ceil(totalDuration / 60)}</Text>
              <Text style={s.heroDurationLabel}>minutes</Text>
            </View>
          </View>

          {/* Info tip */}
          <View style={s.infoTip}>
            <Text style={s.infoTipText}>
              🧘 Deep holds after training improve flexibility and speed up recovery.
            </Text>
          </View>
        </Animated.View>

        {/* Timeline Section */}
        <View style={s.timelineSection}>
          <View style={s.timelineHeader}>
            <Text style={s.timelineTitle}>Stretches</Text>
            <Text style={s.timelineCount}>{exercises.length} stretches</Text>
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
                      isFirst ? s.timelineDotActive : s.timelineDotInactive,
                    ]}
                  />

                  {/* Content */}
                  <View style={s.timelineContent}>
                    <View style={s.timelineNameRow}>
                      <Text style={s.timelineExName}>{ex.name}</Text>
                      <Text style={s.timelineExTime}>Hold {ex.hold_seconds}s</Text>
                    </View>
                    <Text style={s.timelineExDesc}>{ex.instructions}</Text>
                    <View style={s.timelineFooter}>
                      <View style={[s.typePill, { backgroundColor: "rgba(99,102,241,0.1)" }]}>
                        <Text style={[s.typePillText, { color: "#6366F1" }]}>Static</Text>
                      </View>
                      <Pressable
                        onPress={() => openYouTube(ex.name + " stretch demo")}
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
              <Text style={s.summitText}>Ready to stretch</Text>
            </View>
          </View>
        </View>

        {/* Bottom Buttons */}
        <View style={s.bottomButtons}>
          <Pressable onPress={onStart} style={s.primaryBtn}>
            <Text style={s.primaryBtnText}>Start Cool Down</Text>
          </Pressable>
          <Pressable onPress={onSkip} style={s.secondaryBtn}>
            <Text style={s.secondaryBtnText}>Skip</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── View 2: Timer Active ─────────────────────────────────────────────────────

function TimerActiveView({
  exercise,
  exerciseIndex,
  totalExercises,
  timeLeft,
  onSkip,
  onSkipAll,
}: {
  exercise: any;
  exerciseIndex: number;
  totalExercises: number;
  timeLeft: number;
  onSkip: () => void;
  onSkipAll: () => void;
}) {
  // Ring animation
  const ringRotation = useRef(new Animated.Value(0)).current;
  const ringPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Ring pulse breathing
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringPulse, {
          toValue: 0.85,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(ringPulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const progressPct = ((exerciseIndex + 1) / totalExercises) * 100;

  // Ring fill: rotate based on time remaining
  const totalTime = exercise.hold_seconds;
  const elapsed = totalTime - timeLeft;
  const fillPct = totalTime > 0 ? elapsed / totalTime : 0;

  // Border trick ring — show fill via colored borders
  const getBorderColors = (pct: number) => {
    if (pct >= 0.75) return { top: C.trail, right: C.trail, bottom: C.trail, left: C.stone };
    if (pct >= 0.5) return { top: C.trail, right: C.trail, bottom: C.stone, left: C.stone };
    if (pct >= 0.25) return { top: C.trail, right: C.stone, bottom: C.stone, left: C.stone };
    return { top: C.stone, right: C.stone, bottom: C.stone, left: C.stone };
  };
  const bc = getBorderColors(fillPct);

  return (
    <View style={s.timerRoot}>
      <TopoBackground />

      {/* Top */}
      <View style={{ paddingHorizontal: 24, paddingTop: 64 }}>
        <Text style={{ fontSize: 12, color: C.rock, marginBottom: 6 }}>
          Stretch {exerciseIndex + 1} of {totalExercises}
        </Text>
        <View style={{ height: 3, borderRadius: 2, backgroundColor: C.stone }}>
          <View style={{ height: 3, borderRadius: 2, backgroundColor: C.trail, width: `${progressPct}%` }} />
        </View>
      </View>

      {/* Center */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
        {/* Ring timer */}
        <Animated.View style={{ opacity: ringPulse, marginBottom: 24 }}>
          <View style={{ width: 160, height: 160, position: "relative", alignItems: "center", justifyContent: "center" }}>
            {/* Track ring */}
            <View
              style={{
                position: "absolute",
                width: 160,
                height: 160,
                borderRadius: 80,
                borderWidth: 6,
                borderColor: C.stone,
              }}
            />
            {/* Fill ring */}
            <View
              style={{
                position: "absolute",
                width: 160,
                height: 160,
                borderRadius: 80,
                borderWidth: 6,
                borderTopColor: bc.top,
                borderRightColor: bc.right,
                borderBottomColor: bc.bottom,
                borderLeftColor: bc.left,
                transform: [{ rotate: "-45deg" }],
              }}
            />
            {/* Timer number */}
            <Text style={{ fontSize: 48, fontWeight: "800", color: C.earth, letterSpacing: -2 }}>
              {timeLeft}
            </Text>
            <Text style={{ fontSize: 9, fontWeight: "600", color: C.rock, textTransform: "uppercase", letterSpacing: 0.5 }}>
              seconds
            </Text>
          </View>
        </Animated.View>

        <Text style={{ fontSize: 22, fontWeight: "700", color: C.earth, textAlign: "center", letterSpacing: -0.5, marginBottom: 10 }}>
          {exercise.name}
        </Text>
        <Text style={{ fontSize: 13, color: C.rock, textAlign: "center", lineHeight: 20, paddingHorizontal: 16, marginBottom: 12 }}>
          {exercise.instructions}
        </Text>
        <Text style={{ fontSize: 11, color: C.rock, opacity: 0.5, textAlign: "center", marginBottom: 16 }}>
          Targets: {exercise.target_muscles.join(", ")}
        </Text>

        <Pressable
          onPress={() => openYouTube(exercise.name + " stretch demo")}
          style={{
            backgroundColor: "rgba(239,68,68,0.06)",
            borderWidth: 1,
            borderColor: "rgba(239,68,68,0.12)",
            borderRadius: 12,
            paddingVertical: 8,
            paddingHorizontal: 16,
          }}
        >
          <Text style={{ color: "#EF4444", fontSize: 12, fontWeight: "600" }}>▶ Watch Demo</Text>
        </Pressable>
      </View>

      {/* Bottom buttons */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 100 }}>
        <Pressable
          onPress={onSkip}
          style={{
            borderWidth: 1.5,
            borderColor: C.stone,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Text style={{ color: C.rock, fontSize: 14 }}>Skip Stretch</Text>
        </Pressable>
        <Pressable
          onPress={onSkipAll}
          style={{
            borderWidth: 1,
            borderColor: "rgba(0,0,0,0.04)",
            borderRadius: 14,
            paddingVertical: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: C.rock, fontSize: 12, opacity: 0.5 }}>Skip Cool Down</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── View 3: Completion — V3 Streak + Confetti + Bento ────────────────────────

function CompletionView({ exercises }: { exercises: any[] }) {
  // Confetti particles
  const confettiAnims = useRef(
    Array.from({ length: 8 }, () => ({
      y: new Animated.Value(-20),
      opacity: new Animated.Value(0),
      rotate: new Animated.Value(0),
    }))
  ).current;

  // Staggered entrance animations
  const streakScale = useRef(new Animated.Value(0.5)).current;
  const streakOpacity = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(1)).current;
  const elements = useRef(Array.from({ length: 5 }, () => ({
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(12),
  }))).current;

  useEffect(() => {
    // Streak number pop
    Animated.parallel([
      Animated.spring(streakScale, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(streakOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Glow pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1.12,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Staggered element fade-in
    elements.forEach((el, i) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(el.opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(el.translateY, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
      }, 150 + i * 120);
    });

    // Confetti particles — staggered falling
    confettiAnims.forEach((particle, i) => {
      const delay = i * 300;
      const duration = 3000 + Math.random() * 1000;

      const fall = () => {
        particle.y.setValue(-20);
        particle.opacity.setValue(0);
        particle.rotate.setValue(0);

        Animated.parallel([
          Animated.timing(particle.y, {
            toValue: 900,
            duration,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(particle.opacity, { toValue: 0.6, duration: 200, useNativeDriver: true }),
            Animated.timing(particle.opacity, { toValue: 0, duration: duration - 200, useNativeDriver: true }),
          ]),
          Animated.timing(particle.rotate, {
            toValue: 720,
            duration,
            useNativeDriver: true,
          }),
        ]).start(() => fall());
      };

      setTimeout(fall, delay);
    });
  }, []);

  const confettiColors = [C.trail, C.earth, C.trail, C.rock, C.trail, C.earth, C.trail, C.rock];
  const confettiLefts = [12, 28, 48, 65, 82, 38, 55, 20];
  const confettiSizes = [
    { w: 5, h: 5 }, { w: 4, h: 7 }, { w: 6, h: 4 }, { w: 4, h: 6 },
    { w: 5, h: 5 }, { w: 3, h: 6 }, { w: 5, h: 4 }, { w: 4, h: 5 },
  ];

  // Week days data (mock — in real app, fetch from DB)
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const dayStates = ["done", "rest", "done", "rest", "rest", "today", "rest"];

  return (
    <View style={s.root}>
      <TopoBackground />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ alignItems: "center", justifyContent: "center", minHeight: "100%", paddingHorizontal: 24, paddingVertical: 80 }}
      >
        {/* Confetti */}
        {confettiAnims.map((particle, i) => {
          const rotateStr = particle.rotate.interpolate({
            inputRange: [0, 720],
            outputRange: ["0deg", "720deg"],
          });
          return (
            <Animated.View
              key={i}
              style={{
                position: "absolute",
                left: `${confettiLefts[i]}%`,
                top: 0,
                width: confettiSizes[i].w,
                height: confettiSizes[i].h,
                borderRadius: 2,
                backgroundColor: confettiColors[i],
                opacity: particle.opacity,
                transform: [{ translateY: particle.y }, { rotate: rotateStr }],
              }}
            />
          );
        })}

        {/* Streak number with glow */}
        <Animated.View style={{ transform: [{ scale: glowPulse }], marginBottom: -10 }}>
          <View
            style={{
              width: 140,
              height: 140,
              borderRadius: 70,
              backgroundColor: "rgba(52,211,153,0.1)",
              position: "absolute",
              alignSelf: "center",
              top: -30,
            }}
          />
        </Animated.View>

        <Animated.View
          style={{
            transform: [{ scale: streakScale }],
            opacity: streakOpacity,
            marginBottom: 4,
          }}
        >
          <Text style={{ fontSize: 76, fontWeight: "800", color: C.earth, letterSpacing: -4, lineHeight: 80 }}>
            3
          </Text>
        </Animated.View>

        <Animated.View style={{ opacity: elements[0].opacity, transform: [{ translateY: elements[0].translateY }] }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: C.trail, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>
            Day Streak
          </Text>
        </Animated.View>

        <Animated.View style={{ opacity: elements[1].opacity, transform: [{ translateY: elements[1].translateY }], alignItems: "center" }}>
          <Text style={{ fontSize: 24, fontWeight: "700", color: C.earth, letterSpacing: -0.7, marginBottom: 4 }}>
            Session Complete
          </Text>
          <Text style={{ fontSize: 13, color: C.rock, textAlign: "center", marginBottom: 24 }}>
            Workout + recovery done. You showed up.
          </Text>
        </Animated.View>

        {/* Bento stat grid */}
        <Animated.View
          style={{
            opacity: elements[2].opacity,
            transform: [{ translateY: elements[2].translateY }],
            width: "100%",
            marginBottom: 20,
          }}
        >
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
            <View style={[s.bentoTile, { flex: 1 }]}>
              <Text style={s.bentoLabel}>Exercises</Text>
              <Text style={s.bentoVal}>6</Text>
            </View>
            <View style={[s.bentoTile, { flex: 1 }]}>
              <Text style={s.bentoLabel}>Duration</Text>
              <Text style={s.bentoVal}>47m</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={[s.bentoTile, { flex: 1 }]}>
              <Text style={s.bentoLabel}>Volume</Text>
              <Text style={s.bentoVal}>8,420</Text>
            </View>
            <View style={[s.bentoTileDark, { flex: 1 }]}>
              <Text style={s.bentoDarkLabel}>Focus</Text>
              <Text style={s.bentoDarkVal}>Push Day</Text>
            </View>
          </View>
        </Animated.View>

        {/* Week dots */}
        <Animated.View
          style={{
            opacity: elements[3].opacity,
            transform: [{ translateY: elements[3].translateY }],
            flexDirection: "row",
            gap: 8,
            marginBottom: 24,
          }}
        >
          {weekDays.map((day, i) => {
            const state = dayStates[i];
            return (
              <View
                key={i}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor:
                    state === "done" ? C.earth :
                    state === "today" ? C.trail :
                    C.stone,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: "700",
                    color:
                      state === "done" ? C.sand :
                      state === "today" ? C.earth :
                      C.rock,
                  }}
                >
                  {day}
                </Text>
              </View>
            );
          })}
        </Animated.View>

        {/* Done button */}
        <Animated.View
          style={{
            opacity: elements[4].opacity,
            transform: [{ translateY: elements[4].translateY }],
            width: "100%",
          }}
        >
          <Pressable
            onPress={() => router.replace("/(app)")}
            style={s.primaryBtn}
          >
            <Text style={s.primaryBtnText}>Done</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

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
          if (currentExIndex < exercises.length - 1) {
            const nextIdx = currentExIndex + 1;
            setCurrentExIndex(nextIdx);
            return exercises[nextIdx].hold_seconds;
          } else {
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

  // View 3: Completion
  if (isTimerActive && allDone) {
    return <CompletionView exercises={exercises} />;
  }

  // View 2: Timer Active
  if (isTimerActive && !allDone) {
    return (
      <TimerActiveView
        exercise={exercises[currentExIndex]}
        exerciseIndex={currentExIndex}
        totalExercises={exercises.length}
        timeLeft={timeLeft}
        onSkip={skipExercise}
        onSkipAll={() => router.replace("/(app)")}
      />
    );
  }

  // View 1: Stretch List
  return (
    <StretchListView
      exercises={exercises}
      totalDuration={totalDuration}
      onStart={startTimer}
      onSkip={() => router.replace("/(app)")}
    />
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.sand,
  },
  timerRoot: {
    flex: 1,
    backgroundColor: C.sand,
  },

  // Header
  headerRow: {
    paddingHorizontal: 24,
    paddingTop: 56,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: C.rock,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },

  // Hero card
  heroCard: {
    marginHorizontal: 20,
    marginTop: 14,
    padding: 20,
    borderRadius: 22,
    backgroundColor: C.earth,
    position: "relative",
    overflow: "hidden",
  },
  heroDiag1: {
    position: "absolute",
    width: 90,
    height: 1,
    backgroundColor: "rgba(246,245,240,0.04)",
    top: 12,
    right: -6,
    transform: [{ rotate: "-35deg" }],
  },
  heroDiag2: {
    position: "absolute",
    width: 65,
    height: 1,
    backgroundColor: "rgba(246,245,240,0.04)",
    top: 22,
    right: -6,
    transform: [{ rotate: "-35deg" }],
  },
  breathingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.trail,
    position: "absolute",
    top: 18,
    left: 20,
  },
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: C.sand,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 11,
    color: "rgba(246,245,240,0.3)",
    marginTop: 3,
  },
  heroDuration: {
    fontSize: 34,
    fontWeight: "800",
    color: C.sand,
    letterSpacing: -1,
    lineHeight: 36,
  },
  heroDurationLabel: {
    fontSize: 9,
    color: "rgba(246,245,240,0.25)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  infoTip: {
    marginTop: 12,
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(246,245,240,0.04)",
  },
  infoTipText: {
    fontSize: 10,
    color: "rgba(246,245,240,0.25)",
    lineHeight: 14,
  },

  // Timeline
  timelineSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  timelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.earth,
  },
  timelineCount: {
    fontSize: 11,
    color: C.rock,
  },
  timelineContainer: {
    paddingLeft: 30,
    position: "relative",
  },
  timelineLine: {
    position: "absolute",
    left: 5,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: C.stone,
  },
  timelinePulse: {
    position: "absolute",
    left: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.trail,
  },

  // Timeline node
  timelineNode: {
    marginBottom: 6,
    position: "relative",
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: "absolute",
    left: -30,
    top: 14,
    zIndex: 1,
  },
  timelineDotActive: {
    backgroundColor: C.earth,
    width: 14,
    height: 14,
    borderRadius: 7,
    left: -31,
    top: 13,
  },
  timelineDotInactive: {
    backgroundColor: C.stone,
  },

  // Timeline content card
  timelineContent: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  timelineNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timelineExName: {
    fontSize: 14,
    fontWeight: "600",
    color: C.earth,
    flex: 1,
  },
  timelineExTime: {
    fontSize: 12,
    color: C.rock,
    fontWeight: "500",
    marginLeft: 8,
  },
  timelineExDesc: {
    fontSize: 11,
    color: C.rock,
    marginTop: 4,
    lineHeight: 16,
  },
  timelineFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
  },
  typePillText: {
    fontSize: 9,
    fontWeight: "600",
  },
  demoLink: {
    fontSize: 10,
    fontWeight: "600",
    color: C.rock,
  },

  // Summit
  summitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 4,
    marginLeft: -30,
  },
  summitDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.trail,
  },
  summitText: {
    fontSize: 11,
    fontWeight: "600",
    color: C.trail,
  },

  // Buttons
  bottomButtons: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  primaryBtn: {
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: C.earth,
    alignItems: "center",
    marginBottom: 10,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: C.sand,
  },
  secondaryBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.stone,
    alignItems: "center",
  },
  secondaryBtnText: {
    fontSize: 14,
    color: C.rock,
  },

  // Bento tiles (completion)
  bentoTile: {
    backgroundColor: C.stone,
    borderRadius: 16,
    padding: 14,
    paddingHorizontal: 16,
  },
  bentoLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: C.rock,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  bentoVal: {
    fontSize: 22,
    fontWeight: "800",
    color: C.earth,
    letterSpacing: -0.5,
  },
  bentoTileDark: {
    backgroundColor: C.earth,
    borderRadius: 16,
    padding: 14,
    paddingHorizontal: 16,
  },
  bentoDarkLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: "rgba(246,245,240,0.25)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  bentoDarkVal: {
    fontSize: 15,
    fontWeight: "700",
    color: C.sand,
  },
});
