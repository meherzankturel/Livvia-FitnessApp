import React, { useState } from "react";
import { View, StyleSheet, LayoutChangeEvent } from "react-native";

interface Props {
  /** Y values (0 = top, higher = lower). Internally normalized to fit container height. */
  values: number[];
  /** Height of the rendered chart */
  height: number;
  /** Stroke color */
  color?: string;
  /** Stroke thickness */
  thickness?: number;
}

/**
 * Continuous line waveform built from rotated rectangle segments.
 * No SVG required — each adjacent pair of points becomes a tiny line segment.
 *
 * Each segment is a thin horizontal rectangle, rotated and positioned so it
 * connects (x_i, y_i) to (x_{i+1}, y_{i+1}). Together they form a smooth-looking
 * polyline.
 */
export default function LineWaveform({
  values,
  height,
  color = "#E25B5B",
  thickness = 1.5,
}: Props) {
  const [width, setWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  if (values.length < 2 || width === 0) {
    return <View style={{ height }} onLayout={onLayout} />;
  }

  // Normalize y values so the largest fits in the chart height
  const maxY = Math.max(...values, 1);
  const stepX = width / (values.length - 1);

  return (
    <View style={[styles.container, { height, width: "100%" }]} onLayout={onLayout}>
      {values.map((v, i) => {
        if (i === 0) return null;
        const prev = values[i - 1];

        const x1 = (i - 1) * stepX;
        const x2 = i * stepX;
        // Map y so 0 = bottom of container, maxY = top
        const y1 = height - (prev / maxY) * height;
        const y2 = height - (v / maxY) * height;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angleRad = Math.atan2(dy, dx);
        const angleDeg = (angleRad * 180) / Math.PI;

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        return (
          <View
            key={i}
            style={[
              styles.segment,
              {
                width: length,
                height: thickness,
                borderRadius: thickness / 2,
                backgroundColor: color,
                left: midX - length / 2,
                top: midY - thickness / 2,
                transform: [{ rotate: `${angleDeg}deg` }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
  },
  segment: {
    position: "absolute",
  },
});
