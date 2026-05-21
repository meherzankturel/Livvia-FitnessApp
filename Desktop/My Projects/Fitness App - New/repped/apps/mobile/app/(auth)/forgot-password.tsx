import { View, Text, Pressable, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../src/lib/supabase";
import { ReviveWordmark } from "../../src/components/ReviveWordmark";

const C = {
  bg: "#F6F5F0",
  bgWarm: "#FAF2E5",
  white: "#FFFFFF",
  earth: "#2D2A24",
  rock: "#8E8E7A",
  primary: "#5C8B6E",
  border: "rgba(45,42,36,0.08)",
  error: "#EF4444",
};

function validateEmail(email: string): { valid: boolean; error: string | null } {
  const trimmed = email.trim();
  if (trimmed.length === 0) return { valid: false, error: null };
  if (!trimmed.includes("@")) return { valid: false, error: "Missing @ symbol" };
  const [local, domain] = trimmed.split("@");
  if (!local) return { valid: false, error: "Missing email name before @" };
  if (!domain) return { valid: false, error: "Missing domain after @" };
  if (!domain.includes(".")) return { valid: false, error: "Invalid domain — missing dot (e.g. gmail.com)" };
  if (domain.split(".").pop()!.length < 2) return { valid: false, error: "Invalid domain extension" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) return { valid: false, error: "Invalid email format" };
  return { valid: true, error: null };
}

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const emailValidation = validateEmail(email);
  const canSubmit = emailValidation.valid;

  const handleReset = async () => {
    setEmailTouched(true);
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: "revive://reset-password",
    });
    setLoading(false);
    if (resetError) setError(resetError.message);
    else setSent(true);
  };

  if (sent) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bgWarm, justifyContent: "center", paddingHorizontal: 28 }}>
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <ReviveWordmark size={44} />
        </View>
        <Text style={{ color: C.earth, fontSize: 24, fontWeight: "800", textAlign: "center", marginBottom: 8 }}>
          Check your email
        </Text>
        <Text style={{ color: C.rock, fontSize: 14, textAlign: "center", lineHeight: 21, marginBottom: 32 }}>
          We sent a password reset link to{"\n"}
          <Text style={{ color: C.primary, fontWeight: "600" }}>{email}</Text>
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={{ backgroundColor: C.primary, borderRadius: 16, height: 56, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: C.white, fontSize: 16, fontWeight: "700" }}>Back to Login</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bgWarm }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <Pressable
          onPress={() => router.canGoBack() ? router.back() : router.replace("/sign-in")}
          style={{
            width: 40, height: 40, borderRadius: 20, backgroundColor: C.white,
            alignItems: "center", justifyContent: "center",
            shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4,
            elevation: 2, marginBottom: 32,
          }}
        >
          <Ionicons name="arrow-back" size={20} color={C.earth} />
        </Pressable>

        {/* Wordmark */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <ReviveWordmark size={44} />
        </View>

        {/* Title */}
        <Text style={{ fontSize: 28, fontWeight: "800", color: C.earth, textAlign: "center", letterSpacing: -0.5, marginBottom: 8 }}>
          Reset Password
        </Text>
        <Text style={{ fontSize: 14, color: C.rock, textAlign: "center", lineHeight: 20, marginBottom: 36, paddingHorizontal: 16 }}>
          Enter your email and we'll send you a link to reset your password.
        </Text>

        {/* Email */}
        <View style={{
          flexDirection: "row", alignItems: "center", gap: 12,
          backgroundColor: C.white, borderRadius: 14, paddingHorizontal: 16, height: 56,
          borderWidth: 1.5, borderColor: emailTouched && emailValidation.error ? C.error : C.border,
          marginBottom: emailTouched && emailValidation.error ? 4 : 20,
          shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3,
        }}>
          <Ionicons name="mail-outline" size={20} color={C.rock} />
          <TextInput
            style={{ flex: 1, color: C.earth, fontSize: 15, fontWeight: "500" }}
            placeholder="Enter your email"
            placeholderTextColor={C.rock}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoCorrect={false}
            value={email}
            onChangeText={(t) => { setEmail(t); setEmailTouched(true); }}
            onBlur={() => setEmailTouched(true)}
          />
        </View>
        {emailTouched && emailValidation.error && (
          <Text style={{ fontSize: 12, color: C.error, paddingLeft: 4, marginBottom: 12 }}>
            {emailValidation.error}
          </Text>
        )}

        {/* Server error */}
        {error && (
          <Text style={{ color: C.error, textAlign: "center", marginBottom: 12, fontSize: 13 }}>{error}</Text>
        )}

        {/* CTA */}
        <Pressable
          onPress={handleReset}
          disabled={!canSubmit || loading}
          style={({ pressed }) => ({
            backgroundColor: canSubmit && !loading ? C.primary : "rgba(92,139,110,0.45)",
            borderRadius: 16, height: 56, alignItems: "center", justifyContent: "center", marginBottom: 20,
            opacity: pressed ? 0.92 : 1,
          })}
        >
          {loading ? (
            <ActivityIndicator color={C.white} />
          ) : (
            <Text style={{ fontSize: 16, fontWeight: "700", color: C.white, letterSpacing: -0.1 }}>Send Reset Link</Text>
          )}
        </Pressable>

        {/* Back link */}
        <Pressable onPress={() => router.back()} style={{ alignItems: "center", paddingVertical: 8 }}>
          <Text style={{ fontSize: 14, color: C.rock }}>
            Back to{" "}
            <Text style={{ color: C.primary, fontWeight: "700" }}>Login</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
