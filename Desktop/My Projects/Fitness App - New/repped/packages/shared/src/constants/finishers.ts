/**
 * HIIT & Core finisher blocks.
 * Optional 5-8 minute finisher appended to every workout session.
 * Includes one HIIT burst + 2-3 rotating core exercises.
 * Users can toggle this off if they're short on time.
 */

export interface FinisherExercise {
  name: string;
  duration_seconds: number;
  instructions: string;
  type: "hiit" | "core";
}

export interface FinisherBlock {
  exercises: FinisherExercise[];
  totalDurationSeconds: number;
}

/**
 * HIIT options matched to workout focus.
 * Cardio always comes AFTER the strength work (Cavaliere rule).
 */
export const HIIT_BY_FOCUS: Record<string, FinisherExercise[]> = {
  Push: [
    { name: "Battle Ropes", duration_seconds: 30, instructions: "Alternate arms rapidly. 30 seconds on, 15 seconds rest. Repeat 3 times.", type: "hiit" },
    { name: "Burpees", duration_seconds: 60, instructions: "Explosive jump up, drop to push-up, repeat. 45 seconds work, 15 rest.", type: "hiit" },
  ],
  Pull: [
    { name: "Rowing Machine Intervals", duration_seconds: 90, instructions: "30 seconds max effort, 30 seconds easy. Repeat 3 times.", type: "hiit" },
    { name: "Mountain Climbers", duration_seconds: 60, instructions: "Drive knees to chest rapidly. 40 seconds on, 20 seconds rest.", type: "hiit" },
  ],
  Legs: [
    { name: "Treadmill Sprints", duration_seconds: 90, instructions: "20 seconds all-out sprint, 40 seconds walk. Repeat 3 times.", type: "hiit" },
    { name: "Jump Squats", duration_seconds: 60, instructions: "Explosive squat jumps. 30 seconds on, 15 rest. Repeat twice.", type: "hiit" },
  ],
  Upper: [
    { name: "Battle Ropes", duration_seconds: 60, instructions: "Alternate arms rapidly. 30 seconds on, 15 rest. Repeat twice.", type: "hiit" },
    { name: "Burpee to Pull-Up", duration_seconds: 60, instructions: "Burpee + jump to pull-up bar. 30 seconds on, 30 rest.", type: "hiit" },
  ],
  Lower: [
    { name: "Bike Sprints", duration_seconds: 90, instructions: "30 seconds max effort, 30 seconds easy. Repeat 3 times.", type: "hiit" },
    { name: "Box Jumps", duration_seconds: 60, instructions: "Explosive jumps onto a box/step. 10 reps, rest 20 seconds, repeat.", type: "hiit" },
  ],
  "Full Body A": [
    { name: "Jump Rope", duration_seconds: 90, instructions: "30 seconds fast, 30 seconds easy. Repeat 3 times.", type: "hiit" },
  ],
  "Full Body B": [
    { name: "Burpees", duration_seconds: 60, instructions: "45 seconds work, 15 rest. Push hard.", type: "hiit" },
  ],
  "Full Body C": [
    { name: "Mountain Climbers", duration_seconds: 60, instructions: "40 seconds on, 20 rest. Repeat twice.", type: "hiit" },
  ],
};

/**
 * Rotating core exercises. Pick 2-3 per session, never the same combo two days in a row.
 */
export const CORE_FINISHER_POOL: FinisherExercise[] = [
  { name: "Plank Hold", duration_seconds: 45, instructions: "Hold a straight-arm or forearm plank. Brace your core like someone's about to punch you.", type: "core" },
  { name: "Bicycle Crunches", duration_seconds: 40, instructions: "Alternate elbow to opposite knee. Slow and controlled — don't rush.", type: "core" },
  { name: "Dead Bugs", duration_seconds: 40, instructions: "Lie on back, extend opposite arm and leg. Keep lower back pressed to floor.", type: "core" },
  { name: "Russian Twists", duration_seconds: 40, instructions: "Sit with feet elevated, rotate side to side. Use a weight if available.", type: "core" },
  { name: "Leg Raises", duration_seconds: 40, instructions: "Lie flat, raise legs to 90 degrees. Lower slowly — don't let your back arch.", type: "core" },
  { name: "Mountain Climber Plank", duration_seconds: 45, instructions: "In plank position, drive knees to chest alternately. Controlled pace.", type: "core" },
  { name: "Flutter Kicks", duration_seconds: 40, instructions: "Lie flat, raise legs slightly, kick alternately. Keep lower back down.", type: "core" },
  { name: "V-Ups", duration_seconds: 35, instructions: "Lie flat, simultaneously lift legs and torso to touch toes. Controlled descent.", type: "core" },
  { name: "Side Plank (Each Side)", duration_seconds: 30, instructions: "Hold side plank on each side. Stack your feet and keep hips high.", type: "core" },
  { name: "Hollow Hold", duration_seconds: 40, instructions: "Lie on back, lift shoulders and legs off floor. Hold the banana shape.", type: "core" },
  { name: "Ab Wheel Rollouts", duration_seconds: 40, instructions: "Roll out as far as you can control, pull back with your abs. Use knees if needed.", type: "core" },
  { name: "Pallof Press", duration_seconds: 35, instructions: "Hold cable/band at chest, press straight out. Resist rotation. Each side.", type: "core" },
];
