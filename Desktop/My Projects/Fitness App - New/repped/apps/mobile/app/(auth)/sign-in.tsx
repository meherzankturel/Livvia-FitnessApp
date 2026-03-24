import { View, Text, Pressable, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { Link } from "expo-router";
import { useState } from "react";
import { supabase } from "../../src/lib/supabase";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.length > 0 && password.length >= 6;

  const handleSignIn = async () => {
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
    // Auth state change listener in _layout.tsx handles navigation
  };

  const inputStyle = {
    backgroundColor: "rgba(246,245,240,0.06)",
    color: "#F6F5F0" as const,
    fontSize: 18,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#0C0C0F" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24 }}>
        <Text style={{ color: "#F6F5F0", fontSize: 28, fontWeight: "700", marginBottom: 8 }}>Repped</Text>
        <Text style={{ color: "rgba(246,245,240,0.5)", fontSize: 18, marginBottom: 48 }}>
          Your workout, simplified.
        </Text>

        <TextInput
          style={inputStyle}
          placeholder="Email"
          placeholderTextColor="rgba(246,245,240,0.3)"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={{ ...inputStyle, marginBottom: 24 }}
          placeholder="Password"
          placeholderTextColor="rgba(246,245,240,0.3)"
          secureTextEntry
          textContentType="password"
          value={password}
          onChangeText={setPassword}
        />

        {error && (
          <Text style={{ color: "#EF4444", textAlign: "center", marginBottom: 16 }}>{error}</Text>
        )}

        <Pressable
          onPress={handleSignIn}
          disabled={!canSubmit || loading}
          style={{
            width: "100%",
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
            marginBottom: 16,
            backgroundColor: canSubmit && !loading ? "#34D399" : "rgba(246,245,240,0.06)",
          }}
        >
          {loading ? (
            <ActivityIndicator color="#34D399" />
          ) : (
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: canSubmit ? "#0C0C0F" : "rgba(246,245,240,0.2)",
              }}
            >
              Sign In
            </Text>
          )}
        </Pressable>

        <Link href="/sign-up" asChild>
          <Pressable style={{ width: "100%", alignItems: "center", paddingVertical: 12 }}>
            <Text style={{ color: "rgba(246,245,240,0.5)", fontSize: 16 }}>
              Don't have an account?{" "}
              <Text style={{ color: "#34D399", fontWeight: "600" }}>Sign Up</Text>
            </Text>
          </Pressable>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}
