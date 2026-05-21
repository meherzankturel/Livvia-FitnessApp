"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../src/lib/supabase";
import { generateWorkoutPlan, suggestWeight, generateWarmup, generateCooldown, getWarmupDuration, getCooldownDuration, EDUCATIONAL_TIPS } from "@repped/shared";
import type { Exercise, WarmUpExercise, CoolDownExercise } from "@repped/shared";

interface ExerciseData {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  targetReps: number;
  explainWhy: string;
  instructions: string;
  explainEli5: string;
  animationUrl: string | null;
  muscleGroup: string;
  suggestedKg: number;
  weightReasoning: string;
}

export default function Today() {
  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [focus, setFocus] = useState("");
  const [isRest, setIsRest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [noPlan, setNoPlan] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [warmups, setWarmups] = useState<WarmUpExercise[]>([]);
  const [cooldowns, setCooldowns] = useState<CoolDownExercise[]>([]);
  const [showWarmup, setShowWarmup] = useState(true);
  const [showCooldown, setShowCooldown] = useState(false);

  useEffect(() => { loadToday(); }, []);

  const loadToday = async () => {
    const { data: { session: __s } } = await supabase.auth.getSession(); const user = __s?.user; if (!user) return;
    if (!user) return;

    const day = new Date().getDay() === 0 ? 7 : new Date().getDay();
    const { data: planData } = await supabase.from("workout_plans").select("*")
      .eq("user_id", user.id).eq("day", day).order("created_at", { ascending: false }).limit(1).single();
    const plan = planData as any;

    if (!plan) { setNoPlan(true); setLoading(false); return; }

    setFocus(plan.focus);
    setIsRest(plan.is_rest_day);

    if (!plan.is_rest_day) {
      // Generate warmup/cooldown
      setWarmups(generateWarmup(plan.focus));
      setCooldowns(generateCooldown(plan.focus));

      // Fetch profile for weight suggestions
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      const profile = profileData as any;

      const { data: planExercisesData } = await supabase
        .from("workout_plan_exercises")
        .select("*, exercises(*)")
        .eq("workout_plan_id", plan.id)
        .order("order");

      const exList: ExerciseData[] = [];
      for (const pe of ((planExercisesData as any[]) || [])) {
        const ex = pe.exercises;
        // Get last logged weight for this exercise
        let lastWeight: number | undefined;
        const { data: lastSet } = await supabase.from("set_logs").select("weight_kg")
          .eq("exercise_id", pe.exercise_id).order("workout_log_id", { ascending: false }).limit(1).single();
        if (lastSet) lastWeight = (lastSet as any).weight_kg;

        const suggestion = profile ? suggestWeight({
          bodyWeightKg: profile.weight_kg,
          sex: profile.sex,
          trainingHistory: profile.training_history,
          muscleGroup: ex?.muscle_group || "chest",
          lastLoggedWeight: lastWeight,
        }) : { suggestedKg: 0, reasoning: "" };

        exList.push({
          exerciseId: pe.exercise_id,
          exerciseName: ex?.name ?? "Unknown",
          targetSets: pe.target_sets,
          targetReps: pe.target_reps,
          explainWhy: pe.explain_why ?? "",
          instructions: ex?.instructions ?? "",
          explainEli5: ex?.explain_eli5 ?? "",
          animationUrl: ex?.animation_url ?? null,
          muscleGroup: ex?.muscle_group ?? "",
          suggestedKg: suggestion.suggestedKg,
          weightReasoning: suggestion.reasoning,
        });
      }
      setExercises(exList);
    }
    setLoading(false);
  };

  const handleGeneratePlan = async () => {
    setGenerating(true);
    const { data: { session: __s } } = await supabase.auth.getSession(); const user = __s?.user; if (!user) return;
    if (!user) return;

    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    const profile = profileData as any;
    if (!profile) { setGenerating(false); return; }

    const { data: exercisesData } = await supabase.from("exercises").select("*");
    const exerciseLibrary = ((exercisesData as any[]) || []).map((e: any) => ({
      id: e.id, name: e.name, muscle_group: e.muscle_group,
      equipment: e.equipment || [], difficulty: e.difficulty,
      instructions: e.instructions, explain_eli5: e.explain_eli5,
      default_sets: e.default_sets, default_reps: e.default_reps,
      default_rest_seconds: e.default_rest_seconds,
      animation_url: e.animation_url || null, secondary_muscles: e.secondary_muscles || [],
    })) as Exercise[];

    const plan = generateWorkoutPlan({
      daysPerWeek: profile.days_per_week, equipment: profile.equipment,
      trainingHistory: profile.training_history, goal: profile.goal, exerciseLibrary,
    });

    await supabase.from("workout_plans").delete().eq("user_id", user.id);
    for (const day of plan) {
      const { data: planRow } = await supabase.from("workout_plans")
        .insert({ user_id: user.id, week: 1, day: day.day, focus: day.focus, is_rest_day: day.isRestDay } as any)
        .select().single();
      if (planRow && day.exercises.length > 0) {
        await supabase.from("workout_plan_exercises").insert(
          day.exercises.map((ex, idx) => ({
            workout_plan_id: (planRow as any).id, exercise_id: ex.exerciseId,
            order: idx + 1, target_sets: ex.targetSets, target_reps: ex.targetReps,
            target_rpe: ex.targetRpe, rest_seconds: ex.restSeconds, explain_why: ex.explainWhy,
          })) as any
        );
      }
    }
    setGenerating(false); setNoPlan(false); loadToday();
  };

  // Get daily tip
  const tipIndex = Math.floor(Date.now() / 86400000) % EDUCATIONAL_TIPS.length;
  const dailyTip = EDUCATIONAL_TIPS[tipIndex];

  if (loading) return <main className="flex items-center justify-center min-h-screen"><div className="text-gray-400 text-lg">Loading...</div></main>;

  if (noPlan) return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6">
      <span className="text-5xl mb-4">{"\uD83D\uDCAA"}</span>
      <h1 className="text-white text-3xl font-bold mb-4">Welcome to Revive</h1>
      <p className="text-gray-400 text-lg text-center mb-8">Your personalized workout plan hasn&apos;t been generated yet.</p>
      <button onClick={handleGeneratePlan} disabled={generating}
        className="bg-[#0090ff] hover:bg-[#0070dd] disabled:bg-gray-800 text-white rounded-2xl px-8 py-4 text-lg font-semibold transition-colors">
        {generating ? "Generating..." : "Generate My Plan"}
      </button>
    </main>
  );

  if (isRest) return (
    <main className="max-w-lg mx-auto px-6 pt-16 pb-32">
      <div className="flex flex-col items-center justify-center py-20">
        <span className="text-5xl mb-4">{"\uD83D\uDE0C"}</span>
        <h1 className="text-white text-3xl font-bold mb-2">Rest Day</h1>
        <p className="text-gray-400 text-lg text-center mb-8">Recovery is where the gains happen.</p>
      </div>
      {dailyTip && (
        <div className="bg-gray-900 rounded-2xl p-5">
          <p className="text-[#0090ff] text-xs uppercase font-semibold mb-2">{"\uD83D\uDCA1"} {dailyTip.category}</p>
          <h3 className="text-white text-lg font-bold mb-2">{dailyTip.title}</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{dailyTip.body}</p>
        </div>
      )}
    </main>
  );

  const warmupDuration = Math.ceil(getWarmupDuration(warmups) / 60);
  const cooldownDuration = Math.ceil(getCooldownDuration(cooldowns) / 60);

  return (
    <main className="max-w-lg mx-auto px-6 pt-16 pb-32">
      <p className="text-gray-400 text-base mb-1">Today&apos;s Workout</p>
      <h1 className="text-white text-3xl font-bold mb-6">{focus}</h1>

      {/* Warm-up Section */}
      <div className="mb-6">
        <button onClick={() => setShowWarmup(!showWarmup)}
          className="w-full flex justify-between items-center bg-green-900/30 border border-green-800 rounded-2xl p-4 mb-2">
          <div>
            <p className="text-green-400 text-sm font-semibold">{"\uD83D\uDD25"} Warm Up</p>
            <p className="text-gray-400 text-xs">{warmupDuration} min — {warmups.length} exercises</p>
          </div>
          <span className="text-gray-500">{showWarmup ? "\u25B2" : "\u25BC"}</span>
        </button>
        {showWarmup && (
          <div className="space-y-2">
            {warmups.map((w, i) => (
              <div key={i} className="bg-gray-900 rounded-xl p-4 flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold">{w.name}</p>
                  <p className="text-gray-500 text-xs mt-1">{w.instructions}</p>
                </div>
                <span className="text-[#0090ff] text-xs ml-3 whitespace-nowrap">
                  {w.duration_seconds >= 60 ? `${Math.round(w.duration_seconds / 60)}m` : `${w.duration_seconds}s`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exercises */}
      <div className="space-y-3 mb-6">
        {exercises.map((ex, i) => (
          <div key={i} className="bg-gray-900 rounded-2xl overflow-hidden">
            <button onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
              className="w-full p-5 text-left flex justify-between items-center">
              <div className="flex-1">
                <h3 className="text-white text-lg font-semibold mb-1">{ex.exerciseName}</h3>
                <p className="text-[#0090ff] text-sm">{ex.targetSets} sets × {ex.targetReps} reps</p>
              </div>
              <span className="text-gray-500 text-lg ml-3">{expandedIdx === i ? "\u25B2" : "\u25BC"}</span>
            </button>

            {expandedIdx !== i && (
              <p className="px-5 pb-3 text-gray-600 text-xs">Tap for details & weight suggestion</p>
            )}

            {expandedIdx === i && (
              <div className="px-5 pb-5 border-t border-gray-800 pt-4 space-y-4">
                {/* Animation */}
                {ex.animationUrl && (
                  <div className="flex justify-center">
                    <img src={ex.animationUrl} alt={ex.exerciseName} className="w-48 h-48 rounded-xl object-contain bg-gray-800" />
                  </div>
                )}

                {/* Suggested Weight */}
                {ex.suggestedKg > 0 && (
                  <div className="bg-gray-800 rounded-xl p-4">
                    <p className="text-[#0090ff] text-xs font-semibold mb-1">Suggested Weight</p>
                    <p className="text-white text-2xl font-bold">{ex.suggestedKg} kg</p>
                    <p className="text-gray-500 text-xs mt-1">{ex.weightReasoning}</p>
                  </div>
                )}

                {/* Muscle Group */}
                <div>
                  <p className="text-gray-500 text-xs uppercase mb-1">Target Muscle</p>
                  <p className="text-gray-300 text-sm capitalize">{ex.muscleGroup.replace("_", " ")}</p>
                </div>

                {/* Why */}
                <div>
                  <p className="text-gray-500 text-xs uppercase mb-1">Why This Exercise</p>
                  <p className="text-gray-300 text-sm">{ex.explainWhy}</p>
                </div>

                {/* ELI5 */}
                {ex.explainEli5 && (
                  <div>
                    <p className="text-gray-500 text-xs uppercase mb-1">Simply Put</p>
                    <p className="text-gray-300 text-sm">{ex.explainEli5}</p>
                  </div>
                )}

                {/* Instructions */}
                {ex.instructions && (
                  <div>
                    <p className="text-gray-500 text-xs uppercase mb-1">How To Do It</p>
                    <p className="text-gray-300 text-sm leading-relaxed">{ex.instructions}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cool-down Section */}
      <div className="mb-6">
        <button onClick={() => setShowCooldown(!showCooldown)}
          className="w-full flex justify-between items-center bg-blue-900/30 border border-blue-800 rounded-2xl p-4 mb-2">
          <div>
            <p className="text-blue-400 text-sm font-semibold">{"\uD83E\uDDCA"} Cool Down</p>
            <p className="text-gray-400 text-xs">{cooldownDuration} min — {cooldowns.length} stretches</p>
          </div>
          <span className="text-gray-500">{showCooldown ? "\u25B2" : "\u25BC"}</span>
        </button>
        {showCooldown && (
          <div className="space-y-2">
            {cooldowns.map((c, i) => (
              <div key={i} className="bg-gray-900 rounded-xl p-4 flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold">{c.name}</p>
                  <p className="text-gray-500 text-xs mt-1">{c.instructions}</p>
                  <p className="text-gray-600 text-xs mt-1">Targets: {c.target_muscles.join(", ")}</p>
                </div>
                <span className="text-blue-400 text-xs ml-3 whitespace-nowrap">Hold {c.hold_seconds}s</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Tip */}
      {dailyTip && (
        <div className="bg-gray-900/50 rounded-2xl p-4">
          <p className="text-[#0090ff] text-xs uppercase font-semibold mb-1">{"\uD83D\uDCA1"} Tip: {dailyTip.category}</p>
          <p className="text-gray-400 text-sm">{dailyTip.body}</p>
        </div>
      )}
    </main>
  );
}
