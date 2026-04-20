import type { Exercise, MuscleGroup } from "../types/exercise";
import type { Equipment, TrainingHistory, Goal, Sex } from "../types/user";
import { shouldAvoidExercise, type UserInjury } from "../constants/injuries";
import { inferMovementPattern, type MovementPattern } from "../constants/movement-patterns";
import { type TrainingPhase, TRAINING_PHASES } from "../constants/training-phases";

export interface WorkoutDay {
  day: number;
  focus: string;
  isRestDay: boolean;
  exercises: PlannedExercise[];
}

export interface PlannedExercise {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  targetReps: number;
  targetRpe: number;
  restSeconds: number;
  explainWhy: string;
}

interface GeneratorInput {
  daysPerWeek: number;
  equipment: Equipment;
  trainingHistory: TrainingHistory;
  goal: Goal;
  exerciseLibrary: Exercise[];
  injuries?: { key: string; severity: "mild" | "moderate" | "severe" }[];
  // New: demographics for personalized programming
  age?: number;
  sex?: Sex;
  bodyWeightKg?: number;
  trainingPhase?: TrainingPhase;
}

// ─── Age Bracket ────────────────────────────────────────────────────────────────
//
// Age significantly affects exercise selection, rest periods, and intensity:
//
// TEEN (13-17): Growth plates still developing. Avoid max-effort lifts, heavy
//   axial loading (heavy back squats, deadlifts). Focus on form with moderate
//   weight. Machine/dumbbell preference over heavy barbells.
//
// YOUNG ADULT (18-35): Peak recovery and adaptation. Can handle aggressive
//   programming, heavy compounds, shorter rest.
//
// ADULT (36-49): Recovery starts slowing. Slightly longer rest, moderate
//   intensity works well. Still fully capable of all exercises.
//
// SENIOR (50+): Joint health priority. Prefer machines/cables (controlled
//   movement path), avoid heavy axial loading, longer rest mandatory.
//   Higher reps, lower intensity to protect joints while maintaining stimulus.
//

type AgeBracket = "teen" | "young_adult" | "adult" | "senior";

function getAgeBracket(age: number | undefined): AgeBracket {
  if (!age) return "young_adult"; // safe default
  if (age < 18) return "teen";
  if (age <= 35) return "young_adult";
  if (age <= 49) return "adult";
  return "senior";
}

// ─── Equipment Mapping ──────────────────────────────────────────────────────────

const EQUIPMENT_MAP: Record<Equipment, string[]> = {
  full_gym: ["barbell", "dumbbell", "cable", "machine", "bodyweight", "kettlebell", "band", "bench"],
  dumbbells_only: ["dumbbell", "bodyweight", "band", "bench"],
  home_gym: ["dumbbell", "bodyweight", "band", "bench", "kettlebell"],
  bodyweight: ["bodyweight", "band"],
};

// ─── Compound Detection ─────────────────────────────────────────────────────────

const COMPOUND_KEYWORDS = [
  "squat", "deadlift", "bench press", "overhead press", "military press",
  "row", "pull-up", "pullup", "chin-up", "chinup", "dip", "lunge",
  "hip thrust", "leg press", "clean", "snatch", "push-up", "pushup",
  "romanian", "rdl", "front squat", "goblet", "split squat",
];

const COMPOUND_PATTERNS = COMPOUND_KEYWORDS.map(
  (kw) => new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i")
);

function isCompound(exerciseName: string): boolean {
  return COMPOUND_PATTERNS.some((pattern) => pattern.test(exerciseName));
}

// ─── Exercises to avoid/prefer by demographic ───────────────────────────────────
//
// These are exercise NAME patterns that are unsafe or suboptimal for certain groups.
//

// Heavy axial loading exercises — avoid for teens (growth plates) and seniors (spine)
const HEAVY_AXIAL_PATTERNS = [
  /\bback squat\b/i, /\bbarbell squat\b/i, /\bdeadlift\b/i,
  /\bclean\b/i, /\bsnatch\b/i, /\bmilitary press\b/i,
  /\boverhead press\b/i, /\bbarbell row\b/i,
];

