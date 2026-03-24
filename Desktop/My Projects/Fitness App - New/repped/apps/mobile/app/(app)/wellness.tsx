import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { useAuthStore } from "@repped/shared";
import { supabase } from "../../src/lib/supabase";
import { TopoBackground } from "../../src/components/terrain";

const STAR_OPTIONS = [1, 2, 3, 4, 5];

export default function Wellness() {
  const session = useAuthStore((s) => s.session);
  const [sleep, setSleep] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [soreness, setSoreness] = useState(0);
  const [nutrition, setNutrition] = useState<"yes" | "mostly" | "no" | "">("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const canSave = sleep > 0 && energy > 0 && soreness > 0 && nutrition !== "";

  const handleSave = async () => {
    if (!session?.user?.id || !canSave) return;
    setLoading(true);

    await supabase.from("wellness_logs").insert({
      user_id: session.user.id,
      sleep_quality: sleep,
      energy_level: energy,
      soreness_level: soreness,
      nutrition_adherence: nutrition,
    } as any);

    setLoading(false);
    setSaved(true);
  };

  if (saved) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F6F5F0", justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
        <TopoBackground />
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🧘</Text>
        <Text style={{ color: "#2D2A24", fontSize: 24, fontWeight: "700", marginBottom: 8 }}>Logged!</Text>
        <Text style={{ color: "#8E8E7A", textAlign: "center", marginBottom: 24 }}>Tracking wellness helps us optimize your training.</Text>
        <Pressable onPress={() => router.navigate("/(app)")} style={{ backgroundColor: "#2D2A24", borderRadius: 16, paddingHorizontal: 32, paddingVertical: 16 }}>
          <Text style={{ color: "#F6F5F0", fontSize: 18, fontWeight: "600" }}>Back</Text>
        </Pressable>
      </View>
    );
  }

  const StarRow = ({ label, emoji, value, onSelect }: { label: string; emoji: string; value: number; onSelect: (v: number) => void }) => (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ color: "#2D2A24", fontSize: 18, marginBottom: 12 }}>{emoji} {label}</Text>
      <View style={{ flexDirection: "row", gap: 12 }}>
        {STAR_OPTIONS.map((v) => (
          <Pressable
            key={v}
            onPress={() => onSelect(v)}
            style={{ flex: 1, borderRadius: 16, paddingVertical: 16, alignItems: "center", backgroundColor: v <= value ? "#2D2A24" : "#EDEBE5" }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: v <= value ? "#F6F5F0" : "#8E8E7A" }}>{v}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#F6F5F0", paddingHorizontal: 24, paddingTop: 64 }}>
      <TopoBackground />
      <Pressable onPress={() => router.navigate("/(app)")} style={{ marginBottom: 16 }}>
        <Text style={{ color: "#2D2A24", fontSize: 16 }}>← Back</Text>
      </Pressable>

      <Text style={{ color: "#2D2A24", fontSize: 30, fontWeight: "700", marginBottom: 8 }}>Wellness Check</Text>
      <Text style={{ color: "#8E8E7A", fontSize: 16, marginBottom: 32 }}>Quick check — takes 10 seconds.</Text>

      <StarRow label="Sleep Quality" emoji="😴" value={sleep} onSelect={setSleep} />
      <StarRow label="Energy Level" emoji="⚡" value={energy} onSelect={setEnergy} />
      <StarRow label="Muscle Soreness" emoji="💪" value={soreness} onSelect={setSoreness} />

      <Text style={{ color: "#2D2A24", fontSize: 18, marginBottom: 12 }}>🍽 Did you follow the meal plan?</Text>
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 32 }}>
        {([["yes", "Yes"], ["mostly", "Mostly"], ["no", "No"]] as const).map(([val, label]) => (
          <Pressable
            key={val}
            onPress={() => setNutrition(val)}
            style={{ flex: 1, borderRadius: 16, paddingVertical: 16, alignItems: "center", backgroundColor: nutrition === val ? "#2D2A24" : "#EDEBE5" }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600", color: nutrition === val ? "#F6F5F0" : "#8E8E7A" }}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={handleSave}
        disabled={!canSave || loading}
        style={{ borderRadius: 16, paddingVertical: 16, alignItems: "center", backgroundColor: canSave && !loading ? "#2D2A24" : "#EDEBE5" }}
      >
        {loading ? <ActivityIndicator color="#F6F5F0" /> : (
          <Text style={{ fontSize: 18, fontWeight: "600", color: canSave ? "#F6F5F0" : "#8E8E7A" }}>Save</Text>
        )}
      </Pressable>
    </View>
  );
}
