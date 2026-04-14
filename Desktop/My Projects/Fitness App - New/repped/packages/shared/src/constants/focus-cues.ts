/**
 * Mind-muscle connection cues.
 * Short, actionable focus instructions that help users feel the target muscle working.
 * Mapped by muscle group with optional keyword refinements for specific movement types.
 */

export interface FocusCue {
  /** Keywords to match in exercise name (empty = default for muscle group) */
  keywords: string[];
  /** The cue shown to the user during the exercise */
  cue: string;
}

export const FOCUS_CUES: Record<string, FocusCue[]> = {
  chest: [
    { keywords: ["bench press", "chest press", "floor press"], cue: "Drive through your palms and squeeze your chest at the top. Imagine pushing your hands together." },
    { keywords: ["fly", "flye", "crossover", "pec deck"], cue: "Lead with your elbows, not your hands. Imagine hugging a large tree — squeeze at the center." },
    { keywords: ["incline"], cue: "Press up and slightly inward. Focus on the upper chest stretch at the bottom." },
    { keywords: ["push-up", "pushup", "push up"], cue: "Squeeze your chest at the top of each rep. Keep your core tight — your body is a plank." },
    { keywords: ["dip"], cue: "Lean slightly forward to shift the load to your chest. Control the descent." },
    { keywords: [], cue: "Squeeze your chest hard at the peak of every rep. Control the weight down slowly." },
  ],
  back: [
    { keywords: ["row"], cue: "Pull with your elbows, not your hands. Squeeze your shoulder blades together at the top." },
    { keywords: ["pull-up", "pullup", "pull up", "chin-up", "chinup", "chin up"], cue: "Drive your elbows down toward your hips. Think about pulling the bar to your chest, not your chin." },
    { keywords: ["pulldown", "lat pulldown"], cue: "Pull with your elbows, not your hands. Lean back slightly and squeeze your lats at the bottom." },
    { keywords: ["deadlift", "romanian", "rdl"], cue: "Push the floor away with your feet. Keep the bar close to your body — your back stays tight, not rounded." },
    { keywords: ["face pull", "rear delt", "reverse fly"], cue: "Pull to your forehead level with elbows high. Squeeze your upper back at the end." },
    { keywords: [], cue: "Initiate every pull with your back muscles, not your arms. Squeeze your shoulder blades together." },
  ],
  shoulders: [
    { keywords: ["overhead press", "shoulder press", "military press", "arnold"], cue: "Press straight up, lock out at the top. Keep your core braced — don't lean back." },
    { keywords: ["lateral raise", "side raise"], cue: "Lead with your elbows, pour water out of a jug. Stop at shoulder height — no higher." },
    { keywords: ["front raise"], cue: "Lift to eye level with a slight bend in your elbows. Control the way down." },
    { keywords: ["shrug"], cue: "Drive your shoulders straight up toward your ears. Hold the squeeze for 1 second at the top." },
    { keywords: [], cue: "Feel your shoulders doing the work, not your traps. Control every rep — no momentum." },
  ],
  biceps: [
    { keywords: ["curl", "hammer"], cue: "Keep your elbows pinned to your sides. Squeeze hard at the top for 1 second — don't swing." },
    { keywords: ["preacher", "concentration"], cue: "Slow the negative to 3 seconds. Feel the stretch at the bottom — that's where growth happens." },
    { keywords: [], cue: "Squeeze at the top, slow on the way down. Your elbows shouldn't move — only your forearms." },
  ],
  triceps: [
    { keywords: ["pushdown", "press down"], cue: "Lock your elbows in place. Squeeze at full extension — imagine breaking the bar apart." },
    { keywords: ["skull crusher", "lying extension"], cue: "Lower to your forehead, then extend fully. Only your forearms should move." },
    { keywords: ["overhead extension", "french press"], cue: "Keep your elbows close to your head. Stretch deep at the bottom, lock out at the top." },
    { keywords: ["kickback"], cue: "Pin your elbow to your side. Extend fully and squeeze for a beat." },
    { keywords: ["dip"], cue: "Stay upright to keep the load on your triceps. Lock out fully at the top." },
    { keywords: [], cue: "Lock out every rep completely. The squeeze at full extension is where triceps work hardest." },
  ],
  quads: [
    { keywords: ["squat", "goblet", "front squat", "hack"], cue: "Push the floor away with your whole foot. Drive your knees out over your toes." },
    { keywords: ["lunge", "split squat", "bulgarian", "step"], cue: "Lower straight down, not forward. Push up through your front heel." },
    { keywords: ["leg press"], cue: "Place feet lower on the platform to target quads. Push through your whole foot." },
    { keywords: ["leg extension"], cue: "Squeeze your quads hard at full lockout. Hold for 1 second at the top." },
    { keywords: [], cue: "Drive through your heels and feel your quads burning on every rep." },
  ],
  hamstrings: [
    { keywords: ["deadlift", "romanian", "rdl", "good morning"], cue: "Push your hips back like closing a car door with your butt. Feel the stretch behind your knees." },
    { keywords: ["leg curl", "hamstring curl"], cue: "Curl your heels toward your glutes. Squeeze hard at the top — hold 1 second." },
    { keywords: [], cue: "Feel the stretch at the bottom and squeeze at the top. Your hamstrings do the pulling, not your lower back." },
  ],
  glutes: [
    { keywords: ["hip thrust", "glute bridge"], cue: "Drive your hips up by squeezing your glutes — not your lower back. Pause at the top for 2 seconds." },
    { keywords: ["squat", "sumo"], cue: "Sit back into your hips. Push your knees out and squeeze your glutes as you stand." },
    { keywords: ["kickback", "donkey kick"], cue: "Drive your heel toward the ceiling. Squeeze your glute at the top — don't arch your back." },
    { keywords: ["lunge", "step"], cue: "Push up through your front heel and feel your glute fire at the top." },
    { keywords: [], cue: "Squeeze your glutes like you're cracking a walnut. Pause at peak contraction." },
  ],
  calves: [
    { keywords: ["standing calf", "calf raise"], cue: "Rise up onto your big toe. Pause at the top for 2 seconds, lower slowly for 3." },
    { keywords: ["seated calf"], cue: "Full range of motion — drop your heels as low as they go, then rise to your toes." },
    { keywords: [], cue: "Pause at the top, slow on the way down. Calves respond to time under tension." },
  ],
  core: [
    { keywords: ["plank", "hollow", "dead bug"], cue: "Brace like someone's about to punch your stomach. Breathe into your ribs, not your belly." },
    { keywords: ["crunch", "sit-up", "situp"], cue: "Curl your ribs toward your hips. Don't pull your neck — your abs do all the work." },
    { keywords: ["leg raise", "knee raise", "hanging"], cue: "Tilt your pelvis up at the top. Don't just swing your legs — use your abs to lift." },
    { keywords: ["russian twist", "woodchop", "cable twist", "rotation"], cue: "Rotate from your ribcage, not your arms. Your core powers the twist." },
    { keywords: ["ab wheel", "rollout"], cue: "Brace hard and roll out only as far as you can control. Pull back with your abs, not your arms." },
    { keywords: [], cue: "Brace your core tight. Every rep should feel like a controlled squeeze, not momentum." },
  ],
  full_body: [
    { keywords: [], cue: "Focus on the primary muscle for this movement. Control the weight — don't let it control you." },
  ],
};

/**
 * Get the best focus cue for a given exercise name and muscle group.
 * Tries keyword matching first, falls back to the default cue for that muscle group.
 */
export function getFocusCue(exerciseName: string, muscleGroup: string): string {
  const cues = FOCUS_CUES[muscleGroup];
  if (!cues || cues.length === 0) {
    return "Focus on the target muscle. Control every rep.";
  }

  const lower = exerciseName.toLowerCase();

  // Try keyword match (skip entries with empty keywords — those are defaults)
  for (const entry of cues) {
    if (entry.keywords.length > 0 && entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.cue;
    }
  }

  // Fall back to default cue (the one with empty keywords)
  const defaultCue = cues.find((c) => c.keywords.length === 0);
  return defaultCue?.cue ?? "Focus on the target muscle. Control every rep.";
}
