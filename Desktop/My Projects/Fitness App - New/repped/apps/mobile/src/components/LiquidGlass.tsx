import { View, ViewStyle, Pressable } from "react-native";

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  tint?: "blue" | "green" | "orange" | "red" | "purple" | "none";
  padding?: "none" | "compact" | "default" | "spacious";
}

const TINTS: Record<string, string> = {
  none: "#F2F2F7",
  blue: "rgba(99,102,241,0.08)",
  green: "rgba(52,199,89,0.08)",
  orange: "rgba(255,149,0,0.08)",
  red: "rgba(255,69,58,0.08)",
  purple: "rgba(175,82,222,0.08)",
};

const PADDING: Record<string, number> = {
  none: 0,
  compact: 12,
  default: 20,
  spacious: 24,
};

export default function LiquidGlass({ children, style, onPress, tint = "none", padding = "default" }: Props) {
  const baseFill = TINTS[tint] || TINTS.none;
  const pad = PADDING[padding];

  const cardStyle: ViewStyle = {
    backgroundColor: baseFill,
    borderRadius: 20,
    padding: pad,
  };

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={[cardStyle, style]}>
        {children}
      </Pressable>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
}
