/**
 * Consistent muscle group icons — same style, same weight, same feel.
 * Built with Views. Every exercise card uses this.
 * Color = muscle group. Shape = muscle group. 100% uniform.
 */
import { View } from "react-native";

interface Props {
  muscleGroup: string;
  size: number;
}

const COLORS: Record<string, { bg: string; fg: string }> = {
  chest:      { bg: "#FEE2E2", fg: "#EF4444" },
  back:       { bg: "#DBEAFE", fg: "#3B82F6" },
  shoulders:  { bg: "#FFEDD5", fg: "#F97316" },
  biceps:     { bg: "#EDE9FE", fg: "#8B5CF6" },
  triceps:    { bg: "#FCE7F3", fg: "#EC4899" },
  quads:      { bg: "#D1FAE5", fg: "#10B981" },
  hamstrings: { bg: "#D1FAE5", fg: "#059669" },
  glutes:     { bg: "#FEF3C7", fg: "#F59E0B" },
  calves:     { bg: "#CCFBF1", fg: "#14B8A6" },
  core:       { bg: "#CFFAFE", fg: "#06B6D4" },
  full_body:  { bg: "#EDE9FE", fg: "#6366F1" },
};

export default function MuscleIcon({ muscleGroup, size }: Props) {
  const c = COLORS[muscleGroup] || COLORS.full_body;
  const s = size;
  const bar = Math.max(3, s * 0.07);

  // Each muscle group gets a unique but consistent geometric pattern.
  // All use the same visual weight and roundness.

  const renderPattern = () => {
    switch (muscleGroup) {
      case "chest":
        // Two horizontal bars — like a bench press
        return (
          <>
            <View style={{ width: s * 0.5, height: bar * 2, backgroundColor: c.fg, borderRadius: bar, marginBottom: bar * 1.5 }} />
            <View style={{ width: s * 0.35, height: bar * 2, backgroundColor: c.fg, borderRadius: bar, opacity: 0.5 }} />
          </>
        );

      case "back":
        // Three vertical bars — like pull-up grip
        return (
          <View style={{ flexDirection: "row", gap: bar * 1.5 }}>
            <View style={{ width: bar * 2, height: s * 0.4, backgroundColor: c.fg, borderRadius: bar, opacity: 0.4 }} />
            <View style={{ width: bar * 2, height: s * 0.5, backgroundColor: c.fg, borderRadius: bar }} />
            <View style={{ width: bar * 2, height: s * 0.4, backgroundColor: c.fg, borderRadius: bar, opacity: 0.4 }} />
          </View>
        );

      case "shoulders":
        // Arc — like deltoid curve
        return (
          <View style={{
            width: s * 0.45, height: s * 0.25,
            borderTopLeftRadius: s * 0.25, borderTopRightRadius: s * 0.25,
            backgroundColor: c.fg,
          }} />
        );

      case "biceps":
      case "triceps":
        // Single bold diagonal — arm angle
        return (
          <View style={{
            width: bar * 2.5, height: s * 0.45,
            backgroundColor: c.fg, borderRadius: bar * 2,
            transform: [{ rotate: muscleGroup === "biceps" ? "25deg" : "-25deg" }],
          }} />
        );

      case "quads":
      case "hamstrings":
        // Two parallel vertical bars — legs
        return (
          <View style={{ flexDirection: "row", gap: bar * 2.5 }}>
            <View style={{ width: bar * 2.5, height: s * 0.45, backgroundColor: c.fg, borderRadius: bar * 2 }} />
            <View style={{ width: bar * 2.5, height: s * 0.45, backgroundColor: c.fg, borderRadius: bar * 2 }} />
          </View>
        );

      case "glutes":
        // Circle — round muscle
        return (
          <View style={{ width: s * 0.35, height: s * 0.35, borderRadius: s * 0.175, backgroundColor: c.fg }} />
        );

      case "calves":
        // Small teardrop
        return (
          <View style={{
            width: s * 0.2, height: s * 0.35,
            backgroundColor: c.fg, borderRadius: s * 0.1,
            borderTopLeftRadius: s * 0.05, borderTopRightRadius: s * 0.05,
          }} />
        );

      case "core":
        // Stacked bars — abs
        return (
          <View style={{ gap: bar }}>
            <View style={{ flexDirection: "row", gap: bar }}>
              <View style={{ width: s * 0.14, height: s * 0.12, backgroundColor: c.fg, borderRadius: bar }} />
              <View style={{ width: s * 0.14, height: s * 0.12, backgroundColor: c.fg, borderRadius: bar }} />
            </View>
            <View style={{ flexDirection: "row", gap: bar }}>
              <View style={{ width: s * 0.14, height: s * 0.12, backgroundColor: c.fg, borderRadius: bar, opacity: 0.7 }} />
              <View style={{ width: s * 0.14, height: s * 0.12, backgroundColor: c.fg, borderRadius: bar, opacity: 0.7 }} />
            </View>
            <View style={{ flexDirection: "row", gap: bar }}>
              <View style={{ width: s * 0.14, height: s * 0.12, backgroundColor: c.fg, borderRadius: bar, opacity: 0.4 }} />
              <View style={{ width: s * 0.14, height: s * 0.12, backgroundColor: c.fg, borderRadius: bar, opacity: 0.4 }} />
            </View>
          </View>
        );

      default:
        // Diamond — full body
        return (
          <View style={{
            width: s * 0.25, height: s * 0.25,
            backgroundColor: c.fg, borderRadius: bar,
            transform: [{ rotate: "45deg" }],
          }} />
        );
    }
  };

  return (
    <View style={{
      width: s, height: s, borderRadius: s * 0.25,
      backgroundColor: c.bg,
      alignItems: "center", justifyContent: "center",
    }}>
      {renderPattern()}
    </View>
  );
}

export { COLORS as MUSCLE_COLORS };
