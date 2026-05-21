import { View, Text, Pressable, ActivityIndicator, Animated, StyleSheet, PanResponder } from "react-native";
import { router } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@repped/shared";
import { supabase } from "../../src/lib/supabase";
import { TopoBackground } from "../../src/components/terrain";

const STAR_OPTIONS = [1, 2, 3, 4, 5];

const SCALE_LABELS: Record<string, [string, string]> = {
  sleep: ["Poor", "Great"],
  energy: ["Drained", "Energized"],
  soreness: ["Sore", "Fresh"],
};

// ——— Thumb Notch ———
function Notch({ value, isSelected, isPassed }: {
  value: number; isSelected: boolean; isPassed: boolean;
}) {
  const scale = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isSelected ? 1 : 0,
      damping: 16, stiffness: 180, mass: 0.6,
      useNativeDriver: true,
    }).start();
  }, [isSelected]);

  const numOpacity = scale.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });

  return (
    <View style={s.notch}>
      <Animated.View style={[
        s.nMark,
        isPassed && !isSelected && s.nPassed,
        isSelected && {
          width: 28, height: 28, borderRadius: 14,
          backgroundColor: "#2D2A24",
          shadowColor: "#2D2A24", shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
        },
      ]}>
        {isSelected && (
          <Animated.View style={{ opacity: numOpacity }}>
            <Text style={s.nNum}>{value}</Text>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}

// ——— Slider Track Metric ———
function SliderMetric({ label, scaleKey, value, onSelect }: {
  label: string; scaleKey: string; value: number; onSelect: (v: number) => void;
}) {
  const labels = SCALE_LABELS[scaleKey] || ["Low", "High"];
  const fillWidth = value > 0 ? `${((value - 1) / 4) * 100}%` : "0%";
  const stateRef = useRef({ trackWidth: 0, value, onSelect });
  stateRef.current.value = value;
  stateRef.current.onSelect = onSelect;

  const handleAt = (x: number) => {
    const { trackWidth, value: v, onSelect: sel } = stateRef.current;
    if (trackWidth <= 0) return;
    const clamped = Math.max(0, Math.min(trackWidth, x));
    const next = Math.max(1, Math.min(5, Math.round((clamped / trackWidth) * 4) + 1));
    if (next !== v) sel(next);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (evt) => handleAt(evt.nativeEvent.locationX),
      onPanResponderMove: (evt) => handleAt(evt.nativeEvent.locationX),
      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  return (
    <View style={s.metric}>
      <View style={s.mTop}>
        <Text style={s.mLabel}>{label}</Text>
      </View>
      <View
        style={s.track}
        onLayout={(e) => { stateRef.current.trackWidth = e.nativeEvent.layout.width; }}
        {...panResponder.panHandlers}
      >
        {/* Background track */}
        <View style={s.trackBg} pointerEvents="none" />
        {/* Green fill */}
        <View style={[s.trackFill, { width: fillWidth as any }]} pointerEvents="none" />
        {/* Notches (visual only — track owns gestures) */}
        <View style={s.notches} pointerEvents="none">
          {STAR_OPTIONS.map((v) => (
            <Notch
              key={v}
              value={v}
              isSelected={value === v}
              isPassed={value > 0 && v < value}
            />
          ))}
        </View>
      </View>
      <View style={s.labels}>
        <Text style={s.lbl}>{labels[0]}</Text>
        <Text style={s.lbl}>{labels[1]}</Text>
      </View>
    </View>
  );
}

// ——— Main Screen ———
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

    await (supabase.from("wellness_logs").insert as any)({
      user_id: session.user.id,
      sleep_quality: sleep,
      energy_level: energy,
      soreness_level: soreness,
      nutrition_adherence: nutrition,
    });

    setLoading(false);
    setSaved(true);
  };

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => router.navigate("/(app)"), 900);
    return () => clearTimeout(t);
  }, [saved]);

  if (saved) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F6F5F0", justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
        <TopoBackground />
        <Text style={{ fontSize: 48, marginBottom: 16 }}>✓</Text>
        <Text style={{ color: "#2D2A24", fontSize: 24, fontWeight: "700", marginBottom: 8 }}>Logged!</Text>
        <Text style={{ color: "#8E8E7A", textAlign: "center", fontSize: 14 }}>
          Tracking wellness helps us optimize your training.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F6F5F0" }}>
      <TopoBackground />
      <View style={s.zone}>
        <Pressable onPress={() => router.navigate("/(app)")} style={s.back}>
          <Text style={{ color: "#2D2A24", fontSize: 16, fontWeight: "600" }}>‹</Text>
        </Pressable>

        <Text style={s.title}>Wellness Check</Text>
        <Text style={s.subtitle}>Quick check — takes 10 seconds.</Text>

        <SliderMetric label="Sleep Quality" scaleKey="sleep" value={sleep} onSelect={setSleep} />
        <SliderMetric label="Energy Level" scaleKey="energy" value={energy} onSelect={setEnergy} />
        <SliderMetric label="Muscle Soreness" scaleKey="soreness" value={soreness} onSelect={setSoreness} />

        {/* Nutrition */}
        <View style={s.metric}>
          <View style={s.mTop}>
            <Text style={s.mLabel}>Followed meal plan?</Text>
          </View>
          <View style={s.nut}>
            {([["yes", "Yes"], ["mostly", "Mostly"], ["no", "No"]] as const).map(([val, label]) => (
              <Pressable
                key={val}
                onPress={() => setNutrition(val)}
                style={[s.nutBtn, nutrition === val ? s.nutOn : s.nutOff]}
              >
                <Text style={[s.nutText, nutrition === val ? s.nutTextOn : s.nutTextOff]}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          onPress={handleSave}
          disabled={!canSave || loading}
          style={[s.saveBtn, !canSave && !loading && s.saveBtnOff]}
        >
          {loading ? <ActivityIndicator color="#F6F5F0" /> : (
            <Text style={[s.saveBtnText, !canSave && { color: "#AEAB9F" }]}>Save</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  zone: { paddingHorizontal: 24, paddingTop: 54 },
  back: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#EDEBE5",
    alignItems: "center", justifyContent: "center",
    marginBottom: 20,
  },
  title: { fontSize: 26, fontWeight: "800", color: "#2D2A24", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#8E8E7A", marginBottom: 32 },

  // Metric
  metric: { marginBottom: 32 },
  mTop: {
    flexDirection: "row", alignItems: "flex-end",
    justifyContent: "space-between", marginBottom: 18,
  },
  mLabel: { fontSize: 15, fontWeight: "700", color: "#2D2A24" },
  mVal: { fontSize: 20, fontWeight: "900", color: "#2D2A24" },

  // Track
  track: {
    position: "relative", height: 44,
    justifyContent: "center",
  },
  trackBg: {
    position: "absolute", left: 0, right: 0, height: 4,
    backgroundColor: "#EDEBE5", borderRadius: 2,
  },
  trackFill: {
    position: "absolute", left: 0, height: 4,
    backgroundColor: "#34D399", borderRadius: 2,
  },
  notches: {
    flexDirection: "row", justifyContent: "space-between",
    position: "relative", zIndex: 2,
  },
  notch: {
    width: 44, height: 44,
    alignItems: "center", justifyContent: "center",
  },
  nMark: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: "#EDEBE5",
    alignItems: "center", justifyContent: "center",
  },
  nPassed: {
    backgroundColor: "rgba(52,211,153,0.25)",
    width: 6, height: 6, borderRadius: 3,
  },
  nNum: { fontSize: 12, fontWeight: "800", color: "#F6F5F0" },

  labels: {
    flexDirection: "row", justifyContent: "space-between",
    paddingHorizontal: 8, paddingTop: 2,
  },
  lbl: { fontSize: 9, fontWeight: "500", color: "#AEAB9F" },

  // Nutrition
  nut: { flexDirection: "row", gap: 6 },
  nutBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5,
  },
  nutOff: {
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(0,0,0,0.04)",
  },
  nutOn: {
    backgroundColor: "#2D2A24",
    borderColor: "#2D2A24",
    shadowColor: "#2D2A24", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 10, elevation: 3,
  },
  nutText: { fontSize: 13, fontWeight: "700" },
  nutTextOff: { color: "#8E8E7A" },
  nutTextOn: { color: "#F6F5F0" },

  // Save
  saveBtn: {
    paddingVertical: 18, borderRadius: 18,
    alignItems: "center", marginTop: 4,
    backgroundColor: "#2D2A24",
  },
  saveBtnOff: { backgroundColor: "#EDEBE5" },
  saveBtnText: { fontSize: 16, fontWeight: "700", color: "#F6F5F0" },
});
