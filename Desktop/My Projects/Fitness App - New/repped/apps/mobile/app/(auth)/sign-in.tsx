import { View, Text, Pressable, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link } from "expo-router";
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
  const parts = domain.split(".");
  if (parts[parts.length - 1].length < 2) return { valid: false, error: "Invalid domain extension" };
  const domainLower = domain.toLowerCase();
  const typos: Record<string, string> = {
    "gmial.com": "gmail.com", "gmal.com": "gmail.com", "gmali.com": "gmail.com",
    "gmaill.com": "gmail.com", "gamil.com": "gmail.com", "gmail.co": "gmail.com",
    "yahooo.com": "yahoo.com", "yaho.com": "yahoo.com",
    "outllook.com": "outlook.com", "outlok.com": "outlook.com",
    "hotmal.com": "hotmail.com", "hotmial.com": "hotmail.com",
    "icoud.com": "icloud.com", "iclould.com": "icloud.com",
  };
  if (typos[domainLower]) return { valid: false, error: `Did you mean ${local}@${typos[domainLower]}?` };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) return { valid: false, error: "Invalid email format" };
  return { valid: true, error: null };
}

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const emailValidation = validateEmail(email);
  const passwordError = passwordTouched && password.length === 0
    ? "Password is required"
    : passwordTouched && password.length > 0 && password.length < 6
    ? "Password must be at least 6 characters"
    : null;
  const canSubmit = emailValidation.valid && password.length >= 6;

  const handleSignIn = async () => {
    setEmailTouched(true);
    setPasswordTouched(true);
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
    }
  };

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
          Welcome Back
        </Text>
        <Text style={{ fontSize: 14, color: C.rock, marginBottom: 32 }}>
          Sign in to continue your journey.
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
          <Text style={{ fontSize: 12, color: "#EF4444", paddingLeft: 4, marginBottom: 10 }}>
            {emailValidation.error}
          </Text>
        ) : (
          <View style={{ height: 10 }} />
        )}

        {/* Password */}
        <View style={{ position: "relative", marginBottom: 4 }}>
          <TextInput
            style={{
              backgroundColor: C.stone, color: C.earth, fontSize: 16, fontWeight: "500",
              borderRadius: 14, paddingHorizontal: 18, paddingVertical: 16, paddingRight: 56,
              borderWidth: 1.5, borderColor: passwordError ? "#EF4444" : C.border,
            }}
            placeholder="Password"
            placeholderTextColor="rgba(142,142,122,0.5)"
            secureTextEntry={!showPassword}
            textContentType="password"
            value={password}
            onChangeText={(t) => { setPassword(t); setPasswordTouched(true); }}
            onBlur={() => setPasswordTouched(true)}
          />
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={{ position: "absolute", right: 16, top: 0, bottom: 0, justifyContent: "center" }}
          >
            <Text style={{ fontSize: 13, fontWeight: "600", color: C.rock }}>{showPassword ? "Hide" : "Show"}</Text>
          </Pressable>
        </View>
        {passwordError ? (
          <Text style={{ fontSize: 12, color: "#EF4444", paddingLeft: 4, marginBottom: 16 }}>
            {passwordError}
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
          onPress={handleSignIn}
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
              Sign In
            </Text>
          )}
        </Pressable>

        {/* Forgot password */}
        <Link href="/forgot-password" asChild>
          <Pressable style={{ alignItems: "center", paddingVertical: 8, marginBottom: 4 }}>
            <Text style={{ color: C.rock, fontSize: 13 }}>Forgot password?</Text>
          </Pressable>
        </Link>

        {/* Divider */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 20 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
          <Text style={{ fontSize: 12, fontWeight: "600", color: C.rock }}>OR</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
        </View>

        {/* Social buttons */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
          <Pressable style={{
            flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: "center",
            backgroundColor: C.stone, borderWidth: 1, borderColor: C.border,
          }}>
            <Text style={{ fontSize: 20 }}>🍎</Text>
          </Pressable>
          <Pressable style={{
            flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: "center",
            backgroundColor: C.stone, borderWidth: 1, borderColor: C.border,
          }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: C.earth }}>G</Text>
          </Pressable>
        </View>

        {/* Sign Up link */}
        <Link href="/sign-up" asChild>
          <Pressable style={{ alignItems: "center", paddingVertical: 12 }}>
            <Text style={{ color: C.rock, fontSize: 14 }}>
              Don't have an account?{" "}
              <Text style={{ color: C.trail, fontWeight: "600" }}>Sign Up</Text>
            </Text>
          </Pressable>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
