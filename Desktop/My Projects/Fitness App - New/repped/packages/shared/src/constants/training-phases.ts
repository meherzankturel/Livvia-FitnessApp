// ─── NASM OPT Model-Aligned Training Phases ──────────────────────────────────
//
// Every certification (NASM, NSCA, ACE, ISSA) agrees: beginners must build
// stability and learn movement patterns BEFORE heavy compound loading.
//
// Phase flow for beginners: stabilization → strength_endurance → hypertrophy
// Intermediate/advanced start at: hypertrophy (with periodic strength blocks)

export type TrainingPhase =
  | "stabilization"      // NASM Phase 1: endurance, stability, form learning
  | "strength_endurance" // NASM Phase 2: bridge to loaded training
  | "hypertrophy"        // NASM Phase 3: muscle growth (default for intermediate+)
  | "strength"           // NASM Phase 4: max force production
  | "power";             // NASM Phase 5: force + velocity

export interface PhaseConfig {
  name: string;
  description: string;
  durationWeeks: number;
  nextPhase: TrainingPhase | null;
  volume: {
    setsMultiplier: number;
    repsMin: number;
    repsMax: number;
    rpeMax: number;
    restSecondsCompound: number;
    restSecondsIsolation: number;
  };
  tempo: string; // eccentric/isometric/concentric
  exerciseRules: {
    preferMachines: boolean;
    allowHeavyCompounds: boolean;
    maxExercisesPerSession: number;
  };
}

export const TRAINING_PHASES: Record<TrainingPhase, PhaseConfig> = {
  stabilization: {
    name: "Foundation",
    description: "Building stability, endurance, and proper movement patterns",
    durationWeeks: 4,
    nextPhase: "strength_endurance",
    volume: {
      setsMultiplier: 0.85,
      repsMin: 12,
      repsMax: 20,
      rpeMax: 6.5,
      restSecondsCompound: 60,
      restSecondsIsolation: 45,
    },
    tempo: "4/2/1",
    exerciseRules: {
      preferMachines: true,
      allowHeavyCompounds: false,
      maxExercisesPerSession: 5,
    },
  },
  strength_endurance: {
    name: "Building Strength",
    description: "Increasing work capacity with moderate loads",
    durationWeeks: 4,
    nextPhase: "hypertrophy",
    volume: {
      setsMultiplier: 0.9,
      repsMin: 8,
      repsMax: 12,
      rpeMax: 7,
      restSecondsCompound: 75,
      restSecondsIsolation: 60,
    },
    tempo: "2/0/2",
    exerciseRules: {
      preferMachines: false,
      allowHeavyCompounds: true,
      maxExercisesPerSession: 6,
    },
  },
  hypertrophy: {
    name: "Growth Phase",
    description: "Maximizing muscle development with optimal volume",
    durationWeeks: 4,
    nextPhase: "strength",
    volume: {
      setsMultiplier: 1.0,
      repsMin: 6,
      repsMax: 12,
      rpeMax: 8.5,
      restSecondsCompound: 60,
      restSecondsIsolation: 45,
    },
    tempo: "2/0/2",
    exerciseRules: {
      preferMachines: false,
      allowHeavyCompounds: true,
      maxExercisesPerSession: 7,
    },
  },
  strength: {
    name: "Strength Phase",
    description: "Building maximal force production",
    durationWeeks: 4,
    nextPhase: "hypertrophy",
    volume: {
      setsMultiplier: 1.0,
      repsMin: 1,
      // NASM Essentials Ch. 14: Phase 4 Maximal Strength uses 1-5 reps at 85-100% 1RM.
      // (Previously 6 — corrected to align with NASM published spec.)
      repsMax: 5,
      rpeMax: 9,
      restSecondsCompound: 240,
      restSecondsIsolation: 120,
    },
    tempo: "X/X/X",
    exerciseRules: {
      preferMachines: false,
      allowHeavyCompounds: true,
      maxExercisesPerSession: 5,
    },
  },
  power: {
    name: "Power Phase",
    description: "Combining force with velocity for explosive performance",
    durationWeeks: 4,
    nextPhase: "hypertrophy",
    volume: {
      setsMultiplier: 0.9,
      repsMin: 3,
      repsMax: 5,
      rpeMax: 9,
      restSecondsCompound: 240,
      restSecondsIsolation: 120,
    },
    tempo: "X/X/X",
    exerciseRules: {
      preferMachines: false,
      allowHeavyCompounds: true,
      maxExercisesPerSession: 5,
    },
  },
};