// Bodyweight exercises that require high strength-to-weight ratio
const HIGH_BW_RATIO_EXERCISES = [
  /\bpull-up\b/i, /\bpullup\b/i, /\bchin-up\b/i, /\bchinup\b/i,
  /\bdip\b/i, /\bmuscle.?up\b/i,
];

// Preferred exercises for each age bracket (patterns to boost in scoring)
const AGE_PREFERRED_PATTERNS: Record<AgeBracket, RegExp[]> = {
  teen: [
    /\bgoblet squat\b/i, /\bdumbbell\b/i, /\bmachine\b/i,
    /\bpush-up\b/i, /\bpushup\b/i, /\bband\b/i, /\bplank\b/i,
  ],
  young_adult: [], // no bias — full access
  adult: [
    /\bdumbbell\b/i, /\bcable\b/i, // slightly prefer controlled movements
  ],
  senior: [
    /\bmachine\b/i, /\bcable\b/i, /\bband\b/i, /\bseated\b/i,
    /\bgoblet\b/i, /\bleg press\b/i, /\bleg extension\b/i,
    /\bleg curl\b/i, /\blat pulldown\b/i,
  ],
};

// Exercises women benefit more from (glute/hip emphasis)
const FEMALE_PREFERRED_PATTERNS = [
  /\bhip thrust\b/i, /\bglute bridge\b/i, /\bromanian deadlift\b/i,
  /\brdl\b/i, /\bbulgarian split squat\b/i, /\blunge\b/i,
  /\bstep.?up\b/i, /\bcable kickback\b/i, /\bsumo\b/i,
];

// ─── Split & Focus Mapping ──────────────────────────────────────────────────────

// Muscle groups per focus — balanced to produce 4-7 exercises per session.
// Large muscles (chest, back, quads) get 2 exercises; small (biceps, triceps,
// calves, core) get 1. This is managed by getExercisesPerGroup().
const FOCUS_MUSCLE_MAP: Record<string, MuscleGroup[]> = {
  "Full Body A": ["chest", "back", "quads", "shoulders"],
  "Full Body B": ["back", "hamstrings", "glutes", "shoulders"],
  "Full Body C": ["chest", "quads", "hamstrings", "core"],
  "Upper": ["chest", "back", "shoulders", "biceps", "triceps"],
  "Lower": ["quads", "hamstrings", "glutes", "calves"],
  "Push": ["chest", "shoulders", "triceps"],
  "Pull": ["back", "biceps", "core"],
  "Legs": ["quads", "hamstrings", "glutes", "calves"],
};

const SPLIT_FOCUS: Record<string, string[]> = {
  full_body: ["Full Body A", "Full Body B", "Full Body C"],
  upper_lower: ["Upper", "Lower", "Upper", "Lower"],
  push_pull_legs: ["Push", "Pull", "Legs", "Push", "Pull", "Legs"],
};

function getSplitType(daysPerWeek: number): string {
  if (daysPerWeek <= 3) return "full_body";
  if (daysPerWeek === 4) return "upper_lower";
  return "push_pull_legs";
}

// ─── Day Order Optimization ─────────────────────────────────────────────────────

function optimizeDayOrder(focusList: string[], daysPerWeek: number): string[] {
  const optimized = [...focusList];
  for (let i = 0; i < optimized.length - 1; i++) {
    const current = optimized[i];
    const next = optimized[i + 1];
    const currentMuscles = FOCUS_MUSCLE_MAP[current] || [];
    const nextMuscles = FOCUS_MUSCLE_MAP[next] || [];

    const currentIsArmFocused =
      currentMuscles.includes("biceps") && currentMuscles.includes("triceps") &&
      !currentMuscles.includes("chest") && !currentMuscles.includes("back");
    const nextNeedsArms =
      nextMuscles.includes("chest") || nextMuscles.includes("back");

    if (currentIsArmFocused && nextNeedsArms && i + 2 < optimized.length) {
      [optimized[i + 1], optimized[i + 2]] = [optimized[i + 2], optimized[i + 1]];
    }
  }
  return optimized;
}

// ─── Volume Configuration ───────────────────────────────────────────────────────

