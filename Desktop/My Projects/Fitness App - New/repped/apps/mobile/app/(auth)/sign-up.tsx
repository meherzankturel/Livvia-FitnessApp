import { View, Text, Pressable, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../src/lib/supabase";
import { ReviveWordmark } from "../../src/components/ReviveWordmark";
import { BackButton } from "../../src/components/BackButton";
import { signInWithApple, useGoogleSignIn, APPLE_AUTH_AVAILABLE } from "../../src/lib/auth-oauth";

const C = {
  bg: "#F6F5F0",
  bgWarm: "#FAF2E5",
  white: "#FFFFFF",
  earth: "#2D2A24",
  rock: "#8E8E7A",
  primary: "#5C8B6E",
  primaryDark: "#4A7A5D",
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
  const parts = domain.split(".");
  if (parts[parts.length - 1].length < 2) return { valid: false, error: "Invalid domain extension" };
  const typos: Record<string, string> = {
    "gmial.com": "gmail.com", "gmal.com": "gmail.com", "gmali.com": "gmail.com",
    "gmaill.com": "gmail.com", "gamil.com": "gmail.com", "gmail.co": "gmail.com",
  };
  if (typos[domain.toLowerCase()]) return { valid: false, error: `Did you mean ${local}@${typos[domain.toLowerCase()]}?` };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) return { valid: false, error: "Invalid email format" };
  return { valid: true, error: null };
}