/** Get the initial training phase based on experience level */
export function getInitialPhase(trainingHistory: string): TrainingPhase {
  if (trainingHistory === "beginner") return "stabilization";
  return "hypertrophy";
}

/**
 * Highest phase a beginner can auto-advance into.
 *
 * NASM Essentials Ch. 14 explicitly reserves Phase 4 (Maximal Strength) and
 * Phase 5 (Power) for intermediate and advanced clients. A user with
 * training_history='beginner' should cycle within Phases 1-3. They become
 * eligible for Phases 4/5 only after upgrading their training_history.
 */
export const BEGINNER_TERMINAL_PHASE: TrainingPhase = "hypertrophy";

/**
 * Get the next phase for a user given their training history.
 *
 * Beginners cap at BEGINNER_TERMINAL_PHASE. Intermediate/advanced lifters
 * follow the standard nextPhase chain (which already oscillates
 * hypertrophy ↔ strength for block periodization).
 */
export function getNextPhaseForUser(
  currentPhase: TrainingPhase,
  trainingHistory: string
): TrainingPhase | null {
  const config = TRAINING_PHASES[currentPhase];
  const next = config.nextPhase;
  if (!next) return null;

  // Beginner cap: never auto-advance past BEGINNER_TERMINAL_PHASE.
  if (trainingHistory === "beginner") {
    // Walk forward; if next would exceed the cap, stay where we are.
    if (next === "strength" || next === "power") {
      return currentPhase === BEGINNER_TERMINAL_PHASE ? null : BEGINNER_TERMINAL_PHASE;
    }
  }

  return next;
}

export interface PhaseProgressCheckInput {
  currentPhase: TrainingPhase;
  /** When the user entered the current phase (date or ISO string) */
  phaseStartedAt: Date | string;
  /** Completed (non-skipped, non-orphaned) sessions logged since phaseStartedAt */
  completedSessionsInPhase: number;
  daysPerWeek: number;
  trainingHistory: string;
  /** Optional override for "now" — used in tests */
  now?: Date;
}

export interface PhaseProgressCheckResult {
  advance: boolean;
  newPhase: TrainingPhase | null;
  reason: string;
  weeksElapsed: number;
}

/**
 * Determine whether a user should advance to the next NASM OPT phase.
 *
 * NASM Essentials of Personal Fitness Training, 6th ed., Ch. 14 specifies:
 *   - Phase duration: ~4 weeks
 *   - Advancement requires: demonstrated movement competency via in-person
 *     trainer reassessment
 *
 * Because an app cannot perform in-person movement assessment, this function
 * uses NASM's time criterion plus the minimum proxy for "the user actually
 * trained": at least one completed session in the phase. A user who logs zero
 * workouts during their 4-week phase has not received any training stimulus
 * and cannot advance, regardless of calendar time passed.
 */
export function shouldProgressPhase(
  input: PhaseProgressCheckInput
): PhaseProgressCheckResult {
  const {
    currentPhase,
    phaseStartedAt,
    completedSessionsInPhase,
    trainingHistory,
    now = new Date(),
  } = input;

  const config = TRAINING_PHASES[currentPhase];
  const startDate = typeof phaseStartedAt === "string"
    ? new Date(phaseStartedAt)
    : phaseStartedAt;

  const msInWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksElapsed = Math.max(0, (now.getTime() - startDate.getTime()) / msInWeek);

  // NASM time criterion
  if (weeksElapsed < config.durationWeeks) {
    return {
      advance: false,
      newPhase: null,
      reason: `Only ${weeksElapsed.toFixed(1)} of ${config.durationWeeks} weeks elapsed in current phase.`,
      weeksElapsed,
    };
  }

  // Minimum engagement (proxy for "user actually trained")
  if (completedSessionsInPhase < 1) {
    return {
      advance: false,
      newPhase: null,
      reason: `No completed sessions logged in this phase. Training stimulus required for advancement (NASM Essentials Ch. 14).`,
      weeksElapsed,
    };
  }

  const newPhase = getNextPhaseForUser(currentPhase, trainingHistory);
  if (!newPhase) {
    return {
      advance: false,
      newPhase: null,
      reason: trainingHistory === "beginner"
        ? `Beginner cap reached at ${currentPhase}. Upgrade training_history to progress further.`
        : `No next phase defined for ${currentPhase}.`,
      weeksElapsed,
    };
  }

  return {
    advance: true,
    newPhase,
    reason: `Completed ${completedSessionsInPhase} sessions over ${weeksElapsed.toFixed(1)} weeks — advancing to ${newPhase}.`,
    weeksElapsed,
  };
}

