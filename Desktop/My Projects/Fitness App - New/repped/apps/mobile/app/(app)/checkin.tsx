import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { useAuthStore, calculateAdjustment } from "@repped/shared";
import type { DifficultyRating } from "@repped/shared";
import { supabase } from "../../src/lib/supabase";
import { TopoBackground } from "../../src/components/terrain";

const options: { value: DifficultyRating; label: string; emoji: string; desc: string }[] = [
  { value: "too_easy", label: "Too Easy", emoji: "😎", desc: "I could do more" },
  { value: "just_right", label: "Just Right", emoji: "💪", desc: "Challenging but manageable" },
  { value: "too_hard", label: "Too Hard", emoji: "😤", desc: "I'm struggling to complete workouts" },
];

export default function Checkin() {
  const session = useAuthStore((s) => s.session);
  const [selected, setSelected] = useState<DifficultyRating | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!session?.user?.id || !selected) return;
    setLoading(true);

    // Get profile for training history
    const { data: profile } = await supabase
      .from("profiles")
      .select("training_history")
      .eq("id", session.user.id)
      .single();

    // Count consecutive hard weeks
    const { data: recentCheckins } = await supabase
      .from("weekly_checkins")
      .select("difficulty_rating")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(3);

    let consecutiveHard = 0;
    for (const c of recentCheckins || []) {
      if (c.difficulty_rating === "too_hard") consecutiveHard++;
      else break;
    }
    if (selected === "too_hard") consecutiveHard++;

    const adjustment = calculateAdjustment(
      selected,
      1,
      consecutiveHard,
      (profile?.training_history as any) || "beginner"
    );

    // Save check-in
    await supabase.from("weekly_checkins").insert({
      user_id: session.user.id,
      week: 1,
      difficulty_rating: selected,
      adjustment_applied: adjustment.message,
    });

    setResult(adjustment.message);
    setLoading(false);
  };

  if (result) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F6F5F0", justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
        <TopoBackground />
        <Text style={{ fontSize: 40, marginBottom: 16 }}>✅</Text>
        <Text style={{ color: "#2D2A24", fontSize: 24, fontFamily: "Quicksand_700Bold", fontWeight: "700", marginBottom: 16, textAlign: "center" }}>Check-in Logged</Text>
        <View style={{ backgroundColor: "#EDEBE5", borderRadius: 16, padding: 20, width: "100%", marginBottom: 32 }}>
          <Text style={{ color: "#2D2A24", fontSize: 16, textAlign: "center" }}>{result}</Text>
        </View>
        <Pressable
          onPress={() => router.replace("/(app)")}
          style={{ backgroundColor: "#2D2A24", borderRadius: 16, paddingHorizontal: 32, paddingVertical: 16 }}
        >
          <Text style={{ color: "#F6F5F0", fontSize: 18, fontFamily: "Quicksand_600SemiBold", fontWeight: "600" }}>Back to Today</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F6F5F0", paddingHorizontal: 24, paddingTop: 80 }}>
      <TopoBackground />
      <Text style={{ color: "#8E8E7A", fontSize: 16, marginBottom: 8 }}>Weekly Check-in</Text>
      <Text style={{ color: "#2D2A24", fontSize: 30, fontFamily: "Quicksand_700Bold", fontWeight: "700", marginBottom: 8 }}>How was this week?</Text>
      <Text style={{ color: "#8E8E7A", fontSize: 16, marginBottom: 32 }}>Be honest — this helps us adjust your plan.</Text>

      <View style={{ gap: 16, marginBottom: 40 }}>
        {options.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setSelected(option.value)}
            style={{
              borderRadius: 16, padding: 20, flexDirection: "row", alignItems: "center",
              backgroundColor: selected === option.value ? "#2D2A24" : "#EDEBE5",
            }}
          >
            <Text style={{ fontSize: 30, marginRight: 16 }}>{option.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontFamily: "Quicksand_600SemiBold", fontWeight: "600", color: selected === option.value ? "#F6F5F0" : "#2D2A24" }}>
                {option.label}
              </Text>
              <Text style={{ fontSize: 14, color: selected === option.value ? "#AEAEB2" : "#8E8E7A" }}>
                {option.desc}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={handleSubmit}
        disabled={!selected || loading}
        style={{
          width: "100%", borderRadius: 16, paddingVertical: 16, alignItems: "center",
          backgroundColor: selected && !loading ? "#2D2A24" : "#EDEBE5",
        }}
      >
        {loading ? (
          <ActivityIndicator color="#F6F5F0" />
        ) : (
          <Text style={{ fontSize: 18, fontFamily: "Quicksand_600SemiBold", fontWeight: "600", color: selected ? "#F6F5F0" : "#8E8E7A" }}>
            Submit Check-in
          </Text>
        )}
      </Pressable>
    </View>
  );
}