function validatePassword(password: string) {
  if (password.length === 0) return { valid: false, error: null as string | null };
  if (password.length < 6) return { valid: false, error: "Password must be at least 6 characters" };
  return { valid: true, error: null };
}

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password);
  const confirmMatch = confirmPassword.length > 0 && password === confirmPassword;
  const confirmError = confirmTouched && confirmPassword.length > 0 && password !== confirmPassword
    ? "Passwords don't match" : null;
  const canSubmit = emailValidation.valid && passwordValidation.valid && confirmMatch;

  const handleSignUp = async () => {
    setEmailTouched(true);
    setPasswordTouched(true);
    setConfirmTouched(true);
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    if (data?.user && !data.session) setVerificationSent(true);
  };

  // OAuth: Google (via expo-auth-session) and Apple (native, iOS only)
  const google = useGoogleSignIn();

  const handleGoogle = async () => {
    setError(null);
    try {
      await google.promptAsync();
    } catch (e: any) {
      setError(e?.message ?? "Couldn't sign in with Google.");
    }
  };

  const handleApple = async () => {
    setError(null);
    const { error: authError } = await signInWithApple();
    if (authError) setError(authError.message);
  };

  if (verificationSent) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bgWarm, justifyContent: "center", paddingHorizontal: 28 }}>
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <ReviveWordmark size={44} />
        </View>
        <Text style={{ color: C.earth, fontSize: 24, fontFamily: "Quicksand_700Bold", fontWeight: "700", textAlign: "center", marginBottom: 8 }}>
          Verify your email
        </Text>
        <Text style={{ color: C.rock, fontSize: 14, textAlign: "center", lineHeight: 21, marginBottom: 32 }}>
          We sent a verification link to{"\n"}
          <Text style={{ color: C.primary, fontFamily: "Quicksand_600SemiBold", fontWeight: "600" }}>{email}</Text>
          {"\n\n"}Open the link to activate your account, then come back here to sign in.
        </Text>
        <Link href="/sign-in" asChild>
          <Pressable style={{ backgroundColor: C.primary, borderRadius: 16, height: 56, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: C.white, fontSize: 16, fontFamily: "Quicksand_700Bold", fontWeight: "700" }}>Go to Sign In</Text>
          </Pressable>
        </Link>
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
        <BackButton
          onPress={() => router.canGoBack() ? router.back() : router.replace("/sign-in")}
          style={{ marginBottom: 24 }}
        />

        {/* Icon */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <ReviveWordmark size={44} />
        </View>

        {/* Title + subtitle */}
        <Text style={{ fontSize: 28, fontFamily: "Quicksand_700Bold", fontWeight: "700", color: C.earth, textAlign: "center", letterSpacing: -0.5, marginBottom: 8 }}>
          Build your stronger self
        </Text>
        <Text style={{ fontSize: 14, color: C.rock, textAlign: "center", lineHeight: 20, marginBottom: 32, paddingHorizontal: 8 }}>
          Create your account to start personalized training, meal plans, and progress tracking — all in one place.
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
            style={{ flex: 1, color: C.earth, fontSize: 15, fontFamily: "Quicksand_500Medium", fontWeight: "500" }}
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
          borderWidth: 1.5,
          borderColor: passwordTouched && passwordValidation.error ? C.error : C.border,
          marginBottom: passwordTouched && passwordValidation.error ? 4 : 12,
          shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3,
        }}>
          <Ionicons name="lock-closed-outline" size={20} color={C.rock} />
          <TextInput
            style={{ flex: 1, color: C.earth, fontSize: 15, fontFamily: "Quicksand_500Medium", fontWeight: "500" }}
            placeholder="Password"
            placeholderTextColor={C.rock}
            secureTextEntry={!showPassword}
            textContentType="newPassword"
            value={password}
            onChangeText={(t) => { setPassword(t); setPasswordTouched(true); }}
            onBlur={() => setPasswordTouched(true)}
          />
          <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={C.rock} />
          </Pressable>
        </View>
        {passwordTouched && passwordValidation.error && (
          <Text style={{ fontSize: 12, color: C.error, paddingLeft: 4, marginBottom: 8 }}>
            {passwordValidation.error}
          </Text>
        )}

        {/* Confirm */}
        <View style={{
          flexDirection: "row", alignItems: "center", gap: 12,
          backgroundColor: C.white, borderRadius: 14, paddingHorizontal: 16, height: 56,
          borderWidth: 1.5, borderColor: confirmError ? C.error : C.border,
          marginBottom: confirmError ? 4 : 20,
          shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3,
        }}>
          <Ionicons name="lock-closed-outline" size={20} color={C.rock} />
          <TextInput
            style={{ flex: 1, color: C.earth, fontSize: 15, fontFamily: "Quicksand_500Medium", fontWeight: "500" }}
            placeholder="Confirm Password"
            placeholderTextColor={C.rock}
            secureTextEntry={!showConfirmPassword}
            textContentType="newPassword"
            value={confirmPassword}
            onChangeText={(t) => { setConfirmPassword(t); setConfirmTouched(true); }}
            onBlur={() => setConfirmTouched(true)}
          />
          <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} hitSlop={8}>
            <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color={C.rock} />
          </Pressable>
        </View>
        {confirmError && (
          <Text style={{ fontSize: 12, color: C.error, paddingLeft: 4, marginBottom: 12 }}>
            {confirmError}
          </Text>
        )}

        {/* Server error */}
        {error && (
          <Text style={{ color: C.error, textAlign: "center", marginBottom: 12, fontSize: 13 }}>{error}</Text>
        )}

        {/* CTA */}
        <Pressable
          onPress={handleSignUp}
          disabled={!canSubmit || loading}
          style={({ pressed }) => ({
            backgroundColor: C.primary,
            borderRadius: 16, height: 56, alignItems: "center", justifyContent: "center", marginBottom: 24,
            opacity: (email.length === 0 && password.length === 0 && confirmPassword.length === 0) ? 0.55 : loading ? 0.7 : pressed ? 0.92 : 1,
          })}
        >
          {loading ? (
            <ActivityIndicator color={C.white} />
          ) : (
            <Text style={{ fontSize: 16, fontFamily: "Quicksand_700Bold", fontWeight: "700", color: C.white, letterSpacing: -0.1 }}>Sign Up</Text>
          )}
        </Pressable>

        {/* OR */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
          <Text style={{ fontSize: 13, color: C.rock, fontFamily: "Quicksand_500Medium", fontWeight: "500" }}>or</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
        </View>

        {/* Google */}
        <Pressable
          onPress={handleGoogle}
          disabled={!google.ready}
          style={({ pressed }) => ({
            flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12,
            backgroundColor: C.white, borderRadius: 14, height: 54, marginBottom: 12,
            shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text style={{ fontSize: 16, fontFamily: "Quicksand_700Bold", fontWeight: "700", color: "#4285F4" }}>G</Text>
          <Text style={{ fontSize: 15, fontFamily: "Quicksand_600SemiBold", fontWeight: "600", color: C.earth }}>Log in with Google</Text>
        </Pressable>

        {/* Apple — iOS only */}
        {APPLE_AUTH_AVAILABLE && (
        <Pressable
          onPress={handleApple}
          style={({ pressed }) => ({
            flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12,
            backgroundColor: C.white, borderRadius: 14, height: 54, marginBottom: 24,
            shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Ionicons name="logo-apple" size={20} color={C.earth} />
          <Text style={{ fontSize: 15, fontFamily: "Quicksand_600SemiBold", fontWeight: "600", color: C.earth }}>Sign up with Apple</Text>
        </Pressable>
        )}

        {/* Footer */}
        <Link href="/sign-in" asChild>
          <Pressable style={{ alignItems: "center", paddingVertical: 8 }}>
            <Text style={{ fontSize: 14, color: C.rock }}>
              Already have an account?{" "}
              <Text style={{ color: C.primary, fontFamily: "Quicksand_700Bold", fontWeight: "700" }}>Login</Text>
            </Text>
          </Pressable>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
