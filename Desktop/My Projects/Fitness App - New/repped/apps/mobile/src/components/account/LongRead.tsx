import { View, Text } from "react-native";
import type { ReactNode } from "react";

const C = { earth: "#1A1A1A", rock: "#5B5B53", body: "#3A3A35" };

export function LongReadTitle({ children, updated }: { children: string; updated?: string }) {
  return (
    <View style={{ marginHorizontal: 20, marginBottom: 24 }}>
      <Text style={{ fontSize: 28, fontFamily: "Quicksand_700Bold", fontWeight: "800", color: C.earth, letterSpacing: -0.4, marginBottom: 6 }}>
        {children}
      </Text>
      {updated && (
        <Text style={{ fontSize: 11, color: C.rock, textTransform: "uppercase", letterSpacing: 1.4, fontWeight: "600" }}>
          Last updated {updated}
        </Text>
      )}
    </View>
  );
}

export function LongReadHeading({ children }: { children: string }) {
  return (
    <Text
      style={{
        fontSize: 16,
        fontFamily: "Quicksand_700Bold", fontWeight: "700",
        color: C.earth,
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 8,
        letterSpacing: -0.1,
      }}
    >
      {children}
    </Text>
  );
}

export function LongReadParagraph({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        fontSize: 14,
        color: C.body,
        lineHeight: 22,
        marginHorizontal: 20,
        marginBottom: 12,
      }}
    >
      {children}
    </Text>
  );
}

export function LongReadBullet({ children }: { children: ReactNode }) {
  return (
    <View style={{ flexDirection: "row", marginHorizontal: 20, marginBottom: 8 }}>
      <Text style={{ color: C.rock, marginRight: 8, fontFamily: "Quicksand_700Bold", fontWeight: "700" }}>•</Text>
      <Text style={{ flex: 1, fontSize: 14, color: C.body, lineHeight: 22 }}>{children}</Text>
    </View>
  );
}