export interface PhasesToAdvanceInput {
  currentPhase: TrainingPhase;
  phaseStartedAt: Date | string;
  completedSessionsSincePhaseStart: number;
  daysPerWeek: number;
  trainingHistory: string;
  now?: Date;
}

export interface PhasesToAdvanceResult {
  /** Final phase the user should land on (current if no advancement) */
  finalPhase: TrainingPhase;
  /** The new phase_start_date to write (current if no advancement) */
  newPhaseStartedAt: Date;
  /** Each phase transition that happened, in order */
  transitions: Array<{
    from: TrainingPhase;
    to: TrainingPhase;
    weeksInPhase: number;
    sessionsConsumed: number;
  }>;
}

/**
 * Resolve multi-phase advancement for stale users.
 *
 * A user who hasn't opened the app for 6 months and was sitting in
 * stabilization may need to advance through Phase 1 → 2 → 3 in one go.
 * This function walks the chain, consuming weeks and sessions at each step,
 * stopping when either criterion fails or the beginner terminal phase is hit.
 *
 * Each advancement requires (per NASM Essentials Ch. 14):
 *   - durationWeeks of elapsed time
 *   - At least 1 completed session (the in-app proxy for "user trained";
 *     NASM canonically requires in-person trainer reassessment which we
 *     cannot replicate)
 *
 * Each consumed phase takes:
 *   - durationWeeks of elapsed time (phaseStartedAt += durationWeeks)
 *   - 1 session minimum from the remaining pool
 */
export function getPhasesToAdvance(
  input: PhasesToAdvanceInput
): PhasesToAdvanceResult {
  const {
    currentPhase,
    phaseStartedAt,
    completedSessionsSincePhaseStart,
    trainingHistory,
    now = new Date(),
  } = input;

  const startDate = typeof phaseStartedAt === "string"
    ? new Date(phaseStartedAt)
    : new Date(phaseStartedAt.getTime());

  const transitions: PhasesToAdvanceResult["transitions"] = [];
  let cursorPhase: TrainingPhase = currentPhase;
  let cursorStart = startDate;
  let sessionsRemaining = completedSessionsSincePhaseStart;

  // Loop guard: NASM has 5 phases; any single advancement run cannot exceed
  // a handful of transitions even for very stale users.
  for (let i = 0; i < 5; i++) {
    const config = TRAINING_PHASES[cursorPhase];
    const msInWeek = 7 * 24 * 60 * 60 * 1000;
    const weeksElapsed = Math.max(0, (now.getTime() - cursorStart.getTime()) / msInWeek);

    if (weeksElapsed < config.durationWeeks) break;
    if (sessionsRemaining < 1) break; // Minimum engagement gate

    const next = getNextPhaseForUser(cursorPhase, trainingHistory);
    if (!next) break;

    transitions.push({
      from: cursorPhase,
      to: next,
      weeksInPhase: weeksElapsed,
      sessionsConsumed: 1,
    });

    cursorPhase = next;
    cursorStart = new Date(cursorStart.getTime() + config.durationWeeks * msInWeek);
    sessionsRemaining = Math.max(0, sessionsRemaining - 1);
  }

  return {
    finalPhase: cursorPhase,
    newPhaseStartedAt: cursorStart,
    transitions,
  };
}