interface ExerciseVolumeConfig {
  sets: number;
  reps: number;
  rpe: number;
  restSeconds: number;
}

interface PositionalVolume {
  compound: ExerciseVolumeConfig;
  mid: ExerciseVolumeConfig;
  isolation: ExerciseVolumeConfig;
}

// ─── Evidence-Based Volume Configuration ─────────────────────────────────────
//
// Sources:
//   Schoenfeld et al. (2017) — dose-response volume for hypertrophy
//   Schoenfeld et al. (2016) — longer rest = better strength + hypertrophy
//   Rhea et al. (2003) — sets by training status
//   Helms et al. (2014) — fat loss: maintain intensity, reduce volume
//   Helms et al. (2016) — RIR-based RPE for resistance training
//   Carroll et al. (2019) — 1-3 RIR optimal, failure unnecessary
//   Krieger (2010) — 2-3 sets > 1 set, diminishing returns past 4
//   Grgic et al. (2017) — rest interval meta-analysis
//
// Sets: B:2-3, I:3-4, A:3-4 per exercise (Krieger 2010)
// RPE:  B: compound 6-7 / iso 7-8 (Carroll 2019 — beginners avoid failure)
//       I: compound 7-8 / iso 8-9
//       A: compound 8-9 / iso 9-10
// Rest: Compounds need 90-180s for hypertrophy (Schoenfeld 2016)
//       Fat loss compounds: 60-90s (metabolic stress, Grgic 2017)
//       Isolation: 60-120s hypertrophy, 30-60s fat loss

function getPositionalVolume(
  history: TrainingHistory,
  goal: Goal,
  ageBracket: AgeBracket,
  sex: Sex | undefined
): PositionalVolume {
  // Sets per exercise by experience (Krieger 2010, Rhea 2003)
  const baseSets = { beginner: 3, intermediate: 3, advanced: 4 }[history];

  // ── Age adjustments ──
  const ageRestBonus = ageBracket === "senior" ? 30 : ageBracket === "teen" ? 15 : 0;
  const ageRpeReduction = ageBracket === "senior" ? 1.5 : ageBracket === "teen" ? 1 : 0;
  const ageRepBonus = ageBracket === "senior" ? 2 : ageBracket === "teen" ? 1 : 0;
  const ageSetsReduction = ageBracket === "senior" ? 1 : 0;

  // ── Sex adjustments ──
  // Women recover faster between sets (shorter rest OK)
  // Women respond well to moderate extra reps at moderate intensity
  const sexRestReduction = sex === "female" ? 10 : 0;
  const sexRepBonus = sex === "female" ? 1 : 0;

  function applyAdjustments(vol: ExerciseVolumeConfig): ExerciseVolumeConfig {
    return {
      sets: Math.max(2, vol.sets - ageSetsReduction),
      reps: vol.reps + ageRepBonus + sexRepBonus,
      rpe: Math.max(5, vol.rpe - ageRpeReduction),
      restSeconds: Math.max(30, vol.restSeconds + ageRestBonus - sexRestReduction),
    };
  }

  let base: PositionalVolume;

  if (goal === "lose_fat") {
    // Helms et al. (2014): maintain intensity, reduce volume ~1/3 from bulk.
    // Shorter rest for metabolic demand, but compounds still need adequate rest.
    base = {
      compound: {
        sets: baseSets,
        reps: history === "beginner" ? 10 : 8,
        rpe: history === "beginner" ? 6.5 : 7.5,
        restSeconds: 75, // 60-90s range (Grgic 2017)
      },
      mid: {
        sets: baseSets,
        reps: history === "beginner" ? 12 : 10,
        rpe: history === "beginner" ? 7 : 7.5,
        restSeconds: 60,
      },
      isolation: {
        sets: Math.max(2, baseSets - 1),
        reps: 12,
        rpe: history === "beginner" ? 7 : 8,
        restSeconds: 45, // 30-60s (Grgic 2017)
      },
    };
  } else if (goal === "build_muscle") {
    // Schoenfeld et al. (2017): 10+ sets/muscle/week, 6-12 reps
    // Schoenfeld et al. (2016): longer rest (2-3 min) = better hypertrophy
    base = {
      compound: {
        sets: baseSets,
        reps: history === "beginner" ? 10 : 8,
        rpe: history === "beginner" ? 6.5 : 7.5,
        restSeconds: 150, // 2.5 min — Schoenfeld (2016): 3 min > 1 min
      },
      mid: {
        sets: baseSets,
        reps: history === "beginner" ? 10 : 10,
        rpe: history === "beginner" ? 7 : 8,
        restSeconds: 120, // 2 min
      },
      isolation: {
        sets: baseSets,
        reps: history === "beginner" ? 12 : 10,
        rpe: history === "beginner" ? 7.5 : 8.5,
        restSeconds: 90, // 1.5 min
      },
    };
  } else {
    // Maintain: moderate everything, balanced approach
    base = {
      compound: {
        sets: baseSets,
        reps: history === "beginner" ? 10 : 8,
        rpe: history === "beginner" ? 6.5 : 7,
        restSeconds: 120,
      },
      mid: {
        sets: baseSets,
        reps: 10,
        rpe: history === "beginner" ? 7 : 7.5,
        restSeconds: 90,
      },
      isolation: {
        sets: Math.max(2, baseSets - 1),
        reps: 12,
        rpe: history === "beginner" ? 7 : 7.5,
        restSeconds: 60,
      },
    };
  }

  return {
    compound: applyAdjustments(base.compound),
    mid: applyAdjustments(base.mid),
    isolation: applyAdjustments(base.isolation),
  };
}

