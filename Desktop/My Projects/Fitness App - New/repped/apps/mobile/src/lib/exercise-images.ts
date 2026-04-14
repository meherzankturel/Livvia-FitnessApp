/**
 * Exercise images — bundled assets generated via Gemini AI.
 * All uniform: same person, same angle, same background, same lighting.
 * Loaded instantly from local assets (no network calls).
 */

const IMAGE_MAP: Record<string, any> = {
  "bench press": require("../../assets/exercises/bench-press.png"),
  "barbell squat": require("../../assets/exercises/barbell-squat.png"),
  "deadlift": require("../../assets/exercises/deadlift.png"),
  "pull-up": require("../../assets/exercises/pull-up.png"),
  "lateral raise": require("../../assets/exercises/lateral-raise.png"),
  "diamond push-up": require("../../assets/exercises/diamond-push-up.png"),
  "incline dumbbell press": require("../../assets/exercises/incline-dumbbell-press.png"),
  "dumbbell pullover": require("../../assets/exercises/dumbbell-pullover.png"),
  "band pull-apart": require("../../assets/exercises/band-pull-apart.png"),
  "front raise": require("../../assets/exercises/front-raise.png"),
  "overhead tricep extension": require("../../assets/exercises/overhead-tricep-extension.png"),
  "push-up": require("../../assets/exercises/push-up.png"),
  "chest dip": require("../../assets/exercises/chest-dip.png"),
  "cable crossover": require("../../assets/exercises/cable-crossover.png"),
  "incline bench press": require("../../assets/exercises/incline-bench-press.png"),
  "dumbbell fly": require("../../assets/exercises/dumbbell-fly.png"),
  "barbell row": require("../../assets/exercises/barbell-row.png"),
  "lat pulldown": require("../../assets/exercises/lat-pulldown.png"),
  "face pull": require("../../assets/exercises/face-pull.png"),
  "barbell curl": require("../../assets/exercises/barbell-curl.png"),
  "hammer curl": require("../../assets/exercises/hammer-curl.png"),
  "dumbbell curl": require("../../assets/exercises/dumbbell-curl.png"),
  "cable row": require("../../assets/exercises/cable-row.png"),
  "chin-up": require("../../assets/exercises/chin-up.png"),
  "preacher curl": require("../../assets/exercises/preacher-curl.png"),
  "concentration curl": require("../../assets/exercises/concentration-curl.png"),
  "leg press": require("../../assets/exercises/leg-press.png"),
  "romanian deadlift": require("../../assets/exercises/romanian-deadlift.png"),
  "leg extension": require("../../assets/exercises/leg-extension.png"),
  "leg curl": require("../../assets/exercises/leg-curl.png"),
  "calf raise": require("../../assets/exercises/calf-raise.png"),
  "lunge": require("../../assets/exercises/lunge.png"),
  "hip thrust": require("../../assets/exercises/hip-thrust.png"),
  "goblet squat": require("../../assets/exercises/goblet-squat.png"),
  "bulgarian split squat": require("../../assets/exercises/bulgarian-split-squat.png"),
  "step-up": require("../../assets/exercises/step-up.png"),
  "overhead press": require("../../assets/exercises/overhead-press.png"),
  "arnold press": require("../../assets/exercises/arnold-press.png"),
  "rear delt fly": require("../../assets/exercises/rear-delt-fly.png"),
  "shrug": require("../../assets/exercises/shrug.png"),
  "upright row": require("../../assets/exercises/upright-row.png"),
  "plank": require("../../assets/exercises/plank.png"),
  "crunch": require("../../assets/exercises/crunch.png"),
  "leg raise": require("../../assets/exercises/leg-raise.png"),
  "russian twist": require("../../assets/exercises/russian-twist.png"),
  "mountain climber": require("../../assets/exercises/mountain-climber.png"),
  "ab wheel rollout": require("../../assets/exercises/ab-wheel-rollout.png"),
  "tricep pushdown": require("../../assets/exercises/tricep-pushdown.png"),
  "skull crusher": require("../../assets/exercises/skull-crusher.png"),
  "close grip bench press": require("../../assets/exercises/close-grip-bench-press.png"),
  "kickback": require("../../assets/exercises/kickback.png"),
  "tricep dip": require("../../assets/exercises/tricep-dip.png"),
  "clean and press": require("../../assets/exercises/clean-and-press.png"),
  "burpee": require("../../assets/exercises/burpee.png"),
  "kettlebell swing": require("../../assets/exercises/kettlebell-swing.png"),
};

/**
 * Get bundled exercise image. Returns a require() source for <Image>.
 * Falls back to null if no image exists for this exercise.
 */
export function getExerciseImage(exerciseName: string): any | null {
  const lower = exerciseName.toLowerCase().trim();

  // Exact match
  if (IMAGE_MAP[lower]) return IMAGE_MAP[lower];

  // Remove parenthetical: "Diamond Push-Up (Triceps)" → "diamond push-up"
  const cleaned = lower.split("(")[0].trim();
  if (IMAGE_MAP[cleaned]) return IMAGE_MAP[cleaned];

  // Partial match
  for (const key of Object.keys(IMAGE_MAP)) {
    if (lower.includes(key) || key.includes(cleaned)) {
      return IMAGE_MAP[key];
    }
  }

  return null;
}

// Legacy export for backward compat
export function getExerciseImageUrl(exerciseName: string): string {
  return ""; // No longer URL-based
}
