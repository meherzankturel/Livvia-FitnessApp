import { Text, Pressable, ViewStyle, TextStyle } from "react-native";

interface Props {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  size?: "default" | "small";
}

export default function AccentButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  size = "default",
}: Props) {
  const py = size === "small" ? 12 : 20;
  const px = size === "small" ? 20 : 0;
  const fontSize = size === "small" ? 16 : 20;

  const base: ViewStyle = { borderRadius: 16, alignItems: "center", paddingVertical: py, paddingHorizontal: px };

  if (variant === "primary") {
    return (
      <Pressable onPress={onPress} disabled={disabled}
        style={[base, { backgroundColor: disabled ? "rgba(45,42,36,0.3)" : "#2D2A24" }]}>
        <Text style={{ color: "#F6F5F0", fontFamily: "Quicksand_700Bold", fontWeight: "700", fontSize }}>{label}</Text>
      </Pressable>
    );
  }

  if (variant === "secondary") {
    return (
      <Pressable onPress={onPress} disabled={disabled}
        style={[base, { borderWidth: 1.5, borderColor: "#DDD9CE" }]}>
        <Text style={{ color: "#2D2A24", fontFamily: "Quicksand_600SemiBold", fontWeight: "600", fontSize }}>{label}</Text>
      </Pressable>
    );
  }

  // ghost
  return (
    <Pressable onPress={onPress} disabled={disabled}
      style={[base, { borderWidth: 1, borderColor: "rgba(45,42,36,0.12)" }]}>
      <Text style={{ color: "#8E8E7A", fontSize }}>{label}</Text>
    </Pressable>
  );
}
