/**
 * Layout A: "The Clean Hub"
 * White bg, centered progress ring hero, clean stat cards, vertical flow.
 * Inspired by Apple Fitness summary screen.
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

export default function LayoutA({
  greeting, date, focus, exerciseCount, dayOfWeek,
  completionPct, streak, hasWellnessLog,
  onStartWorkout, onSkipDay, onWellnessCheck,
}: Props) {
  // Animations
  const ringAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, damping: 15, stiffness: 120, useNativeDriver: true }),
        Animated.timing(ringAnim, { toValue: completionPct, duration: 800, useNativeDriver: false }),
      ]),
    ]).start();
  }, []);

  const ringSize = 160;
  const strokeWidth = 10;
  const radius = (ringSize - strokeWidth) / 2;

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      {/* Greeting */}
      <View style={tw`items-center mb-6`}>
        <Text style={{ color: "#8E8E93", fontSize: 13 }}>{date}</Text>
        <Text style={{ color: "#1C1C1E", fontSize: 24, fontWeight: "700", marginTop: 4 }}>{greeting}</Text>
      </View>

      {/* Hero Progress Ring */}
      <View style={tw`items-center mb-6`}>
        <View style={{ width: ringSize, height: ringSize, alignItems: "center", justifyContent: "center" }}>
          {/* Track */}
          <View style={{
            position: "absolute", width: ringSize, height: ringSize, borderRadius: ringSize / 2,
            borderWidth: strokeWidth, borderColor: "#F2F2F7",
          }} />
          {/* Progress arc — simplified with border trick */}
          <View style={{
            position: "absolute", width: ringSize, height: ringSize, borderRadius: ringSize / 2,
            borderWidth: strokeWidth,
            borderColor: "transparent",
            borderTopColor: "#6366F1",
            borderRightColor: completionPct > 25 ? "#6366F1" : "transparent",
            borderBottomColor: completionPct > 50 ? "#6366F1" : "transparent",
            borderLeftColor: completionPct > 75 ? "#6366F1" : "transparent",
            transform: [{ rotate: "-45deg" }],
          }} />
          {/* Center text */}
          <Text style={{ color: "#6366F1", fontSize: 36, fontWeight: "800" }}>{Math.round(completionPct)}%</Text>
          <Text style={{ color: "#8E8E93", fontSize: 12, marginTop: -2 }}>complete</Text>
        </View>
      </View>

      {/* Stats Row */}
      <Animated.View style={[tw`flex-row gap-3 mb-6`, { transform: [{ translateY: slideAnim }] }]}>
        <View style={[tw`flex-1 rounded-2xl p-4 items-center`, { backgroundColor: "#F2F2F7" }]}>
          <Text style={{ color: "#6366F1", fontSize: 24, fontWeight: "800" }}>{exerciseCount}</Text>
          <Text style={{ color: "#8E8E93", fontSize: 11 }}>exercises</Text>
        </View>
        <View style={[tw`flex-1 rounded-2xl p-4 items-center`, { backgroundColor: "#F2F2F7" }]}>
          <Text style={{ color: "#F97316", fontSize: 24, fontWeight: "800" }}>{streak}w</Text>
          <Text style={{ color: "#8E8E93", fontSize: 11 }}>streak</Text>
        </View>
        <View style={[tw`flex-1 rounded-2xl p-4 items-center`, { backgroundColor: "#F2F2F7" }]}>
          <Text style={{ color: "#22C55E", fontSize: 24, fontWeight: "800" }}>Day {dayOfWeek}</Text>
          <Text style={{ color: "#8E8E93", fontSize: 11 }}>this week</Text>
        </View>
      </Animated.View>

      {/* Workout Card */}
      <Animated.View style={[
        tw`rounded-3xl p-6 mb-4`,
        { backgroundColor: "#F2F2F7", transform: [{ translateY: slideAnim }] },
      ]}>
        <Text style={{ color: "#8E8E93", fontSize: 11, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Today's Workout</Text>
        <Text style={{ color: "#1C1C1E", fontSize: 28, fontWeight: "800", marginBottom: 4 }}>{focus}</Text>
        <Text style={{ color: "#8E8E93", fontSize: 14, marginBottom: 16 }}>{exerciseCount} exercises</Text>
        <Pressable onPress={onStartWorkout} style={[tw`rounded-2xl py-4 items-center`, { backgroundColor: "#6366F1" }]}>
          <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>Start Workout</Text>
        </Pressable>
      </Animated.View>

      {/* Wellness check */}
      {!hasWellnessLog && (
        <Pressable onPress={onWellnessCheck} style={[tw`rounded-2xl py-4 items-center mb-4`, { backgroundColor: "#F2F2F7" }]}>
          <Text style={{ color: "#6366F1", fontSize: 15, fontWeight: "600" }}>Log Wellness Check</Text>
        </Pressable>
      )}

      {/* Skip */}
      <Pressable onPress={onSkipDay} style={[tw`rounded-2xl py-3 items-center`, { backgroundColor: "rgba(0,0,0,0.03)" }]}>
        <Text style={{ color: "#8E8E93", fontSize: 14 }}>Skip Today</Text>
      </Pressable>
    </Animated.View>
  );
}
