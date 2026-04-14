export interface InjuryDef {
  key: string;
  label: string;
  bodyPart: string;
  icon: string;
  avoidMuscleGroups: string[]; // muscle groups to completely avoid when severe
  avoidExercisePatterns: string[]; // exercise name patterns to avoid
  modifyExercisePatterns: string[]; // exercises to modify (lighter weight, reduce ROM)
  recommendedWarmups: { name: string; duration_seconds: number; instructions: string }[];
}

export const INJURY_DEFINITIONS: InjuryDef[] = [
  {
    key: "shoulder",
    label: "Shoulder",
    bodyPart: "Upper Body",
    icon: "🦾",
    avoidMuscleGroups: ["shoulders"],
    avoidExercisePatterns: ["overhead press", "handstand", "arnold press", "lateral raise", "front raise", "pike push"],
    modifyExercisePatterns: ["bench press", "push-up", "dip", "fly"],
    recommendedWarmups: [
      { name: "Shoulder Circles", duration_seconds: 30, instructions: "Slow, controlled circles in both directions. Start small, go bigger." },
      { name: "Band External Rotation", duration_seconds: 30, instructions: "Elbow at side, rotate forearm outward against band resistance." },
      { name: "Wall Slides", duration_seconds: 30, instructions: "Back against wall, slide arms up and down keeping contact with wall." },
    ],
  },
  {
    key: "lower_back",
    label: "Lower Back",
    bodyPart: "Core",
    icon: "🔙",
    avoidMuscleGroups: [],
    avoidExercisePatterns: ["deadlift", "good morning", "bent-over row", "t-bar row", "barbell row"],
    modifyExercisePatterns: ["squat", "romanian deadlift", "kettlebell swing"],
    recommendedWarmups: [
      { name: "Cat-Cow Stretch", duration_seconds: 40, instructions: "On all fours, alternate arching and rounding your back slowly." },
      { name: "Pelvic Tilts", duration_seconds: 30, instructions: "Lie on back, knees bent. Tilt pelvis to flatten lower back against floor." },
      { name: "Bird Dog", duration_seconds: 30, instructions: "On all fours, extend opposite arm and leg. Hold 3 seconds each side." },
    ],
  },
  {
    key: "knee",
    label: "Knee",
    bodyPart: "Lower Body",
    icon: "🦵",
    avoidMuscleGroups: [],
    avoidExercisePatterns: ["squat", "lunge", "leg extension", "leg press", "jump squat", "step-up", "bulgarian"],
    modifyExercisePatterns: ["calf raise", "walking"],
    recommendedWarmups: [
      { name: "Gentle Knee Circles", duration_seconds: 30, instructions: "Hands on knees, make small circles. 10 each direction." },
      { name: "Seated Leg Extension (bodyweight)", duration_seconds: 30, instructions: "Sit in chair, slowly extend each leg. No weight, just range of motion." },
      { name: "Wall Sit (partial)", duration_seconds: 20, instructions: "Lean against wall, only bend knees to 45 degrees. Hold gently." },
    ],
  },
  {
    key: "wrist",
    label: "Wrist",
    bodyPart: "Upper Body",
    icon: "✋",
    avoidMuscleGroups: [],
    avoidExercisePatterns: ["push-up", "plank", "barbell curl", "barbell bench", "overhead press", "clean", "ab rollout"],
    modifyExercisePatterns: ["dumbbell curl", "hammer curl"],
    recommendedWarmups: [
      { name: "Wrist Circles", duration_seconds: 20, instructions: "Rotate wrists slowly in both directions." },
      { name: "Prayer Stretch", duration_seconds: 20, instructions: "Press palms together, lower hands while keeping palms together." },
      { name: "Finger Flexion", duration_seconds: 20, instructions: "Open and close fists slowly, extending fingers fully." },
    ],
  },
  {
    key: "elbow",
    label: "Elbow",
    bodyPart: "Upper Body",
    icon: "💪",
    avoidMuscleGroups: [],
    avoidExercisePatterns: ["skull crusher", "tricep dip", "chin-up", "concentration curl", "barbell curl"],
    modifyExercisePatterns: ["tricep pushdown", "cable curl", "pull-up"],
    recommendedWarmups: [
      { name: "Elbow Flexion/Extension", duration_seconds: 20, instructions: "Slowly bend and straighten elbow through full range. 10 reps each arm." },
      { name: "Forearm Pronation/Supination", duration_seconds: 20, instructions: "Arm at side, elbow bent. Rotate forearm palm-up then palm-down." },
    ],
  },
  {
    key: "ankle",
    label: "Ankle",
    bodyPart: "Lower Body",
    icon: "🦶",
    avoidMuscleGroups: ["calves"],
    avoidExercisePatterns: ["jump squat", "burpee", "mountain climber", "walking lunge", "step-up", "calf raise"],
    modifyExercisePatterns: ["squat", "lunge"],
    recommendedWarmups: [
      { name: "Ankle Circles", duration_seconds: 30, instructions: "Seated, rotate each ankle slowly. 10 circles each direction." },
      { name: "Towel Stretch", duration_seconds: 30, instructions: "Sit with leg extended, loop towel around foot. Gently pull toward you." },
    ],
  },
  {
    key: "hip",
    label: "Hip",
    bodyPart: "Lower Body",
    icon: "🏃",
    avoidMuscleGroups: [],
    avoidExercisePatterns: ["squat", "lunge", "hip thrust", "sumo squat", "cable pull-through", "donkey kick"],
    modifyExercisePatterns: ["deadlift", "leg press"],
    recommendedWarmups: [
      { name: "Hip Circles", duration_seconds: 30, instructions: "Hands on hips, make large slow circles. 10 each direction." },
      { name: "Clamshell", duration_seconds: 30, instructions: "Lie on side, knees bent. Open top knee like a clamshell. 10 each side." },
      { name: "90/90 Hip Stretch", duration_seconds: 30, instructions: "Sit with both legs at 90 degrees. Lean gently over front leg." },
    ],
  },
  {
    key: "neck",
    label: "Neck",
    bodyPart: "Upper Body",
    icon: "🗣",
    avoidMuscleGroups: [],
    avoidExercisePatterns: ["overhead press", "handstand", "shrug"],
    modifyExercisePatterns: ["bench press", "lat pulldown"],
    recommendedWarmups: [
      { name: "Neck Tilts", duration_seconds: 20, instructions: "Gently tilt head ear-to-shoulder. Hold 5 seconds each side." },
      { name: "Neck Rotations", duration_seconds: 20, instructions: "Slowly turn head left and right. Hold 3 seconds each side." },
      { name: "Chin Tucks", duration_seconds: 20, instructions: "Pull chin straight back (double chin). Hold 5 seconds. Repeat 5 times." },
    ],
  },
];

