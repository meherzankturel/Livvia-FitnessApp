"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../src/lib/supabase";
import { calculateEstimated1RM, calculateVolumeLoad, calculateWorkoutStreak, calculateCompletionRate } from "@repped/shared";

export default function Progress() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<any[]>([]);
  const [weightInput, setWeightInput] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  const [volume, setVolume] = useState(0);
  const [prs, setPrs] = useState<any[]>([]);
  const [estimated1RMs, setEstimated1RMs] = useState<any[]>([]);
  const [heatmapDays, setHeatmapDays] = useState<Set<string>>(new Set());

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { session: __s } } = await supabase.auth.getSession(); const user = __s?.user; if (!user) return;
    if (!user) return;

    // Weight entries
    const { data: weightData } = await supabase.from("progress_entries").select("id, date, weight_kg").eq("user_id", user.id).order("date", { ascending: false }).limit(30);
    setEntries((weightData as any[]) || []);

    // Workout stats
    const { count } = await supabase.from("workout_logs").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("skipped", false);
    setWorkoutCount(count || 0);

    // Streak
    const { data: allLogs } = await supabase.from("workout_logs").select("started_at").eq("user_id", user.id).eq("skipped", false).order("started_at", { ascending: false });
    const dates = ((allLogs as any[]) || []).map(l => l.started_at);
    setStreak(calculateWorkoutStreak(dates));

    // Completion rate
    const { data: plans } = await supabase.from("workout_plans").select("id").eq("user_id", user.id).eq("is_rest_day", false);
    setCompletionRate(Math.round(calculateCompletionRate(((plans as any[]) || []).length, count || 0) * 100));

    // Volume this week
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const { data: weekLogs } = await supabase.from("workout_logs").select("id").eq("user_id", user.id).gte("started_at", weekAgo).eq("skipped", false);
    const logIds = ((weekLogs as any[]) || []).map(l => l.id);
    if (logIds.length > 0) {
      const { data: sets } = await supabase.from("set_logs").select("reps, weight_kg").in("workout_log_id", logIds);
      setVolume(calculateVolumeLoad(((sets as any[]) || []).map(s => ({ reps: s.reps, weight_kg: s.weight_kg }))));
    }

    // PRs
    const { data: prData } = await supabase.from("personal_records").select("*, exercises(name)").eq("user_id", user.id).order("achieved_at", { ascending: false }).limit(5);
    setPrs((prData as any[]) || []);

    // Heatmap (last 84 days)
    const days84Ago = new Date(Date.now() - 84 * 86400000).toISOString();
    const { data: heatLogs } = await supabase.from("workout_logs").select("started_at").eq("user_id", user.id).gte("started_at", days84Ago).eq("skipped", false);
    const daySet = new Set(((heatLogs as any[]) || []).map(l => new Date(l.started_at).toISOString().split("T")[0]));
    setHeatmapDays(daySet);

    // Estimated 1RMs for compound lifts
    const compounds = ["Barbell Bench Press", "Barbell Back Squat", "Barbell Deadlift", "Overhead Press"];
    const { data: exercises } = await supabase.from("exercises").select("id, name").in("name", compounds);
    const rms: any[] = [];
    for (const ex of ((exercises as any[]) || [])) {
      const { data: bestSet } = await supabase.from("set_logs").select("reps, weight_kg")
        .eq("exercise_id", ex.id).order("weight_kg", { ascending: false }).limit(1).single();
      if (bestSet) {
        const s = bestSet as any;
        rms.push({ name: ex.name.replace("Barbell ", ""), estimated1RM: calculateEstimated1RM(s.weight_kg, s.reps) });
      }
    }
    setEstimated1RMs(rms);

    setLoading(false);
  };

  const logWeight = async () => {
    const w = parseFloat(weightInput);
    if (isNaN(w) || w <= 0) return;
    const { data: { session: __s } } = await supabase.auth.getSession(); const user = __s?.user; if (!user) return;
    if (!user) return;
    await supabase.from("progress_entries").insert({ user_id: user.id, weight_kg: w } as any);
    setWeightInput(""); setShowInput(false); loadData();
  };

  // Generate heatmap data
  const heatmapGrid = [];
  for (let i = 83; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    heatmapGrid.push({ date: d.toISOString().split("T")[0], hasWorkout: heatmapDays.has(d.toISOString().split("T")[0]) });
  }

  const trend = entries.length > 7
    ? (entries.slice(0, 7).reduce((s, e) => s + (e.weight_kg || 0), 0) / Math.min(entries.length, 7)) -
      (entries.slice(7, 14).reduce((s, e) => s + (e.weight_kg || 0), 0) / Math.min(Math.max(entries.length - 7, 1), 7))
    : 0;

  if (loading) return <main className="flex items-center justify-center min-h-screen"><div className="text-gray-400">Loading...</div></main>;

  return (
    <main className="max-w-lg mx-auto px-6 pt-16 pb-32">
      <p className="text-gray-400 text-base mb-1">Your Journey</p>
      <h1 className="text-white text-3xl font-bold mb-6">Progress</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gray-900 rounded-2xl p-4 text-center"><p className="text-gray-500 text-xs mb-1">Workouts</p><p className="text-white text-2xl font-bold">{workoutCount}</p></div>
        <div className="bg-gray-900 rounded-2xl p-4 text-center"><p className="text-gray-500 text-xs mb-1">Streak</p><p className="text-orange-400 text-2xl font-bold">{streak}w</p></div>
        <div className="bg-gray-900 rounded-2xl p-4 text-center"><p className="text-gray-500 text-xs mb-1">Rate</p><p className="text-[#0090ff] text-2xl font-bold">{completionRate}%</p></div>
      </div>

      {/* Heatmap */}
      <div className="mb-6">
        <p className="text-gray-400 text-sm mb-2">Last 12 Weeks</p>
        <div className="flex flex-wrap gap-[3px]">
          {heatmapGrid.map((d, i) => (
            <div key={i} className={`w-[10px] h-[10px] rounded-sm ${d.hasWorkout ? "bg-green-500" : "bg-gray-800"}`} title={d.date} />
          ))}
        </div>
      </div>

      {/* Volume */}
      {volume > 0 && (
        <div className="bg-gray-900 rounded-2xl p-5 mb-4">
          <p className="text-gray-500 text-xs mb-1">Volume This Week</p>
          <p className="text-white text-2xl font-bold">{(volume / 1000).toFixed(1)} tons</p>
        </div>
      )}

      {/* 1RMs */}
      {estimated1RMs.length > 0 && (
        <div className="bg-gray-900 rounded-2xl p-5 mb-4">
          <p className="text-gray-500 text-xs mb-3">Estimated 1RM</p>
          <div className="space-y-2">
            {estimated1RMs.map((rm, i) => (
              <div key={i} className="flex justify-between"><span className="text-gray-300">{rm.name}</span><span className="text-[#0090ff] font-semibold">{rm.estimated1RM} kg</span></div>
            ))}
          </div>
        </div>
      )}

      {/* PRs */}
      {prs.length > 0 && (
        <div className="bg-gray-900 rounded-2xl p-5 mb-4">
          <p className="text-gray-500 text-xs mb-3">Recent PRs 🏆</p>
          {prs.map((pr: any, i: number) => (
            <div key={i} className="flex justify-between py-1"><span className="text-gray-300">{pr.exercises?.name}</span><span className="text-[#0090ff] font-semibold">{pr.value} kg</span></div>
          ))}
        </div>
      )}

      {/* Weight */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-900 rounded-2xl p-4 text-center"><p className="text-gray-500 text-xs mb-1">Current</p><p className="text-white text-2xl font-bold">{entries[0]?.weight_kg || "—"}</p></div>
          <div className="bg-gray-900 rounded-2xl p-4 text-center"><p className="text-gray-500 text-xs mb-1">Trend</p><p className={`text-2xl font-bold ${trend > 0 ? "text-red-400" : trend < 0 ? "text-green-400" : "text-gray-400"}`}>{trend !== 0 ? `${trend > 0 ? "+" : ""}${trend.toFixed(1)}` : "—"}</p></div>
        </div>

        {showInput ? (
          <div className="bg-gray-900 rounded-2xl p-5">
            <input type="number" step="0.1" placeholder="70.0" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} className="w-full bg-gray-800 text-white text-xl rounded-2xl px-5 py-4 mb-4 text-center outline-none" autoFocus />
            <div className="flex gap-3">
              <button onClick={() => setShowInput(false)} className="flex-1 border border-gray-700 rounded-2xl py-3 text-gray-400">Cancel</button>
              <button onClick={logWeight} className="flex-1 bg-[#0090ff] rounded-2xl py-3 text-white font-semibold">Save</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowInput(true)} className="w-full bg-[#0090ff] rounded-2xl py-4 text-white text-lg font-semibold">Log Weight</button>
        )}
      </div>

      {/* Weight History */}
      {entries.length > 0 && (
        <div>
          <h3 className="text-gray-400 text-base mb-3">Recent Entries</h3>
          <div className="space-y-2">
            {entries.slice(0, 10).map((e: any) => (
              <div key={e.id} className="flex justify-between bg-gray-900 rounded-xl px-5 py-3">
                <span className="text-gray-400">{new Date(e.date).toLocaleDateString()}</span>
                <span className="text-white font-semibold">{e.weight_kg} kg</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
