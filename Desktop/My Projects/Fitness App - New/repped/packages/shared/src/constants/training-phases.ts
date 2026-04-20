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
      restSecondsCompound: 150,
      restSecondsIsolation: 90,
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
      repsMax: 6,
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

/** Check if a phase should progress to the next one */
export function shouldProgressPhase(
  currentPhase: TrainingPhase,
  weeksInPhase: number
): boolean {
  const config = TRAINING_PHASES[currentPhase];
  return weeksInPhase >= config.durationWeeks;
}
