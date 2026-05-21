import React from "react";
import { View, StyleSheet } from "react-native";

interface Props {
  size: number;
  progress: number; // 0-1
  color?: string;
  trackColor?: string;
  /** Total tangent segments around the arc (more = smoother) */
  segmentCount?: number;
  /** Thickness of the filled (solid) progress line */
  thickness?: number;
  /** Thickness of the unfilled (dashed) track line */
  trackThickness?: number;
  /** Minimum filled segments — used as a hint that the arc fills with progress */
  minFilled?: number;
  children?: React.ReactNode;
}

/**
 * Open-bottom 270° arc, no SVG.
 *
 * Built from many small tangent-rotated rectangles:
 *   - Filled segments are WIDE and overlap → form a smooth solid line.
 *   - Unfilled segments are NARROW and thinner → look like a dashed track.
 *
 * Arc geometry: starts at bottom-left (225° clockwise from top),
 * sweeps 270° clockwise through the top, ends at bottom-right (135°).
 */
export default function DottedSemiArc({
  size,
  progress,
  color = "#7CC78A",
  trackColor = "#C9C7BD",
  segmentCount = 100,
  thickness = 7,
  trackThickness = 2.5,
  minFilled = 0,
  children,
}: Props) {
  const clamp = Math.min(Math.max(progress, 0), 1);
  const filledCount = Math.max(minFilled, Math.round(clamp * segmentCount));

  const center = size / 2;
  const radius = size / 2 - thickness;

  const START_DEG = 225;
  const SWEEP_DEG = 270;
  const perSegmentDeg = SWEEP_DEG / (segmentCount - 1);

  // Arc length covered by each segment slot
  const arcStep = (radius * perSegmentDeg * Math.PI) / 180;

  // Filled: each rectangle is much wider than its slot → heavy overlap → solid line.
  const filledWidth = arcStep * 2.2;
  // Unfilled: each rectangle is narrow with a gap on either side → dashed look.
  const unfilledWidth = Math.max(2, arcStep * 0.35);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {Array.from({ length: segmentCount }).map((_, i) => {
        const t = i / (segmentCount - 1);
        const angleDeg = START_DEG + SWEEP_DEG * t;
        const angleRad = (angleDeg * Math.PI) / 180;

        // Position on the arc (0° = top, clockwise)
        const x = center + radius * Math.sin(angleRad);
        const y = center - radius * Math.cos(angleRad);

        const isFilled = i < filledCount;
        const segWidth = isFilled ? filledWidth : unfilledWidth;
        const segHeight = isFilled ? thickness : trackThickness;

        return (
          <View
            key={i}
            style={[
              styles.segment,
              {
                width: segWidth,
                height: segHeight,
                borderRadius: segHeight / 2,
                left: x - segWidth / 2,
                top: y - segHeight / 2,
                backgroundColor: isFilled ? color : trackColor,
                transform: [{ rotate: `${angleDeg}deg` }],
              },
            ]}
          />
        );
      })}
      <View style={[styles.center, { width: size, height: size }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  segment: {
    position: "absolute",
  },
  center: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});
