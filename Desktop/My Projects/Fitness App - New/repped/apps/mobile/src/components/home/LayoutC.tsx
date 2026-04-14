/**
 * Layout C: "The Bold Minimal"
 * Giant animated number as hero, ultra-clean, almost no decoration.
 * The number IS the design. Everything else is secondary.
 * Inspired by high-end dashboard UIs and Apple's bold typography.
 */
import { View, Text, Pressable, Animated } from "react-native";
import { useEffect, useRef } from "react";
import tw from "../../lib/tw";

interface Props {
  greeting: string;
  date: string;
  focus: string;
  exerciseCount: number;
  dayOfWeek: number;
  completionPct: number;
  streak: number;
  hasWellnessLog: boolean;
  onStartWorkout: () => void;
  onSkipDay: () => void;
  onWellnessCheck: () => void;
}

export default function LayoutC({
  greeting, date, focus, exerciseCount, dayOfWeek,
  completionPct, streak, hasWellnessLog,
  onStartWorkout, onSkipDay, onWellnessCheck,
}: Props) {
  const numberAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    // Number counts up
    Animated.timing(numberAnim, {
      toValue: completionPct,
      duration: 1200,
      useNativeDriver: false,
    }).start();

    // Content fades in
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(cardSlide, { toValue: 0, damping: 16, stiffness: 100, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  // Interpolated display number
  const displayNumber = numberAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0", String(Math.round(completionPct))],
  });

  return (
    <View>
      {/* Date — tiny, top right */}
      <Text style={{ color: "#C7C7CC", fontSize: 12, textAlign: "right", marginBottom: 20 }}>{date}</Text>

      {/* THE NUMBER — hero element */}
      <View style={tw`items-center mb-2`}>
        <View style={tw`flex-row items-end`}>
          <AnimatedNumber value={completionPct} />
          <Text style={{ color: "#C7C7CC", fontSize: 32, fontWeight: "300", marginBottom: 12, marginLeft: 2 }}>%</Text>
        </View>
        <Text style={{ color: "#8E8E93", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", fontWeight: "500" }}>
          of today complete
        </Text>
      </View>

      {/* Thin progress bar */}
      <View style={[tw`mx-12 rounded-full overflow-hidden mb-10`, { height: 4, backgroundColor: "#F2F2F7" }]}>
        <Animated.View style={[tw`rounded-full h-full`, {
          backgroundColor: "#6366F1",
          width: numberAnim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }),
        }]} />
      </View>

      {/* Workout — ultra clean */}
      <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: cardSlide }] }]}>
        <View style={tw`mb-8`}>
          <Text style={{ color: "#C7C7CC", fontSize: 11, fontWeight: "600", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Workout</Text>
          <Text style={{ color: "#1C1C1E", fontSize: 34, fontWeight: "800", letterSpacing: -1, marginBottom: 4 }}>{focus}</Text>
          <Text style={{ color: "#8E8E93", fontSize: 15 }}>{exerciseCount} exercises</Text>
        </View>

        {/* Start button — full width, bold */}
        <Pressable onPress={onStartWorkout} style={[tw`rounded-2xl py-5 items-center mb-4`, { backgroundColor: "#1C1C1E" }]}>
          <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700", letterSpacing: 0.5 }}>Begin</Text>
        </Pressable>

        {/* Minimal stats — single line */}
        <View style={tw`flex-row justify-center gap-8 mb-8`}>
          <View style={tw`items-center`}>
            <Text style={{ color: "#1C1C1E", fontSize: 20, fontWeight: "700" }}>{streak}</Text>
            <Text style={{ color: "#C7C7CC", fontSize: 11, marginTop: 2 }}>week streak</Text>
          </View>
          <View style={{ width: 1, backgroundColor: "#E5E5EA" }} />
          <View style={tw`items-center`}>
            <Text style={{ color: "#1C1C1E", fontSize: 20, fontWeight: "700" }}>Day {dayOfWeek}</Text>
            <Text style={{ color: "#C7C7CC", fontSize: 11, marginTop: 2 }}>this week</Text>
          </View>
          <View style={{ width: 1, backgroundColor: "#E5E5EA" }} />
          <View style={tw`items-center`}>
            <Text style={{ color: "#1C1C1E", fontSize: 20, fontWeight: "700" }}>{exerciseCount}</Text>
            <Text style={{ color: "#C7C7CC", fontSize: 11, marginTop: 2 }}>exercises</Text>
          </View>
        </View>

        {/* Wellness + Skip — almost invisible */}
        {!hasWellnessLog && (
          <Pressable onPress={onWellnessCheck} style={tw`py-3 items-center mb-2`}>
            <Text style={{ color: "#6366F1", fontSize: 14, fontWeight: "500" }}>Wellness Check</Text>
          </Pressable>
        )}

        <Pressable onPress={onSkipDay} style={tw`py-3 items-center`}>
          <Text style={{ color: "#D1D1D6", fontSize: 13 }}>Not today</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

/** Animated counting number */
function AnimatedNumber({ value }: { value: number }) {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: value,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  // We can't directly interpolate to text in RN Animated,
  // so use a workaround with multiple digits
  return (
    <Text style={{ color: "#1C1C1E", fontSize: 96, fontWeight: "800", letterSpacing: -4, lineHeight: 96 }}>
      {Math.round(value)}
    </Text>
  );
}
