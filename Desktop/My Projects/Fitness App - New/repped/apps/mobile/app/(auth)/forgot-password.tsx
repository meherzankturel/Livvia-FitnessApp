import { View, Text, Pressable, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { supabase } from "../../src/lib/supabase";

const C = {
  earth: "#2D2A24",
  bg: "#F6F5F0",
  stone: "#EDEBE5",
  rock: "#8E8E7A",
  trail: "#34D399",
  border: "rgba(45,42,36,0.08)",
};

function validateEmail(email: string): { valid: boolean; error: string | null } {
  const trimmed = email.trim();
  if (trimmed.length === 0) return { valid: false, error: null };
  if (!trimmed.includes("@")) return { valid: false, error: "Missing @ symbol" };
  const [local, domain] = trimmed.split("@");
  if (!local || local.length === 0) return { valid: false, error: "Missing email name before @" };
  if (!domain || domain.length === 0) return { valid: false, error: "Missing domain after @" };
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
      redirectTo: "livvia://reset-password",
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: "center", paddingHorizontal: 28 }}>
        <Text style={{ fontSize: 40, textAlign: "center", marginBottom: 16 }}>📧</Text>
        <Text style={{ color: C.earth, fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 8 }}>
          Check your email
        </Text>
        <Text style={{ color: C.rock, fontSize: 15, textAlign: "center", lineHeight: 22, marginBottom: 32 }}>
          We sent a password reset link to{"\n"}
          <Text style={{ color: C.trail, fontWeight: "600" }}>{email}</Text>
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={{ backgroundColor: C.stone, borderRadius: 14, paddingVertical: 16, alignItems: "center" }}
        >
          <Text style={{ color: C.earth, fontSize: 16, fontWeight: "600" }}>Back to Sign In</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 28 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Text style={{ fontSize: 32, fontWeight: "800", color: C.earth, letterSpacing: -1, marginBottom: 4 }}>
          L<Text style={{ color: C.trail }}>i</Text>vv<Text style={{ color: C.trail }}>i</Text>a
        </Text>
        <Text style={{ fontSize: 14, color: C.rock, marginBottom: 40 }}>
          Fitness that adapts to you.
        </Text>

        {/* Title */}
        <Text style={{ fontSize: 24, fontWeight: "700", color: C.earth, marginBottom: 4 }}>
          Reset Password
        </Text>
        <Text style={{ color: C.rock, fontSize: 14, marginBottom: 32, lineHeight: 20 }}>
          Enter your email and we'll send you a link to reset your password.
        </Text>

        {/* Email */}
        <TextInput
          style={{
            backgroundColor: C.stone, color: C.earth, fontSize: 16, fontWeight: "500",
            borderRadius: 14, paddingHorizontal: 18, paddingVertical: 16,
            borderWidth: 1.5,
            borderColor: emailTouched && emailValidation.error ? "#EF4444" : C.border,
            marginBottom: 4,
          }}
          placeholder="Email"
          placeholderTextColor="rgba(142,142,122,0.5)"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          autoCorrect={false}
          value={email}
          onChangeText={(t) => { setEmail(t); setEmailTouched(true); }}
          onBlur={() => setEmailTouched(true)}
        />
        {emailTouched && emailValidation.error ? (
          <Text style={{ fontSize: 12, color: "#EF4444", paddingLeft: 4, marginBottom: 20 }}>
            {emailValidation.error}
          </Text>
        ) : (
          <View style={{ height: 20 }} />
        )}

        {/* Error */}
        {error && (
          <Text style={{ color: "#EF4444", textAlign: "center", marginBottom: 16, fontSize: 14 }}>{error}</Text>
        )}

        {/* CTA */}
        <Pressable
          onPress={handleReset}
          disabled={!canSubmit || loading}
          style={{
            backgroundColor: canSubmit && !loading ? C.earth : C.stone,
            borderRadius: 14, paddingVertical: 16, alignItems: "center", marginBottom: 14,
          }}
        >
          {loading ? (
            <ActivityIndicator color={C.trail} />
          ) : (
            <Text style={{ fontSize: 16, fontWeight: "700", color: canSubmit ? C.bg : C.rock }}>
              Send Reset Link
            </Text>
          )}
        </Pressable>

        {/* Back link */}
        <Pressable onPress={() => router.back()} style={{ alignItems: "center", paddingVertical: 12 }}>
          <Text style={{ color: C.rock, fontSize: 14 }}>
            Back to <Text style={{ color: C.trail, fontWeight: "600" }}>Sign In</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
