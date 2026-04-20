import { View, Animated, StyleSheet } from "react-native";
import { useEffect, useRef } from "react";

const C = {
  bg: "#F6F5F0",
  bone: "#EDEBE5",
  shine: "#F6F5F0",
};

/** A single pulsing skeleton block */
export function SkeletonBlock({
  width,
  height,
  borderRadius = 12,
  style,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}) {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius, backgroundColor: C.bone, opacity: pulse },
        style,
      ]}
    />
  );
}

/** Home screen skeleton — matches the real layout to prevent shift */
export function HomeSkeleton() {
  return (
    <View style={s.container}>
      {/* Profile row */}
      <View style={s.profileRow}>
        <SkeletonBlock width={44} height={44} borderRadius={22} />
        <View style={{ gap: 6 }}>
          <SkeletonBlock width={90} height={12} borderRadius={6} />
          <SkeletonBlock width={130} height={16} borderRadius={8} />
        </View>
      </View>

      {/* Hero text */}
      <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
        <SkeletonBlock width={180} height={10} borderRadius={5} style={{ marginBottom: 10 }} />
        <SkeletonBlock width={260} height={26} borderRadius={10} />
      </View>

      {/* Workout card */}
      <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
        <SkeletonBlock width="100%" height={180} borderRadius={22} />
      </View>

      {/* Stats row */}
      <View style={{ paddingHorizontal: 24, flexDirection: "row", gap: 12 }}>
        <SkeletonBlock width="48%" height={100} borderRadius={18} />
        <SkeletonBlock width="48%" height={100} borderRadius={18} />
      </View>
    </View>
  );
}

/** Meals screen skeleton */
export function MealsSkeleton() {
  return (
    <View style={s.container}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 60, marginBottom: 24 }}>
        <SkeletonBlock width={100} height={24} borderRadius={10} style={{ marginBottom: 16 }} />
        <SkeletonBlock width={160} height={36} borderRadius={12} style={{ marginBottom: 8 }} />
        <SkeletonBlock width={200} height={14} borderRadius={7} />
      </View>

      {/* Macro bar */}
      <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
        <SkeletonBlock width="100%" height={8} borderRadius={4} style={{ marginBottom: 16 }} />
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <SkeletonBlock width={60} height={12} borderRadius={6} />
          <SkeletonBlock width={60} height={12} borderRadius={6} />
          <SkeletonBlock width={60} height={12} borderRadius={6} />
        </View>
      </View>

      {/* Meal cards */}
      {[1, 2, 3].map((i) => (
        <View key={i} style={{ paddingHorizontal: 24, marginBottom: 12 }}>
          <SkeletonBlock width="100%" height={110} borderRadius={22} />
        </View>
      ))}
    </View>
  );
}

/** Progress screen skeleton */
export function ProgressSkeleton() {
  return (
    <View style={s.container}>
      <View style={{ paddingHorizontal: 24, paddingTop: 60, marginBottom: 24 }}>
        <SkeletonBlock width={120} height={24} borderRadius={10} style={{ marginBottom: 20 }} />
      </View>

      {/* Heatmap area */}
      <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
        <SkeletonBlock width="100%" height={140} borderRadius={18} />
      </View>

      {/* Stat cards */}
      <View style={{ paddingHorizontal: 24, flexDirection: "row", gap: 12, marginBottom: 16 }}>
        <SkeletonBlock width="48%" height={90} borderRadius={18} />
        <SkeletonBlock width="48%" height={90} borderRadius={18} />
      </View>

      {/* Chart */}
      <View style={{ paddingHorizontal: 24 }}>
        <SkeletonBlock width="100%" height={200} borderRadius={22} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  profileRow: {
    paddingHorizontal: 24,
    paddingTop: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
  },
});