export type InjuryKey = typeof INJURY_DEFINITIONS[number]["key"];

export interface UserInjury {
  key: string;
  severity: "mild" | "moderate" | "severe";
  since?: string; // date string
}

/**
 * Check if an exercise should be avoided given current injuries
 */
export function shouldAvoidExercise(
  exerciseName: string,
  muscleGroup: string,
  injuries: UserInjury[]
): { avoid: boolean; reason: string } {
  const nameLower = exerciseName.toLowerCase();

  for (const injury of injuries) {
    const def = INJURY_DEFINITIONS.find((d) => d.key === injury.key);
    if (!def) continue;

    // Severe: avoid entire muscle groups
    if (injury.severity === "severe" && def.avoidMuscleGroups.includes(muscleGroup)) {
      return { avoid: true, reason: `Skipped due to ${def.label.toLowerCase()} injury` };
    }

    // Moderate+Severe: avoid specific exercises
    if (injury.severity !== "mild") {
      const shouldAvoid = def.avoidExercisePatterns.some((pattern) =>
        nameLower.includes(pattern.toLowerCase())
      );
      if (shouldAvoid) {
        return { avoid: true, reason: `Avoid with ${def.label.toLowerCase()} injury — find an alternative` };
      }
    }

    // Mild: flag exercises to modify (lighter weight)
    if (def.modifyExercisePatterns.some((p) => nameLower.includes(p.toLowerCase()))) {
      return { avoid: false, reason: `Go lighter — be careful with your ${def.label.toLowerCase()}` };
    }
  }

  return { avoid: false, reason: "" };
}

/**
 * Get injury-specific warmup exercises
 */
export function getInjuryWarmups(injuries: UserInjury[]) {
  const warmups: { name: string; duration_seconds: number; instructions: string }[] = [];
  for (const injury of injuries) {
    const def = INJURY_DEFINITIONS.find((d) => d.key === injury.key);
    if (def) {
      warmups.push(...def.recommendedWarmups);
    }
  }
  return warmups;
}
