import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useAuthStore } from "@repped/shared";
import { useEffect, useState } from "react";
import { supabase } from "../src/lib/supabase";
import tw from "../src/lib/tw";

export default function Index() {
  const loading = useAuthStore((s) => s.loading);
  const session = useAuthStore((s) => s.session);
  const [destination, setDestination] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !session) return;

    // Check onboarding status and redirect
    supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => {
        if ((data as any)?.onboarding_completed) {
          setDestination("/(app)");
        } else {
          setDestination("/(onboarding)/step1-welcome");
        }
      })
      .catch(() => {
        setDestination("/(onboarding)/step1-welcome");
      });
  }, [loading, session]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F6F5F0", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2D2A24" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (destination) {
    return <Redirect href={destination as any} />;
  }

  return (
    <View style={tw`flex-1 bg-black justify-center items-center`}>
      <ActivityIndicator size="large" color="#0090ff" />
    </View>
  );
}
