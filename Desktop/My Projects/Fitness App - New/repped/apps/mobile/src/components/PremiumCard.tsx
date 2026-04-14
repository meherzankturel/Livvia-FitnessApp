import { View, Pressable } from "react-native";
import tw from "../lib/tw";
import type { ViewStyle } from "react-native";

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: "default" | "accent" | "success" | "warning";
  style?: ViewStyle;
}

const VARIANTS = {
  default: { bg: "#111118", border: "#1e1e2e" },
  accent: { bg: "rgba(0,144,255,0.03)", border: "rgba(0,144,255,0.19)" },
  success: { bg: "rgba(16,185,129,0.03)", border: "rgba(16,185,129,0.19)" },
  warning: { bg: "rgba(245,146,0,0.03)", border: "rgba(245,146,0,0.19)" },
};

export default function PremiumCard({ children, onPress, variant = "default", style }: Props) {
  const v = VARIANTS[variant];
  const cardStyle = [tw`rounded-2xl p-5`, { backgroundColor: v.bg, borderWidth: 1, borderColor: v.border }];

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={[...cardStyle, style]}>
        {children}
      </Pressable>
    );
  }

  return <View style={[...cardStyle, style]}>{children}</View>;
}
