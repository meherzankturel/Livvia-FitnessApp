/**
 * Plan regeneration helper.
 *
 * Centralizes the workout-plan-write flow used by:
 *   - apps/mobile/app/(app)/index.tsx auto-gen on first login
 *   - apps/mobile/app/(app)/generate-plan.tsx user-triggered regeneration
 *   - apps/mobile/src/lib/phase-progression.ts auto-regen on phase advance
 *
 * Preserves workout_logs history by detaching them from old plans before
 * deletion (so the user's training journey survives a regen).
 */

import { generateWorkoutPlan, CURRENT_PLAN_VERSION, calcAge, type TrainingPhase, type WorkoutDay } from "@repped/shared";
import type { Exercise } from "@repped/shared";
import { supabase } from "./supabase";

export interface RegeneratePlanResult {
  success: boolean;
  daysWritten: number;
  error?: string;
}

/**
 * Regenerate a user's weekly workout plan based on their current profile.
 *
 * @param userId — the auth user's id (also the profiles.id)
 * @param overrideTrainingPhase — optional phase override; defaults to profile.training_phase
 */
export async function regenerateWorkoutPlan(
  userId: string,
  overrideTrainingPhase?: TrainingPhase
): Promise<RegeneratePlanResult> {
  // 1. Load profile
  const { data: profile, error: profileErr } = await (supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single() as any);

  if (profileErr || !profile) {
    return { success: false, daysWritten: 0, error: profileErr?.message ?? "Profile not found" };
  }

  // 2. Load exercise library
  const { data: exercises } = await (supabase.from("exercises").select("*") as any);
  if (!exercises || exercises.length === 0) {
    return { success: false, daysWritten: 0, error: "Exercise library empty" };
  }

  const exerciseLibrary: Exercise[] = (exercises as any[]).map((e: any) => ({
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

  // 3. Generate fresh plan
  const phase = overrideTrainingPhase
    ?? (profile.training_phase as TrainingPhase | undefined)
    ?? (profile.training_history === "beginner" ? "stabilization" : "hypertrophy");

  const plan: WorkoutDay[] = generateWorkoutPlan({
    daysPerWeek: profile.days_per_week,
    equipment: profile.equipment as any,
    trainingHistory: profile.training_history as any,
    goal: profile.goal as any,
    exerciseLibrary,
    injuries: (profile.current_injuries || []) as any[],
    age: calcAge(profile.date_of_birth),
    sex: profile.sex as any,
    bodyWeightKg: profile.weight_kg,
    trainingPhase: phase,
  });

  // 4. Detach workout_logs from old plans (preserve history)
  const { data: oldPlans } = await (supabase
    .from("workout_plans")
    .select("id")
    .eq("user_id", userId) as any);

  if (oldPlans && (oldPlans as any[]).length > 0) {
    const oldPlanIds = (oldPlans as any[]).map((p: any) => p.id);
    await ((supabase.from("workout_logs") as any)
      .update({ workout_plan_id: null })
      .in("workout_plan_id", oldPlanIds));
  }

  // 5. Delete old plans (workout_plan_exercises cascades)
  await (supabase.from("workout_plans").delete().eq("user_id", userId) as any);

  // 6. Insert new plans
  let daysWritten = 0;
  for (const day of plan) {
    const isConditioning = day.kind === "conditioning";
    const { data: planRow, error: planErr } = await (supabase
      .from("workout_plans")
      .insert({
        user_id: userId,
        week: 1,
        day: day.day,
        focus: day.focus,
        is_rest_day: day.isRestDay,
        plan_version: CURRENT_PLAN_VERSION,
        kind: isConditioning ? "conditioning" : "strength",
        conditioning_template_name: isConditioning ? day.conditioningTemplateName ?? null : null,
      } as any)
      .select()
      .single() as any);

    if (planErr || !planRow) {
      // Continue; partial plan is better than no plan
      console.warn("regenerate-plan: failed to insert day", day.day, planErr?.message);
      continue;
    }
    daysWritten++;

    if (day.exercises.length > 0) {
      const exerciseRows = day.exercises.map((ex, idx) => ({
        workout_plan_id: (planRow as any).id,
        exercise_id: ex.exerciseId,
        order: idx + 1,
        target_sets: ex.targetSets,
        target_reps: ex.targetReps,
        target_rpe: ex.targetRpe,
        rest_seconds: ex.restSeconds,
        explain_why: ex.explainWhy,
      }));
      const { error: exErr } = await (supabase
        .from("workout_plan_exercises")
        .insert(exerciseRows as any) as any);
      if (exErr) {
        console.warn("regenerate-plan: failed to insert exercises for day", day.day, exErr.message);
      }
    }
  }

  if (daysWritten === 0) {
    return { success: false, daysWritten: 0, error: "Failed to write any plan days" };
  }

  return { success: true, daysWritten };
}
