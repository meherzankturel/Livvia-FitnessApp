/**
 * NASM OPT phase auto-advancement.
 *
 * Runs on home-screen load. Checks whether the user has earned advancement
 * to the next NASM phase per NASM Essentials of Personal Fitness Training,
 * 6th ed., Ch. 14:
 *   1. weeksElapsed >= phase.durationWeeks (~4 wk/phase)
 *   2. >=1 completed session in the phase (in-app proxy for "user trained";
 *      NASM canonically requires in-person trainer reassessment of movement
 *      competency, which an app cannot perform)
 *
 * On advance: writes new phase + phase_start_date to profiles, logs an audit
 * row in phase_advancements, and triggers plan regeneration so the user opens
 * their next workout already aligned with the new phase's rules.
 *
 * Multi-phase catch-up: a stale beginner who has logged at least one workout
 * advances through Phase 1 → 2 → 3 in one app open. Beginner cap
 * (BEGINNER_TERMINAL_PHASE) prevents progression into Maximal Strength /
 * Power, which NASM reserves for intermediate/advanced clients.
 *
 * Zero engagement: if weeks elapsed but no sessions logged, the phase clock
 * resets to today. The user re-starts the 4-week window when they begin
 * training again.
 */

import {
  getPhasesToAdvance,
  TRAINING_PHASES,
  type TrainingPhase,
} from "@repped/shared";
import { supabase } from "./supabase";
import { regenerateWorkoutPlan } from "./regenerate-plan";

export interface PhaseAdvancementResult {
  /** Was the user's phase changed in this check? */
  advanced: boolean;
  /** Phase before this check */
  fromPhase: TrainingPhase | null;
  /** Phase after this check (same as fromPhase if not advanced) */
  toPhase: TrainingPhase | null;
  /** Number of phases skipped (0 if not advanced, ≥1 if advanced) */
  phasesSkipped: number;
  /** True if we reset phase_start_date due to failed adherence */
  adherenceResetApplied: boolean;
  /** Human-readable reason for telemetry/debugging */
  reason: string;
}

const NULL_RESULT: PhaseAdvancementResult = {
  advanced: false,
  fromPhase: null,
  toPhase: null,
  phasesSkipped: 0,
  adherenceResetApplied: false,
  reason: "No-op",
};

/**
 * Check whether the user should advance phases, and apply if so.
 * Idempotent: safe to call on every home-screen load.
 */
export async function checkAndAdvancePhase(
  userId: string
): Promise<PhaseAdvancementResult> {
  // 1. Load phase-relevant profile fields
  const { data: profile, error: profileErr } = await (supabase
    .from("profiles")
    .select("training_phase, phase_start_date, days_per_week, training_history")
    .eq("id", userId)
    .single() as any);

  if (profileErr || !profile) return NULL_RESULT;

  const currentPhase = (profile.training_phase ?? "stabilization") as TrainingPhase;
  const phaseStartedAt = profile.phase_start_date
    ? new Date(profile.phase_start_date)
    : new Date();
  const daysPerWeek = (profile.days_per_week ?? 3) as number;
  const trainingHistory = (profile.training_history ?? "beginner") as string;

  // 2. Quick gate: if we're still inside the phase's duration window, skip
  // the count query entirely (cheaper home-screen load most days).
  const msInWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksElapsed = (Date.now() - phaseStartedAt.getTime()) / msInWeek;
  const config = TRAINING_PHASES[currentPhase];
  if (weeksElapsed < config.durationWeeks) {
    return {
      ...NULL_RESULT,
      fromPhase: currentPhase,
      toPhase: currentPhase,
      reason: `Inside current phase (${weeksElapsed.toFixed(1)}/${config.durationWeeks} wks).`,
    };
  }

  // 3. Past the duration; count completed sessions since phase start.
  const { count: completedSinceCount } = await (supabase
    .from("workout_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("skipped", false)
    .not("completed_at", "is", null)
    .gte("started_at", phaseStartedAt.toISOString()) as any);

  const completedSessions = (completedSinceCount ?? 0) as number;

  // 4. Resolve multi-phase advancement.
  const result = getPhasesToAdvance({
    currentPhase,
    phaseStartedAt,
    completedSessionsSincePhaseStart: completedSessions,
    daysPerWeek,
    trainingHistory,
  });

  // 5a. No advancement → user didn't train in this phase. Reset clock so
  //     they get a fresh 4-week NASM window when they restart training.
  if (result.transitions.length === 0) {
    const today = new Date().toISOString().split("T")[0];
    await ((supabase.from("profiles") as any)
      .update({ phase_start_date: today })
      .eq("id", userId));

    return {
      advanced: false,
      fromPhase: currentPhase,
      toPhase: currentPhase,
      phasesSkipped: 0,
      adherenceResetApplied: true,
      reason: `Zero sessions logged in this phase. Clock reset to today per NASM Ch. 14 (reassessment required after inactivity).`,
    };
  }

  // 5b. Advancement happened — write new phase + audit log.
  const finalPhase = result.finalPhase;
  const newStartDate = result.newPhaseStartedAt.toISOString().split("T")[0];

  await ((supabase.from("profiles") as any)
    .update({
      training_phase: finalPhase,
      phase_start_date: newStartDate,
      phase_week: 1,
    })
    .eq("id", userId));

  // Audit log: one row per transition.
  for (const t of result.transitions) {
    await ((supabase.from("phase_advancements") as any)
      .insert({
        user_id: userId,
        from_phase: t.from,
        to_phase: t.to,
        weeks_in_previous_phase: Number(t.weeksInPhase.toFixed(2)),
        completed_sessions_in_phase: t.sessionsConsumed,
      }));
  }

  // 6. Plan regen so the next home load shows phase-appropriate exercises.
  await regenerateWorkoutPlan(userId, finalPhase);

  return {
    advanced: true,
    fromPhase: currentPhase,
    toPhase: finalPhase,
    phasesSkipped: result.transitions.length,
    adherenceResetApplied: false,
    reason: `Advanced ${result.transitions.length} phase(s): ${currentPhase} → ${finalPhase}.`,
  };
}
