import { View, Text } from "react-native";

/** Square Revive app-icon-style logo. Used on auth screens. */
export function BrandIcon({ size = 80 }: { size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.225,   // ~18 at 80px (iOS-icon corner radius proportion)
        backgroundColor: "#5C8B6E",   // sage green
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 8,
      }}
    >
      <Text
        style={{
          fontSize: size * 0.48,
          fontWeight: "900",
          color: "#FFFFFF",
          letterSpacing: -1,
          marginTop: -2,
        }}
      >
        R
      </Text>
    </View>
  );
}
