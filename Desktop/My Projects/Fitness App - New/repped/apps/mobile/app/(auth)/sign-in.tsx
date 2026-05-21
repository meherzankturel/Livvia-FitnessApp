import { View, Text, Pressable, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../src/lib/supabase";
import { ReviveWordmark } from "../../src/components/ReviveWordmark";

const C = {
  bg: "#F6F5F0",            // cream background
  bgWarm: "#FAF2E5",        // warmer top tint
  white: "#FFFFFF",
  earth: "#2D2A24",         // dark text
  rock: "#8E8E7A",          // gray text
  primary: "#5C8B6E",       // sage green — buttons, accents
  primaryDark: "#4A7A5D",   // darker for icon bg
  border: "rgba(45,42,36,0.08)",
  inputShadow: "rgba(45,42,36,0.04)",
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
  const parts = domain.split(".");
  if (parts[parts.length - 1].length < 2) return { valid: false, error: "Invalid domain extension" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) return { valid: false, error: "Invalid email format" };
  return { valid: true, error: null };
}

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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
    if (authError) setError(authError.message);
  };

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
        {/* Back button */}
        <Pressable
          onPress={() => router.canGoBack() ? router.back() : null}
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
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <ReviveWordmark size={48} />
        </View>

        {/* Title + subtitle */}
        <Text style={{ fontSize: 30, fontWeight: "800", color: C.earth, textAlign: "center", letterSpacing: -0.5, marginBottom: 8 }}>
          Welcome Back
        </Text>
        <Text style={{ fontSize: 14, color: C.rock, textAlign: "center", lineHeight: 20, marginBottom: 36, paddingHorizontal: 16 }}>
          Sign in to keep your training, meals, and progress in sync.
        </Text>

        {/* Email */}
        <View style={{
          flexDirection: "row", alignItems: "center", gap: 12,
          backgroundColor: C.white, borderRadius: 14, paddingHorizontal: 16, height: 56,
          borderWidth: 1.5, borderColor: emailTouched && emailValidation.error ? C.error : C.border,
          marginBottom: emailTouched && emailValidation.error ? 4 : 12,
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
          <Text style={{ fontSize: 12, color: C.error, paddingLeft: 4, marginBottom: 8 }}>
            {emailValidation.error}
          </Text>
        )}

        {/* Password */}
        <View style={{
          flexDirection: "row", alignItems: "center", gap: 12,
          backgroundColor: C.white, borderRadius: 14, paddingHorizontal: 16, height: 56,
          borderWidth: 1.5, borderColor: passwordError ? C.error : C.border,
          marginBottom: passwordError ? 4 : 16,
          shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3,
        }}>
          <Ionicons name="lock-closed-outline" size={20} color={C.rock} />
          <TextInput
            style={{ flex: 1, color: C.earth, fontSize: 15, fontWeight: "500" }}
            placeholder="Password"
            placeholderTextColor={C.rock}
            secureTextEntry={!showPassword}
            textContentType="password"
            value={password}
            onChangeText={(t) => { setPassword(t); setPasswordTouched(true); }}
            onBlur={() => setPasswordTouched(true)}
          />
          <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={C.rock} />
          </Pressable>
        </View>
        {passwordError && (
          <Text style={{ fontSize: 12, color: C.error, paddingLeft: 4, marginBottom: 8 }}>
            {passwordError}
          </Text>
        )}

        {/* Remember me + Forgot password */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <Pressable
            onPress={() => setRememberMe(!rememberMe)}
            style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
          >
            <View style={{
              width: 20, height: 20, borderRadius: 6,
              backgroundColor: rememberMe ? C.primary : "transparent",
              borderWidth: 1.5, borderColor: rememberMe ? C.primary : C.rock,
              alignItems: "center", justifyContent: "center",
            }}>
              {rememberMe && <Ionicons name="checkmark" size={14} color={C.white} />}
            </View>
            <Text style={{ fontSize: 13, color: C.earth, fontWeight: "500" }}>Remember me</Text>
          </Pressable>
          <Link href="/forgot-password" asChild>
            <Pressable>
              <Text style={{ fontSize: 13, color: C.primary, fontWeight: "600" }}>Forget Password</Text>
            </Pressable>
          </Link>
        </View>

        {/* Auth error */}
        {error && (
          <Text style={{ color: C.error, textAlign: "center", marginBottom: 12, fontSize: 13 }}>{error}</Text>
        )}

        {/* Login button */}
        <Pressable
          onPress={handleSignIn}
          disabled={!canSubmit || loading}
          style={({ pressed }) => ({
            backgroundColor: canSubmit && !loading ? C.primary : "rgba(92,139,110,0.45)",
            borderRadius: 16, height: 56, alignItems: "center", justifyContent: "center", marginBottom: 24,
            opacity: pressed ? 0.92 : 1,
          })}
        >
          {loading ? (
            <ActivityIndicator color={C.white} />
          ) : (
            <Text style={{ fontSize: 16, fontWeight: "700", color: C.white, letterSpacing: -0.1 }}>Login</Text>
          )}
        </Pressable>

        {/* OR divider */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
          <Text style={{ fontSize: 13, color: C.rock, fontWeight: "500" }}>or</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
        </View>

        {/* Google */}
        <Pressable
          onPress={() => { /* TODO: wire Google OAuth */ }}
          style={({ pressed }) => ({
            flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12,
            backgroundColor: C.white, borderRadius: 14, height: 54, marginBottom: 12,
            shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <View style={{
            width: 22, height: 22, borderRadius: 11,
            alignItems: "center", justifyContent: "center",
          }}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#4285F4" }}>G</Text>
          </View>
          <Text style={{ fontSize: 15, fontWeight: "600", color: C.earth }}>Log in with Google</Text>
        </Pressable>

        {/* Apple */}
        <Pressable
          onPress={() => { /* TODO: wire Apple OAuth */ }}
          style={({ pressed }) => ({
            flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12,
            backgroundColor: C.white, borderRadius: 14, height: 54, marginBottom: 28,
            shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Ionicons name="logo-apple" size={20} color={C.earth} />
          <Text style={{ fontSize: 15, fontWeight: "600", color: C.earth }}>Log in with Apple</Text>
        </Pressable>

        {/* Footer */}
        <Link href="/sign-up" asChild>
          <Pressable style={{ alignItems: "center", paddingVertical: 8 }}>
            <Text style={{ fontSize: 14, color: C.rock }}>
              Don't have an account?{" "}
              <Text style={{ color: C.primary, fontWeight: "700" }}>Sign up</Text>
            </Text>
          </Pressable>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
