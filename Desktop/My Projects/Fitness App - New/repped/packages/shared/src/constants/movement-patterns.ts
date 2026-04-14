/**
 * Movement pattern inference map.
 * Maps keywords found in exercise names to movement pattern categories.
 * Used by the workout generator to ensure multi-angle muscle targeting
 * (e.g., picking a press + a fly + an incline for chest, not 3 flat presses).
 */

export type MovementPattern =
  | "horizontal_press"
  | "incline_press"
  | "decline_press"
  | "vertical_press"
  | "fly"
  | "horizontal_pull"
  | "vertical_pull"
  | "curl"
  | "extension"
  | "squat"
  | "lunge"
  | "hinge"
  | "leg_press"
  | "calf_raise"
  | "lateral_raise"
  | "rotation"
  | "plank"
  | "crunch"
  | "unknown";

// Ordered from most specific to least specific (first match wins)
export const MOVEMENT_PATTERN_KEYWORDS: { keywords: string[]; pattern: MovementPattern }[] = [
  { keywords: ["incline bench", "incline press", "incline dumbbell press"], pattern: "incline_press" },
  { keywords: ["decline bench", "decline press"], pattern: "decline_press" },
  { keywords: ["overhead press", "shoulder press", "military press", "arnold press"], pattern: "vertical_press" },
  { keywords: ["bench press", "chest press", "floor press", "push-up", "pushup", "push up", "dip"], pattern: "horizontal_press" },
  { keywords: ["fly", "flye", "cable crossover", "pec deck"], pattern: "fly" },
  { keywords: ["pull-up", "pullup", "pull up", "chin-up", "chinup", "chin up", "lat pulldown", "pulldown"], pattern: "vertical_pull" },
  { keywords: ["row", "face pull", "reverse fly", "rear delt"], pattern: "horizontal_pull" },
  { keywords: ["curl", "hammer curl", "preacher"], pattern: "curl" },
  { keywords: ["tricep extension", "skull crusher", "pushdown", "kickback", "overhead extension"], pattern: "extension" },
  { keywords: ["squat", "goblet", "hack squat", "front squat"], pattern: "squat" },
  { keywords: ["lunge", "split squat", "step-up", "step up", "bulgarian"], pattern: "lunge" },
  { keywords: ["deadlift", "romanian", "rdl", "hip thrust", "good morning", "glute bridge", "swing"], pattern: "hinge" },
  { keywords: ["leg press", "leg extension", "leg curl", "hamstring curl"], pattern: "leg_press" },
  { keywords: ["calf raise", "calf press", "seated calf", "standing calf"], pattern: "calf_raise" },
  { keywords: ["lateral raise", "side raise", "front raise", "upright row"], pattern: "lateral_raise" },
  { keywords: ["rotation", "woodchop", "russian twist", "cable twist"], pattern: "rotation" },
  { keywords: ["plank", "dead bug", "hollow hold", "bird dog", "pallof"], pattern: "plank" },
  { keywords: ["crunch", "sit-up", "situp", "sit up", "leg raise", "knee raise", "ab wheel", "v-up"], pattern: "crunch" },
];

/**
 * Infer movement pattern from an exercise name.
 * Checks keywords from most specific to least specific.
 */
export function inferMovementPattern(exerciseName: string): MovementPattern {
  const lower = exerciseName.toLowerCase();
  for (const entry of MOVEMENT_PATTERN_KEYWORDS) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.pattern;
    }
  }
  return "unknown";
}
