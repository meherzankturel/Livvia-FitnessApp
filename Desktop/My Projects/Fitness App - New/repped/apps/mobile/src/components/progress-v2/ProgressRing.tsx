import React from "react";
import { View, StyleSheet } from "react-native";

interface Props {
  size: number;
  strokeWidth?: number;
  progress: number; // 0-1
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
}

/**
 * Circular progress ring using the half-circle rotation technique.
 * No SVG required — works in Expo Go.
 *
 * Technique:
 *  - Render two half-discs (left and right clipped halves of a circle)
 *  - Rotate them by the angle derived from `progress`
 *  - A solid inner circle masks the disc centre, leaving a ring
 */
export default function ProgressRing({
  size,
  strokeWidth = 8,
  progress,
  color = "#2DB877",
  trackColor = "#E8E8E8",
  children,
}: Props) {
  const clamp = Math.min(Math.max(progress, 0), 1);
  const degrees = clamp * 360;
  const innerSize = size - strokeWidth * 2;

  // We split the full 360° arc into two halves.
  // First half covers 0-180°, second half covers 180-360°.
  const firstHalfAngle = Math.min(degrees, 180);
  const secondHalfAngle = Math.max(degrees - 180, 0);

  const halfSize = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Track (full circle) */}
      <View
        style={[
          styles.track,
          {
            width: size,
            height: size,
            borderRadius: halfSize,
            borderWidth: strokeWidth,
            borderColor: trackColor,
          },
        ]}
      />

      {/* Right half — covers first 0-180° */}
      <View
        style={[
          styles.halfContainer,
          { width: halfSize, height: size, left: halfSize, overflow: "hidden" },
        ]}
      >
        <View
          style={[
            styles.halfDisc,
            {
              width: size,
              height: size,
              borderRadius: halfSize,
              borderWidth: strokeWidth,
              borderColor: clamp > 0 ? color : trackColor,
              left: -halfSize,
              transform: [{ rotate: `${firstHalfAngle - 180}deg` }],
            },
          ]}
        />
      </View>

      {/* Left half — covers 180-360° */}
      {degrees > 180 && (
        <View
          style={[
            styles.halfContainer,
            { width: halfSize, height: size, left: 0, overflow: "hidden" },
          ]}
        >
          <View
            style={[
              styles.halfDisc,
              {
                width: size,
                height: size,
                borderRadius: halfSize,
                borderWidth: strokeWidth,
                borderColor: color,
                left: 0,
                transform: [{ rotate: `${secondHalfAngle - 180}deg` }],
              },
            ]}
          />
        </View>
      )}

      {/* Inner mask circle */}
      <View
        style={[
          styles.innerCircle,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            top: strokeWidth,
            left: strokeWidth,
          },
        ]}
      />

      {/* Children (centred content) */}
      <View
        style={[
          styles.childrenContainer,
          { width: innerSize, height: innerSize, top: strokeWidth, left: strokeWidth },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  track: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "transparent",
  },
  halfContainer: {
    position: "absolute",
    top: 0,
  },
  halfDisc: {
    position: "absolute",
    top: 0,
    backgroundColor: "transparent",
  },
  innerCircle: {
    position: "absolute",
    backgroundColor: "#fff",
  },
  childrenContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});
