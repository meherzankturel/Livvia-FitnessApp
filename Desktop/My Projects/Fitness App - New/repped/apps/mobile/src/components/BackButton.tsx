import { Pressable, ViewStyle, StyleProp } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface BackButtonProps {
  onPress?: () => void;
  tint?: string;
  style?: StyleProp<ViewStyle>;
}

export function BackButton({ onPress, tint = "#2D2A24", style }: BackButtonProps) {
  return (
    <Pressable
      onPress={onPress ?? (() => { if (router.canGoBack()) router.back(); })}
      hitSlop={8}
      style={[
        {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: "#FFFFFF",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        },
        style,
      ]}
    >
      <Ionicons name="arrow-back" size={20} color={tint} />
    </Pressable>
  );
}
