import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import type { ReactNode } from "react";

const C = {
  earth: "#1A1A1A",
  sand: "#FFFFFF",
  stone: "#F2F1ED",
  rock: "#9A9A92",
};

interface SubScreenLayoutProps {
  title: string;
  children: ReactNode;
  saveLabel?: string;
  saveDisabled?: boolean;
  onSave?: () => void;
}

export function SubScreenLayout({
  title,
  children,
  saveLabel,
  saveDisabled,
  onSave,
}: SubScreenLayoutProps) {
  return (
    <View style={{ flex: 1, backgroundColor: C.sand }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: 56,
          paddingBottom: 12,
          gap: 14,
        }}
      >
        <Pressable
          onPress={() => {
            // Sub-screens are sibling tabs (href: null) inside the (app) Tabs navigator,
            // not a real stack. router.back() can fall back to the last-active tab (Home).
            // Always return to Settings explicitly.
            router.replace("/(app)/settings" as any);
          }}
          style={({ pressed }) => ({
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: pressed ? "#E2DED6" : C.stone,
            alignItems: "center",
            justifyContent: "center",
          })}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: C.earth }}>‹</Text>
        </Pressable>
        <Text style={{ fontSize: 17, fontWeight: "800", color: C.earth }}>{title}</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>

        {onSave && (
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 36,
              backgroundColor: C.sand,
              borderTopWidth: 0.5,
              borderTopColor: "rgba(0,0,0,0.06)",
            }}
          >
            <Pressable
              onPress={onSave}
              disabled={saveDisabled}
              style={({ pressed }) => ({
                width: "100%",
                height: 50,
                borderRadius: 16,
                backgroundColor: saveDisabled ? "#CCCAC2" : C.earth,
                opacity: pressed ? 0.85 : 1,
                alignItems: "center",
                justifyContent: "center",
              })}
            >
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#FFFFFF" }}>
                {saveLabel ?? "Save Changes"}
              </Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

/** Section heading inside a sub-screen (small uppercase label above a FormGroup) */
export function FormLabel({ children }: { children: string }) {
  return (
    <Text
      style={{
        fontSize: 10,
        fontWeight: "700",
        color: C.rock,
        letterSpacing: 1.2,
        textTransform: "uppercase",
        marginBottom: 8,
      }}
    >
      {children}
    </Text>
  );
}

/** Wraps a form-label + form-group with consistent spacing */
export function SubSection({ children }: { children: ReactNode }) {
  return (
    <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
      {children}
    </View>
  );
}
