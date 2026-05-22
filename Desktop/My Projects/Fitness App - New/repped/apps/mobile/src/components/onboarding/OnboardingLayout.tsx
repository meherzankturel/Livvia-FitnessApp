import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native";

const C = {
  earth: "#2D2A24",
  bg: "#F6F5F0",
  trail: "#34D399",
  rock: "#8E8E7A",
};

interface OnboardingLayoutProps {
  step: number;
  totalSteps: number;
  ctaLabel: string;
  ctaDisabled?: boolean;
  onCta: () => void;
  onSkip?: () => void;
  skipLabel?: string;
  children: React.ReactNode;
}

export function OnboardingLayout({
  step, totalSteps, ctaLabel, ctaDisabled, onCta, onSkip, skipLabel, children,
}: OnboardingLayoutProps) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Fixed top: progress bar */}
      <View style={{ paddingTop: 60, paddingHorizontal: 24, paddingBottom: 8, backgroundColor: C.bg }}>
        <View style={{ flexDirection: "row", gap: 4 }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View
              key={i}
              style={{
                flex: 1, height: 3, borderRadius: 2,
                backgroundColor: i < step ? C.trail : i === step ? C.earth : "rgba(45,42,36,0.08)",
              }}
            />
          ))}
        </View>
      </View>

      {/* Scrollable middle */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>

      {/* Fixed bottom: CTA + optional skip */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 12, backgroundColor: C.bg }}>
        {onSkip && skipLabel && (
          <Pressable onPress={onSkip} style={{ alignItems: "center", marginBottom: 10 }}>
            <Text style={{ fontSize: 13, fontFamily: "Quicksand_600SemiBold", fontWeight: "600", color: C.rock }}>{skipLabel}</Text>
          </Pressable>
        )}
        <Pressable
          onPress={onCta}
          disabled={ctaDisabled}
          style={{
            backgroundColor: C.earth, borderRadius: 16, paddingVertical: 17,
            alignItems: "center", opacity: ctaDisabled ? 0.3 : 1,
          }}
        >
          <Text style={{ fontSize: 15, fontFamily: "Quicksand_600SemiBold", fontWeight: "600", color: C.bg }}>{ctaLabel}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
