import { View, Text } from "react-native";

interface Props {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  label?: string;
  sublabel?: string;
}

export default function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 6,
  color = "#2D2A24",
  bgColor = "#EDEBE5",
  label,
  sublabel,
}: Props) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={{ alignItems: "center" }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: bgColor,
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <View
          style={{
            position: "absolute",
            top: -strokeWidth,
            left: -strokeWidth,
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: "transparent",
            borderTopColor: color,
            borderRightColor: clampedProgress > 25 ? color : "transparent",
            borderBottomColor: clampedProgress > 50 ? color : "transparent",
            borderLeftColor: clampedProgress > 75 ? color : "transparent",
            transform: [{ rotate: "-45deg" }],
          }}
        />
        <Text style={{ color: "#2D2A24", fontFamily: "Quicksand_700Bold", fontWeight: "700", fontSize: size * 0.22 }}>
          {Math.round(clampedProgress)}%
        </Text>
      </View>
      {label && <Text style={{ color: "#2D2A24", fontSize: 12, fontWeight: "600", marginTop: 8 }}>{label}</Text>}
      {sublabel && <Text style={{ color: "#8E8E7A", fontSize: 10 }}>{sublabel}</Text>}
    </View>
  );
}