// ─── Exercises Per Muscle Group ─────────────────────────────────────────────────

// Large muscles benefit from 2 exercises (compound + isolation/variation).
// Small muscles only need 1 exercise per session (Fink et al., 2021).
const LARGE_MUSCLE_GROUPS: ReadonlySet<MuscleGroup> = new Set(["chest", "back", "quads"]);

function getExercisesPerGroup(
  muscleGroup: MuscleGroup,
  history: TrainingHistory,
  goal: Goal,
  ageBracket: AgeBracket
): number {
  const isLarge = LARGE_MUSCLE_GROUPS.has(muscleGroup);
  const volumeReduction = (ageBracket === "senior" || ageBracket === "teen") ? 1 : 0;

  let base: number;
  if (isLarge) {
    // Large muscles: 2 exercises (compound + accessory) for intermediates+
    base = history === "beginner" ? 1 : 2;
  } else {
    // Small/medium muscles: 1 exercise is sufficient per session
    base = 1;
  }

  // Fat loss: slightly fewer exercises, keep intensity
  if (goal === "lose_fat" && base > 1) {
    base = Math.max(1, base);
  }

  return Math.max(1, base - volumeReduction);
}

// ─── Compound Ratio ─────────────────────────────────────────────────────────────

function getCompoundRatio(goal: Goal): number {
  if (goal === "lose_fat") return 0.75;
  if (goal === "build_muscle") return 0.55;
  return 0.65;
}

// ─── Exercise Filtering (equipment + difficulty + age safety + body weight) ──────

function filterExercises(
  library: Exercise[],
  muscleGroup: MuscleGroup,
  allowedEquipment: string[],
  maxDifficulty: string,
  ageBracket: AgeBracket,
  bodyWeightKg: number | undefined
): Exercise[] {
  const difficultyOrder = ["beginner", "intermediate", "advanced"];
  const maxIdx = difficultyOrder.indexOf(maxDifficulty);

  // Teens: cap at intermediate regardless of trainingHistory
  const effectiveMaxIdx = ageBracket === "teen" ? Math.min(maxIdx, 1) : maxIdx;

  return library.filter((ex) => {
    if (ex.muscle_group !== muscleGroup) return false;
    if (difficultyOrder.indexOf(ex.difficulty) > effectiveMaxIdx) return false;
    if (!ex.equipment.some((eq) => allowedEquipment.includes(eq))) return false;

    const name = ex.name;

    // Age safety: remove heavy axial loading for teens and seniors
    if (ageBracket === "teen" || ageBracket === "senior") {
      if (HEAVY_AXIAL_PATTERNS.some((p) => p.test(name))) return false;
    }

    // Body weight filter: users over 110kg shouldn't get bodyweight pulling exercises
    // (pull-ups, chin-ups, dips) as starting exercises — too difficult and risky
    if (bodyWeightKg && bodyWeightKg > 110) {
      if (HIGH_BW_RATIO_EXERCISES.some((p) => p.test(name))) return false;
    }

    return true;
  });
}

