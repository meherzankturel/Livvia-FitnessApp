import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useAuthStore, generateWeeklySummary } from "@repped/shared";
import { supabase } from "../../src/lib/supabase";
import { TopoBackground } from "../../src/components/terrain";

export default function WeeklySummaryScreen() {
  const session = useAuthStore((s) => s.session);
  const [summary, setSummary] = useState<any>(null);
  const [prevWeekVolume, setPrevWeekVolume] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadSummary(); }, []);

  const getMotivationalMessage = (completionRate: number) => {
    if (completionRate >= 80) return { text: "Crushing it!", color: "#34D399" };
    if (completionRate >= 50) return { text: "Good progress!", color: "#F59E0B" };
    return { text: "Let's bounce back!", color: "#EF4444" };
  };

  const getVolumeComparison = (currentVolume: number, previousVolume: number | null) => {
    if (!previousVolume || previousVolume === 0) return null;
    const pctChange = Math.round(((currentVolume - previousVolume) / previousVolume) * 100);
    if (pctChange === 0) return { text: "Same volume as last week", color: "#AEAEB2" };
    const direction = pctChange > 0 ? "up" : "down";
    return { text: `Volume ${direction} ${Math.abs(pctChange)}% from last week`, color: pctChange > 0 ? "#34D399" : "#EF4444" };
  };

  const getHighlight = (s: any) => {
    if (s.personalRecords?.length > 0) {
      const best = s.personalRecords[0];
      return { label: "Best Lift", value: `${best.exerciseName} - ${best.value} kg` };
    }
    if (s.workoutStreak > 1) {
      return { label: "Longest Streak", value: `${s.workoutStreak} weeks running` };
    }
    if (s.totalWorkouts > 0) {
      return { label: "Workouts Completed", value: `${s.totalWorkouts} sessions this week` };
    }
    return null;
  };

  const loadSummary = async () => {
    if (!session?.user?.id) return;
    const uid = session.user.id;

    // Get this week's workout logs
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

    const { data: workoutLogs } = await supabase.from("workout_logs").select("id, started_at, completed_at, skipped")
      .eq("user_id", uid).gte("started_at", weekAgo).eq("skipped", false);

    // Get set logs for this week
    const logIds = ((workoutLogs as any[]) || []).map(l => l.id);
    let setLogs: any[] = [];
    if (logIds.length > 0) {
      const { data } = await supabase.from("set_logs").select("reps, weight_kg").in("workout_log_id", logIds);
      setLogs = (data as any[]) || [];
    }

    // Get previous week's workout logs for volume comparison
    const { data: prevWorkoutLogs } = await supabase.from("workout_logs").select("id")
      .eq("user_id", uid).gte("started_at", twoWeeksAgo).lt("started_at", weekAgo).eq("skipped", false);
    const prevLogIds = ((prevWorkoutLogs as any[]) || []).map(l => l.id);
    if (prevLogIds.length > 0) {
      const { data: prevSets } = await supabase.from("set_logs").select("reps, weight_kg").in("workout_log_id", prevLogIds);
      const prevVol = ((prevSets as any[]) || []).reduce((sum: number, s: any) => sum + (s.reps || 0) * (s.weight_kg || 0), 0);
      setPrevWeekVolume(prevVol);
    }

    // Get all workout dates for streak
    const { data: allLogs } = await supabase.from("workout_logs").select("started_at")
      .eq("user_id", uid).eq("skipped", false).order("started_at", { ascending: false });
    const workoutDates = ((allLogs as any[]) || []).map(l => l.started_at);

    // Get planned workouts count for this week
    const { data: plans } = await supabase.from("workout_plans").select("id")
      .eq("user_id", uid).eq("is_rest_day", false);

    // Get PRs this week
    const { data: prs } = await supabase.from("personal_records").select("*, exercises(name)")
      .eq("user_id", uid).gte("achieved_at", weekAgo);

    // Get weight entries
    const { data: weights } = await supabase.from("progress_entries").select("weight_kg")
      .eq("user_id", uid).order("date", { ascending: false }).limit(7);

    // Get wellness logs
    const { data: wellness } = await supabase.from("wellness_logs").select("sleep_quality, energy_level, soreness_level")
      .eq("user_id", uid).gte("date", weekAgo.split("T")[0]);

    const s = generateWeeklySummary({
      setLogs: setLogs.map((s: any) => ({ reps: s.reps, weight_kg: s.weight_kg })),
      workoutCount: ((workoutLogs as any[]) || []).length,
      plannedWorkouts: ((plans as any[]) || []).length,
      workoutDates,
      prs: ((prs as any[]) || []).map((p: any) => ({ exerciseName: p.exercises?.name || "", value: p.value, type: p.record_type })),
      weightEntries: ((weights as any[]) || []).map((w: any) => w.weight_kg).filter(Boolean),
      wellnessLogs: ((wellness as any[]) || []).map((w: any) => ({ sleep: w.sleep_quality, energy: w.energy_level, soreness: w.soreness_level })),
    });

    setSummary(s);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F6F5F0", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2D2A24" />
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F6F5F0", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#8E8E7A" }}>No data yet</Text>
      </View>
    );
  }

  const motivation = getMotivationalMessage(summary.completionRate);
  const volumeComp = getVolumeComparison(summary.totalVolume, prevWeekVolume);
  const highlight = getHighlight(summary);

  return (
    <View style={{ flex: 1, backgroundColor: "#F6F5F0" }}>
      <TopoBackground />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ paddingHorizontal: 24, paddingTop: 64 }}>
          <Pressable onPress={() => router.navigate("/(app)/progress")} style={{ marginBottom: 16 }}>
            <Text style={{ color: "#2D2A24" }}>← Back</Text>
          </Pressable>
          <Text style={{ color: "#2D2A24", fontSize: 30, fontWeight: "700", marginBottom: 4 }}>This Week</Text>

          {/* Motivational Message */}
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 24, color: motivation.color }}>{motivation.text}</Text>

          {/* Stats Grid */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
            <View style={{ flex: 1, backgroundColor: "#EDEBE5", borderRadius: 16, padding: 16, alignItems: "center" }}>
              <Text style={{ color: "#2D2A24", fontSize: 40, fontWeight: "700" }}>{summary.totalWorkouts}</Text>
              <Text style={{ color: "#8E8E7A", fontSize: 12, marginTop: 4 }}>Workouts</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: "#EDEBE5", borderRadius: 16, padding: 16, alignItems: "center" }}>
              <Text style={{ fontSize: 40, fontWeight: "700", color: motivation.color }}>{summary.completionRate}%</Text>
              <Text style={{ color: "#8E8E7A", fontSize: 12, marginTop: 4 }}>Completion</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: "#EDEBE5", borderRadius: 16, padding: 16, alignItems: "center" }}>
              <Text style={{ color: "#F59E0B", fontSize: 40, fontWeight: "700" }}>{summary.workoutStreak}w</Text>
              <Text style={{ color: "#8E8E7A", fontSize: 12, marginTop: 4 }}>Streak</Text>
            </View>
          </View>

          {/* Volume Card */}
          <View style={{ backgroundColor: "#2D2A24", borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <Text style={{ color: "#8E8E7A", fontSize: 12, marginBottom: 4 }}>Total Volume Lifted</Text>
            <Text style={{ color: "#F6F5F0", fontSize: 40, fontWeight: "700" }}>{(summary.totalVolume / 1000).toFixed(1)} tons</Text>
            {volumeComp && (
              <Text style={{ fontSize: 14, marginTop: 8, color: volumeComp.color }}>{volumeComp.text}</Text>
            )}
          </View>

          {/* Highlight of the Week */}
          {highlight && (
            <View style={{ borderRadius: 16, padding: 20, marginBottom: 16, backgroundColor: "#EDEBE5" }}>
              <Text style={{ color: "#2D2A24", fontSize: 12, fontWeight: "600", marginBottom: 4 }}>Highlight of the Week</Text>
              <Text style={{ color: "#8E8E7A", fontSize: 12 }}>{highlight.label}</Text>
              <Text style={{ color: "#2D2A24", fontSize: 24, fontWeight: "700", marginTop: 4 }}>{highlight.value}</Text>
            </View>
          )}

          {summary.weightTrend !== null && (
            <View style={{ backgroundColor: "#2D2A24", borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <Text style={{ color: "#8E8E7A", fontSize: 12, marginBottom: 4 }}>Weight Trend</Text>
              <Text style={{ fontSize: 30, fontWeight: "700", color: summary.weightTrend > 0 ? "#EF4444" : "#34D399" }}>
                {summary.weightTrend > 0 ? "+" : ""}{summary.weightTrend} kg
              </Text>
            </View>
          )}

          {summary.personalRecords.length > 0 && (
            <View style={{ backgroundColor: "#2D2A24", borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <Text style={{ color: "#8E8E7A", fontSize: 12, marginBottom: 12 }}>Personal Records This Week</Text>
              {summary.personalRecords.map((pr: any, i: number) => (
                <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 }}>
                  <Text style={{ color: "#F6F5F0", fontSize: 16 }}>{pr.exerciseName}</Text>
                  <Text style={{ color: "#34D399", fontSize: 18, fontWeight: "700" }}>{pr.value} kg</Text>
                </View>
              ))}
            </View>
          )}

          {(summary.avgSleep || summary.avgEnergy || summary.avgSoreness) && (
            <View style={{ backgroundColor: "#2D2A24", borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <Text style={{ color: "#8E8E7A", fontSize: 12, marginBottom: 12 }}>Wellness Averages</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                {summary.avgSleep && <View style={{ alignItems: "center", flex: 1 }}><Text style={{ color: "#F6F5F0", fontSize: 24, fontWeight: "700" }}>{summary.avgSleep}</Text><Text style={{ color: "#8E8E7A", fontSize: 12, marginTop: 4 }}>Sleep</Text></View>}
                {summary.avgEnergy && <View style={{ alignItems: "center", flex: 1 }}><Text style={{ color: "#34D399", fontSize: 24, fontWeight: "700" }}>{summary.avgEnergy}</Text><Text style={{ color: "#8E8E7A", fontSize: 12, marginTop: 4 }}>Energy</Text></View>}
                {summary.avgSoreness && <View style={{ alignItems: "center", flex: 1 }}><Text style={{ color: "#F59E0B", fontSize: 24, fontWeight: "700" }}>{summary.avgSoreness}</Text><Text style={{ color: "#8E8E7A", fontSize: 12, marginTop: 4 }}>Soreness</Text></View>}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
