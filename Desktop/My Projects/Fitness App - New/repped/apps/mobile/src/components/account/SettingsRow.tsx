import { Pressable, View, Text } from "react-native";
import type { ReactNode } from "react";

const C = {
  earth: "#1A1A1A",
  stone: "#F2F1ED",
  rock: "#9A9A92",
  chev: "#B8B8AE",
};

interface SettingsRowProps {
  icon: ReactNode;
  label: string;
  onPress?: () => void;
  showChev?: boolean;
}

export function SettingsRow({ icon, label, onPress, showChev = true }: SettingsRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 10,
        paddingHorizontal: 16,
        paddingLeft: 12,
        backgroundColor: pressed ? "#E8E6DF" : C.stone,
        borderRadius: 28,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      })}
    >
      <View style={{ width: 30, height: 30, alignItems: "center", justifyContent: "center" }}>
        {icon}
      </View>
      <Text
        style={{
          flex: 1,
          fontSize: 15,
          fontWeight: "500",
          color: C.earth,
          letterSpacing: -0.1,
        }}
      >
        {label}
      </Text>
      {showChev && (
        <Text style={{ fontSize: 17, color: C.chev, fontWeight: "400" }}>›</Text>
      )}
    </Pressable>
  );
}