// ─── Exercise Picking (goal + age + sex aware) ──────────────────────────────────

function pickExercisesGoalAware(
  available: Exercise[],
  count: number,
  usedIds: Set<string>,
  goal: Goal,
  ageBracket: AgeBracket,
  sex: Sex | undefined,
  muscleGroup: MuscleGroup
): Exercise[] {
  const unused = available.filter((ex) => !usedIds.has(ex.id));
  const pool = unused.length >= count ? unused : available;

  if (count === 0 || pool.length === 0) return [];

  // Score each exercise based on demographic fit
  const scored = pool.map((ex) => {
    let score = Math.random() * 0.5; // small random factor for variety
    const exerciseIsCompound = isCompound(ex.name);

    // Goal-based: compounds always form the foundation (Schoenfeld et al.)
    // Fat loss: strong compound preference (metabolic cost)
    // Muscle building: compounds first, then isolation as supplement
    if (exerciseIsCompound) score += 1.5;
    if (goal === "lose_fat" && exerciseIsCompound) score += 1;

    // Age preference: boost exercises that are safer/better for the age bracket
    const agePrefs = AGE_PREFERRED_PATTERNS[ageBracket];
    if (agePrefs.some((p) => p.test(ex.name))) score += 1.5;

    // Female preference: boost glute/hip dominant exercises for women
    if (sex === "female") {
      const isLowerBody = ["quads", "hamstrings", "glutes", "calves"].includes(muscleGroup);
      if (FEMALE_PREFERRED_PATTERNS.some((p) => p.test(ex.name))) score += 2;
      if (goal === "build_muscle" && isLowerBody) score += 0.5;
    }

    return { exercise: ex, score };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Pick with movement pattern variety
  const picked: Exercise[] = [];
  const usedPatterns = new Set<MovementPattern>();

  // First pass: one per movement pattern, in score order
  for (const { exercise } of scored) {
    if (picked.length >= count) break;
    const pattern = inferMovementPattern(exercise.name);
    if (usedPatterns.has(pattern)) continue;
    picked.push(exercise);
    usedPatterns.add(pattern);
  }

  // Second pass: fill remaining from scored list (allow duplicate patterns)
  if (picked.length < count) {
    for (const { exercise } of scored) {
      if (picked.length >= count) break;
      if (picked.some((p) => p.id === exercise.id)) continue;
      picked.push(exercise);
    }
  }

  return picked.slice(0, count);
}

// ─── Goal-Specific "Why" Explanations ───────────────────────────────────────────

function buildExplainWhy(
  exercise: Exercise,
  muscleGroup: string,
  goal: Goal,
  position: "compound" | "mid" | "isolation"
): string {
  const mg = muscleGroup.replace("_", " ");
  const base = exercise.explain_eli5;

  if (goal === "lose_fat") {
    if (position === "compound") {
      return `Compound movement targeting ${mg} — burns more calories by engaging multiple muscle groups. ${base}`;
    }
    if (position === "mid") {
      return `Keeps your heart rate up while targeting ${mg}. Higher reps with shorter rest = more fat burned. ${base}`;
    }
    return `Metabolic finisher for ${mg} — high reps to maximize calorie burn. ${base}`;
  }

  if (goal === "build_muscle") {
    if (position === "compound") {
      return `Heavy compound for ${mg} — builds raw strength and mass through mechanical tension. ${base}`;
    }
    if (position === "mid") {
      return `Hypertrophy work for ${mg} — moderate reps in the muscle-building sweet spot. ${base}`;
    }
    return `Isolation work to fully fatigue ${mg} — pump and metabolic stress drive growth. ${base}`;
  }

  if (position === "compound") {
    return `Compound lift to maintain your ${mg} strength efficiently. ${base}`;
  }
  return `Targets ${mg} — enough stimulus to maintain your current fitness. ${base}`;
}

// ─── Main Generator ─────────────────────────────────────────────────────────────

export function generateWorkoutPlan(input: GeneratorInput): WorkoutDay[] {
  const { daysPerWeek, equipment, trainingHistory, goal, exerciseLibrary, age, sex, bodyWeightKg } = input;
  const ageBracket = getAgeBracket(age);
  const splitType = getSplitType(daysPerWeek);
  const focusList = SPLIT_FOCUS[splitType];
  const optimizedFocusList = optimizeDayOrder(focusList, daysPerWeek);
  const allowedEquipment = EQUIPMENT_MAP[equipment];
  const positionalVolume = getPositionalVolume(trainingHistory, goal, ageBracket, sex);
  const usedExerciseIds = new Set<string>();

  // ── NASM OPT Phase Configuration ──
  const phase = input.trainingPhase ?? (trainingHistory === "beginner" ? "stabilization" : "hypertrophy");
  const phaseConfig = TRAINING_PHASES[phase];

  const days: WorkoutDay[] = [];

  for (let i = 0; i < 7; i++) {
    if (i < daysPerWeek) {
      const focus = optimizedFocusList[i % optimizedFocusList.length];
      const muscleGroups = FOCUS_MUSCLE_MAP[focus] || [];
      const exercises: PlannedExercise[] = [];

      for (const mg of muscleGroups) {
        const countForGroup = getExercisesPerGroup(mg, trainingHistory, goal, ageBracket);
        let available = filterExercises(
          exerciseLibrary, mg, allowedEquipment, trainingHistory, ageBracket, bodyWeightKg
        );

        // ── Phase rules: stabilization removes heavy barbell compounds ──
        if (!phaseConfig.exerciseRules.allowHeavyCompounds) {
          const heavyBarbell = /\bbarbell\b.*\b(squat|deadlift|bench press|overhead press|military press)\b/i;
          const filtered = available.filter(ex => !heavyBarbell.test(ex.name));
          if (filtered.length > 0) available = filtered; // keep originals if filtering removes everything
        }

        let picked = pickExercisesGoalAware(
          available, countForGroup, usedExerciseIds, goal, ageBracket, sex, mg
        );

        // Filter out exercises that conflict with injuries
        if (input.injuries && input.injuries.length > 0) {
          picked = picked.filter(ex => !shouldAvoidExercise(ex.name, mg, input.injuries!).avoid);
        }

        // If injury filtering removed everything, try to find safe alternatives
        if (picked.length === 0 && available.length > 0 && input.injuries && input.injuries.length > 0) {
          const safe = available.filter(ex => !shouldAvoidExercise(ex.name, mg, input.injuries!).avoid);
          if (safe.length > 0) {
            picked = [safe[Math.floor(Math.random() * safe.length)]];
          }
        }

        for (const ex of picked) {
          usedExerciseIds.add(ex.id);
          exercises.push({
            exerciseId: ex.id,
            exerciseName: ex.name,
            targetSets: 0,
            targetReps: 0,
            targetRpe: 0,
            restSeconds: 0,
            explainWhy: "",
          });
        }
      }

      // ── Order exercises by movement priority (NSCA guidelines) ──
      // 1. Heavy compounds first (squat, hinge, press) — most CNS demand, do fresh
      // 2. Secondary compounds (lunges, rows) — still multi-joint
      // 3. Accessory/isolation — least demanding, can handle fatigue
      const MOVEMENT_PRIORITY: Record<string, number> = {
        squat: 1, hinge: 1,                              // heavy lower compounds
        horizontal_press: 2, vertical_press: 2,           // heavy upper compounds
        horizontal_pull: 2, vertical_pull: 2,             // heavy upper pulls
        leg_press: 3, lunge: 3, incline_press: 3,        // secondary compounds
        fly: 4, curl: 4, extension: 4, lateral_raise: 4, // isolation
        calf_raise: 5, plank: 5, crunch: 5, rotation: 5, // accessories/core
        unknown: 4,
      };

      exercises.sort((a, b) => {
        const patA = inferMovementPattern(a.exerciseName);
        const patB = inferMovementPattern(b.exerciseName);
        const prioA = MOVEMENT_PRIORITY[patA] ?? 4;
        const prioB = MOVEMENT_PRIORITY[patB] ?? 4;
        if (prioA !== prioB) return prioA - prioB;
        // Within same priority: compounds before isolation
        const compA = isCompound(a.exerciseName) ? 0 : 1;
        const compB = isCompound(b.exerciseName) ? 0 : 1;
        return compA - compB;
      });

      // ── Cap total exercises per session ──
      // Research (Simao et al. 2012): performance degrades after 6th exercise.
      // Caps are split-aware: PPL has fewer muscle groups → fewer exercises.
      // Cap trims from the END (lowest priority = isolation/core), preserving
      // all compound movements which are the foundation of the program.
      const currentSplit = getSplitType(daysPerWeek);
      const isPPL = currentSplit === "push_pull_legs";
      let maxExercises: number;
      if (trainingHistory === "beginner") {
        maxExercises = isPPL ? 4 : 5;
      } else if (trainingHistory === "intermediate") {
        maxExercises = isPPL ? 5 : 6;
      } else {
        maxExercises = isPPL ? 6 : 7;
      }
      // Phase-specific cap overrides split-based cap
      maxExercises = Math.min(maxExercises, phaseConfig.exerciseRules.maxExercisesPerSession);
      if (exercises.length > maxExercises) {
        exercises.length = maxExercises;
      }

      // ── Assign positional volume (progressive rep scheme) ──
      const totalExercises = exercises.length;
      const compoundEnd = Math.ceil(totalExercises * 0.4);
      const midEnd = Math.ceil(totalExercises * 0.7);

      for (let j = 0; j < totalExercises; j++) {
        const ex = exercises[j];
        const exerciseIsCompound = isCompound(ex.exerciseName);
        let position: "compound" | "mid" | "isolation";
        let vol: ExerciseVolumeConfig;

        if (j < compoundEnd && exerciseIsCompound) {
          position = "compound";
          vol = positionalVolume.compound;
        } else if (j < midEnd) {
          position = "mid";
          vol = positionalVolume.mid;
        } else {
          position = "isolation";
          vol = positionalVolume.isolation;
        }

        if (exerciseIsCompound && position === "isolation") {
          vol = { ...vol, restSeconds: Math.max(vol.restSeconds, positionalVolume.mid.restSeconds) };
        }

        ex.targetSets = Math.max(2, Math.round(vol.sets * phaseConfig.volume.setsMultiplier));
        ex.targetReps = Math.max(phaseConfig.volume.repsMin, Math.min(vol.reps, phaseConfig.volume.repsMax));
        ex.targetRpe = Math.min(vol.rpe, phaseConfig.volume.rpeMax);
        ex.restSeconds = (phase === "stabilization" || phase === "strength_endurance")
          ? (exerciseIsCompound ? phaseConfig.volume.restSecondsCompound : phaseConfig.volume.restSecondsIsolation)
          : vol.restSeconds;

        const originalEx = exerciseLibrary.find(e => e.id === ex.exerciseId);
        const mg = originalEx?.muscle_group || "target muscle";
        ex.explainWhy = originalEx
          ? buildExplainWhy(originalEx, mg, goal, position)
          : `Targets your ${mg}`;
      }

      days.push({ day: i + 1, focus, isRestDay: false, exercises });
    } else {
      days.push({ day: i + 1, focus: "Rest", isRestDay: true, exercises: [] });
    }
  }

  // ── NSCA minimum frequency check ──
  const muscleFrequency = new Map<MuscleGroup, number>();
  for (const day of days) {
    if (day.isRestDay) continue;
    const muscles = FOCUS_MUSCLE_MAP[day.focus] || [];
    for (const mg of muscles) {
      muscleFrequency.set(mg, (muscleFrequency.get(mg) || 0) + 1);
    }
  }
  for (const [muscle, count] of muscleFrequency) {
    if (count < 2) {
      console.warn(
        `[workout-generator] NSCA frequency warning: "${muscle}" is only trained ${count}x/week (minimum 2x recommended)`
      );
    }
  }

  return days;
}
