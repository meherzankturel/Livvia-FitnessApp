import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { useAuthStore, generateWorkoutPlan } from "@repped/shared";
import type { Exercise } from "@repped/shared";
import { supabase } from "../../src/lib/supabase";
import tw from "../../src/lib/tw";

export default function GeneratePlan() {
  const session = useAuthStore((s) => s.session);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    setError(null);

    try {
      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError || !profile) {
        setError("Profile not found. Please complete onboarding.");
        setLoading(false);
        return;
      }

      // Fetch exercise library
      const { data: exercises, error: exError } = await supabase
        .from("exercises")
        .select("*");

      if (exError || !exercises || exercises.length === 0) {
        setError("Exercise library is empty. Please seed the database with exercises first.");
        setLoading(false);
        return;
      }

      // Map to Exercise type
      const exerciseLibrary: Exercise[] = exercises.map((e: any) => ({
        id: e.id,
        name: e.name,
        muscle_group: e.muscle_group,
        equipment: e.equipment || [],
        difficulty: e.difficulty,
        instructions: e.instructions,
        explain_eli5: e.explain_eli5,
        default_sets: e.default_sets,
        default_reps: e.default_reps,
        default_rest_seconds: e.default_rest_seconds,
        secondary_muscles: e.secondary_muscles || [],
      }));

      // Get user injuries
      const injuries = (profile.current_injuries || []) as any[];

      // Generate plan — passes demographics for personalized programming
      const plan = generateWorkoutPlan({
        daysPerWeek: profile.days_per_week,
        equipment: profile.equipment as any,
        trainingHistory: profile.training_history as any,
        goal: profile.goal as any,
        exerciseLibrary,
        injuries,
        age: profile.age,
        sex: profile.sex as any,
        bodyWeightKg: profile.weight_kg,
        trainingPhase: profile.training_phase ?? (profile.training_history === "beginner" ? "stabilization" : "hypertrophy"),
      });

      // Detach workout logs from old plans so progress history is preserved.
      const { data: oldPlans } = await supabase
        .from("workout_plans")
        .select("id")
        .eq("user_id", session.user.id);
      if (oldPlans && oldPlans.length > 0) {
        const oldPlanIds = oldPlans.map((p: any) => p.id);
        await supabase
          .from("workout_logs")
          .update({ workout_plan_id: null })
          .in("workout_plan_id", oldPlanIds);
      }

      // Now safe to delete old plans (workout_plan_exercises has ON DELETE CASCADE)
      await supabase
        .from("workout_plans")
        .delete()
        .eq("user_id", session.user.id);

      // Save new plan to Supabase
      let savedDays = 0;
      for (const day of plan) {
        const { data: planRow, error: planError } = await supabase
          .from("workout_plans")
          .insert({
            user_id: session.user.id,
            week: 1,
            day: day.day,
            focus: day.focus,
            is_rest_day: day.isRestDay,
          })
          .select()
          .single();

        if (planError || !planRow) {
          console.error("Failed to save workout day:", planError?.message);
          continue;
        }
        savedDays++;

        if (day.exercises.length > 0) {
          const exerciseRows = day.exercises.map((ex, idx) => ({
            workout_plan_id: planRow.id,
            exercise_id: ex.exerciseId,
            order: idx + 1,
            target_sets: ex.targetSets,
            target_reps: ex.targetReps,
            target_rpe: ex.targetRpe,
            rest_seconds: ex.restSeconds,
            explain_why: ex.explainWhy,
          }));

          const { error: exInsertError } = await supabase.from("workout_plan_exercises").insert(exerciseRows);
          if (exInsertError) console.error("Failed to save exercises:", exInsertError.message);
        }
      }

      if (savedDays === 0) {
        setError("Failed to save workout plan. Please try again.");
        setLoading(false);
        return;
      }

      setLoading(false);
      router.replace("/(app)");
    } catch (err: any) {
      console.error("Plan generation error:", err);
      setError(err?.message || "Something went wrong generating your plan.");
      setLoading(false);
    }
  };

  return (
    <View style={tw`flex-1 bg-white justify-center items-center px-6`}>
      <Text style={tw`text-4xl mb-4`}>💪</Text>
      <Text style={tw`text-gray-900 text-3xl font-bold mb-2 text-center`}>
        Ready to Build Your Plan?
      </Text>
      <Text style={tw`text-gray-400 text-lg text-center mb-10`}>
        We'll create a personalized workout program based on your goals, equipment, and experience.
      </Text>

      {error && (
        <Text style={tw`text-red-400 text-center mb-4`}>{error}</Text>
      )}

      <Pressable
        onPress={handleGenerate}
        disabled={loading}
        style={tw.style(tw`w-full rounded-2xl py-5 items-center`, loading ? tw`bg-gray-800` : tw`bg-[#6366F1]`)}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={tw`text-white text-xl font-bold`}>Generate My Plan</Text>
        )}
      </Pressable>
    </View>
  );
}
