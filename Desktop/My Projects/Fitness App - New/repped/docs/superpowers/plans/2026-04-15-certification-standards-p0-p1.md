# Certification Standards P0 + P1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement PAR-Q+ health screening (P0) and beginner phase progression system with deload verification (P1) to align the workout generator with NASM/NSCA/ACE/ISSA certification standards.

**Architecture:** PAR-Q+ adds a new onboarding step (step 2.5, between About You and Goals) that stores health flags in the Supabase profiles table. Phase progression adds a `training_phase` field to profiles and modifies the workout generator to produce phase-appropriate programming for beginners. Deload verification confirms the existing periodization system properly reduces volume.

**Tech Stack:** React Native (Expo), TypeScript, Zustand, Supabase (PostgreSQL), shared algorithms package

---

## File Structure

### P0: PAR-Q+ Health Screening
- **Create:** `apps/mobile/app/(onboarding)/step3-health.tsx` — New onboarding screen with PAR-Q+ questions
- **Modify:** `apps/mobile/app/(onboarding)/step3-goals.tsx` → rename route to `step4-goals.tsx`
- **Modify:** `apps/mobile/app/(onboarding)/step4-experience.tsx` → rename to `step5-experience.tsx`
- **Modify:** `apps/mobile/app/(onboarding)/step5-equipment.tsx` → rename to `step6-equipment.tsx`
- **Modify:** `apps/mobile/app/(onboarding)/step6-schedule.tsx` → rename to `step7-schedule.tsx`
- **Modify:** `apps/mobile/app/(onboarding)/step7-nutrition.tsx` → rename to `step8-nutrition.tsx`
- **Modify:** `apps/mobile/app/(onboarding)/step8-injuries.tsx` → rename to `step9-injuries.tsx`
- **Modify:** `packages/shared/src/stores/onboarding.ts` — Add `health_conditions` field, update `totalSteps` to 9
- **Create:** `packages/supabase/supabase/migrations/20260415000000_add_health_screening.sql` — Add columns to profiles

### P1a: Beginner Phase Progression
- **Create:** `packages/shared/src/constants/training-phases.ts` — Phase definitions (NASM OPT-aligned)
- **Modify:** `packages/shared/src/algorithms/workout-generator.ts` — Apply phase-specific volume/exercise rules
- **Modify:** `packages/shared/src/index.ts` — Export new constants
- **Create:** `packages/supabase/supabase/migrations/20260415100000_add_training_phase.sql` — Add training_phase to profiles

### P1b: Deload Verification
- **Modify:** (verification only — read `packages/shared/src/algorithms/periodization.ts` and confirm deload math)

---

## Task 1: Supabase Migration — Health Screening + Training Phase

**Files:**
- Create: `packages/supabase/supabase/migrations/20260415000000_add_health_screening.sql`
- Create: `packages/supabase/supabase/migrations/20260415100000_add_training_phase.sql`

- [ ] **Step 1: Create health screening migration**

```sql
-- 20260415000000_add_health_screening.sql
-- PAR-Q+ health screening fields
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS health_conditions TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS health_cleared BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS health_screening_completed BOOLEAN DEFAULT FALSE;

-- health_conditions stores PAR-Q+ flags:
-- 'heart_condition', 'chest_pain_activity', 'chest_pain_rest',
-- 'dizziness', 'bone_joint', 'blood_pressure_meds', 'other_reason'
-- health_cleared = false means user answered YES to any PAR-Q question
-- and should see a "consult your doctor" notice
```

- [ ] **Step 2: Create training phase migration**

```sql
-- 20260415100000_add_training_phase.sql
-- NASM OPT-aligned training phase tracking
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS training_phase TEXT DEFAULT 'stabilization'
    CHECK (training_phase IN ('stabilization', 'strength_endurance', 'hypertrophy', 'strength', 'power')),
  ADD COLUMN IF NOT EXISTS phase_start_date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS phase_week INTEGER DEFAULT 1;

-- Beginners start in 'stabilization' (NASM Phase 1)
-- Intermediates start in 'hypertrophy' (NASM Phase 3)
-- Advanced start in 'hypertrophy' (NASM Phase 3)
```

- [ ] **Step 3: Apply migrations via Supabase MCP**

Run both migrations against the Supabase project.

- [ ] **Step 4: Commit**

```bash
git add packages/supabase/supabase/migrations/20260415000000_add_health_screening.sql packages/supabase/supabase/migrations/20260415100000_add_training_phase.sql
git commit -m "feat: add health screening and training phase columns to profiles"
```

---

## Task 2: Update Onboarding Store

**Files:**
- Modify: `packages/shared/src/stores/onboarding.ts`

- [ ] **Step 1: Read the current store**

Read `packages/shared/src/stores/onboarding.ts` to see exact current structure.

- [ ] **Step 2: Add health_conditions field and update totalSteps**

In the `OnboardingData` interface, add after the `height_cm` field:

```typescript
// Health screening (PAR-Q+)
health_conditions: string[];
health_cleared: boolean;
```

In the initial state, add:

```typescript
health_conditions: [],
health_cleared: true,
```

Change `totalSteps` from `8` to `9`.

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/stores/onboarding.ts
git commit -m "feat: add health screening fields to onboarding store"
```

---

## Task 3: Rename Onboarding Steps 3-8 → 4-9

**Files:**
- Rename: `step3-goals.tsx` → `step4-goals.tsx`
- Rename: `step4-experience.tsx` → `step5-experience.tsx`
- Rename: `step5-equipment.tsx` → `step6-equipment.tsx`
- Rename: `step6-schedule.tsx` → `step7-schedule.tsx`
- Rename: `step7-nutrition.tsx` → `step8-nutrition.tsx`
- Rename: `step8-injuries.tsx` → `step9-injuries.tsx`

- [ ] **Step 1: Rename all files**

```bash
cd apps/mobile/app/\(onboarding\)
mv step3-goals.tsx step4-goals.tsx
mv step4-experience.tsx step5-experience.tsx
mv step5-equipment.tsx step6-equipment.tsx
mv step6-schedule.tsx step7-schedule.tsx
mv step7-nutrition.tsx step8-nutrition.tsx
mv step8-injuries.tsx step9-injuries.tsx
```

- [ ] **Step 2: Update router.push() navigation in each file**

In each renamed file, update the `router.push()` call to point to the next step:
- `step2-about.tsx`: change `step3-goals` → `step3-health`
- `step4-goals.tsx`: change `step4-experience` → `step5-experience`
- `step5-experience.tsx`: change `step5-equipment` → `step6-equipment`
- `step6-equipment.tsx`: change `step6-schedule` → `step7-schedule`
- `step7-schedule.tsx`: change `step7-nutrition` → `step8-nutrition`
- `step8-nutrition.tsx`: change `step8-injuries` → `step9-injuries`

Also update `router.back()` or `prevStep()` references if any exist.

- [ ] **Step 3: Update the onboarding _layout.tsx if it references step filenames**

Read `apps/mobile/app/(onboarding)/_layout.tsx` and update any step filename references.

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/app/\(onboarding\)/
git commit -m "refactor: renumber onboarding steps 3-8 to 4-9 for health screening insertion"
```

---

## Task 4: Create PAR-Q+ Health Screening Screen

**Files:**
- Create: `apps/mobile/app/(onboarding)/step3-health.tsx`

- [ ] **Step 1: Create the health screening screen**

Build a new onboarding screen that asks the 7 PAR-Q+ questions. Each question is yes/no. The UI should match the existing onboarding style (use `OnboardingLayout` component, same colors from `C` object pattern used in other steps).

The 7 PAR-Q+ questions:

```typescript
const PARQ_QUESTIONS = [
  {
    id: "heart_condition",
    question: "Has a doctor ever said you have a heart condition and should only do doctor-recommended physical activity?",
    short: "Heart condition",
  },
  {
    id: "chest_pain_activity",
    question: "Do you feel pain in your chest when you do physical activity?",
    short: "Chest pain during activity",
  },
  {
    id: "chest_pain_rest",
    question: "In the past month, have you had chest pain when not doing physical activity?",
    short: "Chest pain at rest",
  },
  {
    id: "dizziness",
    question: "Do you lose your balance because of dizziness, or do you ever lose consciousness?",
    short: "Dizziness or fainting",
  },
  {
    id: "bone_joint",
    question: "Do you have a bone or joint problem that could be made worse by physical activity?",
    short: "Bone or joint problems",
  },
  {
    id: "blood_pressure_meds",
    question: "Is your doctor currently prescribing medication for your blood pressure or heart condition?",
    short: "Blood pressure medication",
  },
  {
    id: "other_reason",
    question: "Do you know of any other reason why you should not do physical activity?",
    short: "Other concerns",
  },
];
```

The screen should:
1. Show each question with a Yes/No toggle (matching onboarding design)
2. Track which questions have "Yes" answers in an array
3. On continue:
   - Save `health_conditions` (array of question IDs with "Yes") and `health_cleared` (true if all "No") to onboarding store
   - If ANY "Yes": show a modal/alert saying "We recommend consulting your doctor before starting an exercise program. You can still continue, but please exercise with caution." with "I Understand" button
   - Navigate to `step4-goals`
4. Use the same `OnboardingLayout` wrapper as other steps
5. Read `step2-about.tsx` for the exact style pattern to follow

- [ ] **Step 2: Verify navigation flow works**

The flow should be: step1-welcome → step2-about → **step3-health** → step4-goals → step5-experience → step6-equipment → step7-schedule → step8-nutrition → step9-injuries

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/app/\(onboarding\)/step3-health.tsx
git commit -m "feat: add PAR-Q+ health screening to onboarding (P0 — liability protection)"
```

---

## Task 5: Update Final Save (step9-injuries) to Include Health Data

**Files:**
- Modify: `apps/mobile/app/(onboarding)/step9-injuries.tsx`

- [ ] **Step 1: Read the renamed step9-injuries.tsx**

Read the file to see the exact Supabase upsert call.

- [ ] **Step 2: Add health fields to the profile upsert**

In the `supabase.from("profiles").upsert({...})` call, add:

```typescript
health_conditions: data.health_conditions,
health_cleared: data.health_cleared,
health_screening_completed: true,
// Set initial training phase based on experience
training_phase: data.training_history === "beginner" ? "stabilization" : "hypertrophy",
phase_start_date: new Date().toISOString().split("T")[0],
phase_week: 1,
```

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/app/\(onboarding\)/step9-injuries.tsx
git commit -m "feat: save health screening + training phase in profile upsert"
```

---

## Task 6: Create Training Phase Definitions

**Files:**
- Create: `packages/shared/src/constants/training-phases.ts`
- Modify: `packages/shared/src/index.ts`

- [ ] **Step 1: Create training phases constant file**

```typescript
// packages/shared/src/constants/training-phases.ts
//
// NASM OPT Model-aligned training phases.
// Beginners MUST start in stabilization before progressing to loaded training.
// This is the #1 requirement across NASM, ACE, NSCA, and ISSA certifications.

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
    setsMultiplier: number;   // multiply base sets
    repsMin: number;
    repsMax: number;
    rpeMax: number;
    restSecondsCompound: number;
    restSecondsIsolation: number;
  };
  tempo: string; // eccentric/isometric/concentric notation
  exerciseRules: {
    preferMachines: boolean;       // stable equipment first
    preferUnilateral: boolean;     // single-leg/arm work
    allowHeavyCompounds: boolean;  // barbell squat, deadlift, etc.
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
      setsMultiplier: 0.85,  // slightly less volume
      repsMin: 12,
      repsMax: 20,
      rpeMax: 6.5,           // 3-4 RIR — learning form, never near failure
      restSecondsCompound: 60,
      restSecondsIsolation: 45,
    },
    tempo: "4/2/1", // slow eccentric, pause, controlled concentric
    exerciseRules: {
      preferMachines: true,
      preferUnilateral: false,
      allowHeavyCompounds: false, // NO barbell squats, deadlifts
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
      preferUnilateral: false,
      allowHeavyCompounds: true, // can now do compounds
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
      preferUnilateral: false,
      allowHeavyCompounds: true,
      maxExercisesPerSession: 7,
    },
  },
  strength: {
    name: "Strength Phase",
    description: "Building maximal force production",
    durationWeeks: 4,
    nextPhase: "hypertrophy", // cycles back
    volume: {
      setsMultiplier: 1.0,
      repsMin: 1,
      repsMax: 6,
      rpeMax: 9,
      restSecondsCompound: 240,
      restSecondsIsolation: 120,
    },
    tempo: "X/X/X", // explosive
    exerciseRules: {
      preferMachines: false,
      preferUnilateral: false,
      allowHeavyCompounds: true,
      maxExercisesPerSession: 5,
    },
  },
  power: {
    name: "Power Phase",
    description: "Combining force with velocity for explosive performance",
    durationWeeks: 4,
    nextPhase: "hypertrophy", // cycles back
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
      preferUnilateral: false,
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
```

- [ ] **Step 2: Export from shared index**

In `packages/shared/src/index.ts`, add:

```typescript
export * from "./constants/training-phases";
```

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/constants/training-phases.ts packages/shared/src/index.ts
git commit -m "feat: add NASM OPT-aligned training phase definitions"
```

---

## Task 7: Integrate Training Phases into Workout Generator

**Files:**
- Modify: `packages/shared/src/algorithms/workout-generator.ts`

- [ ] **Step 1: Read the current generator**

Read `packages/shared/src/algorithms/workout-generator.ts` — focus on the `GeneratorInput` interface (lines 23-34) and the `getPositionalVolume` function.

- [ ] **Step 2: Add training phase to GeneratorInput**

In the `GeneratorInput` interface, add:

```typescript
trainingPhase?: TrainingPhase;
```

Add the import at the top:

```typescript
import { type TrainingPhase, TRAINING_PHASES } from "../constants/training-phases";
```

- [ ] **Step 3: Apply phase rules in the main generator function**

In `generateWorkoutPlan()`, after the existing variable setup (around line 519), add phase-aware overrides:

```typescript
// ── Phase-aware configuration (NASM OPT Model) ──
const phase = input.trainingPhase ?? (trainingHistory === "beginner" ? "stabilization" : "hypertrophy");
const phaseConfig = TRAINING_PHASES[phase];
```

Then modify the exercise filtering loop. Inside the `for (const mg of muscleGroups)` loop, after `filterExercises()` is called, add:

```typescript
// Phase rules: stabilization phase filters out heavy compounds
if (!phaseConfig.exerciseRules.allowHeavyCompounds) {
  available = available.filter(ex => {
    const name = ex.name.toLowerCase();
    // Remove heavy barbell compounds — replace with machine/dumbbell equivalents
    if (/\bbarbell\b/.test(name) && /\b(squat|deadlift|bench press|overhead press)\b/.test(name)) return false;
    return true;
  });
}

// Phase rules: prefer machines in stabilization
if (phaseConfig.exerciseRules.preferMachines) {
  // Boost machine exercises in scoring (handled in pickExercisesGoalAware)
  // This is already handled by AGE_PREFERRED_PATTERNS for seniors
  // Add similar boost for stabilization phase — done in step 4
}
```

- [ ] **Step 4: Apply phase volume overrides**

After the positional volume assignment loop (where `ex.targetSets`, `ex.targetReps`, etc. are set), apply phase overrides:

```typescript
// ── Phase volume overrides ──
ex.targetSets = Math.max(2, Math.round(ex.targetSets * phaseConfig.volume.setsMultiplier));
ex.targetReps = Math.max(phaseConfig.volume.repsMin, Math.min(ex.targetReps, phaseConfig.volume.repsMax));
ex.targetRpe = Math.min(ex.targetRpe, phaseConfig.volume.rpeMax);

// Phase-specific rest periods override goal-based rest
if (phase === "stabilization" || phase === "strength_endurance") {
  const isCompoundEx = isCompound(ex.exerciseName);
  ex.restSeconds = isCompoundEx
    ? phaseConfig.volume.restSecondsCompound
    : phaseConfig.volume.restSecondsIsolation;
}
```

- [ ] **Step 5: Apply phase exercise cap**

Replace the existing `maxExercises` calculation with phase-aware cap:

```typescript
// Phase-specific cap overrides the split-based cap
const phaseMax = phaseConfig.exerciseRules.maxExercisesPerSession;
maxExercises = Math.min(maxExercises, phaseMax);
```

- [ ] **Step 6: Add phase-aware scoring in pickExercisesGoalAware**

In the `pickExercisesGoalAware` function, the function signature doesn't have phase access. Instead, modify the scoring in `generateWorkoutPlan` after exercises are picked. Before the exercise sort, add:

```typescript
// Stabilization phase: prefer machine/cable exercises (stable, controlled)
if (phase === "stabilization") {
  const machinePreferred = /\bmachine\b|\bcable\b|\bseated\b|\bleg press\b|\bleg extension\b|\bleg curl\b|\blat pulldown\b|\bsmith\b/i;
  // Re-sort: machines before free weights, then by compound status
  exercises.sort((a, b) => {
    const aStable = machinePreferred.test(a.exerciseName) ? 0 : 1;
    const bStable = machinePreferred.test(b.exerciseName) ? 0 : 1;
    if (aStable !== bStable) return aStable - bStable;
    const aCompound = isCompound(a.exerciseName) ? 0 : 1;
    const bCompound = isCompound(b.exerciseName) ? 0 : 1;
    return aCompound - bCompound;
  });
}
```

Note: Only apply this special sort for stabilization phase. For all other phases, use the existing movement-priority sort.

- [ ] **Step 7: Commit**

```bash
git add packages/shared/src/algorithms/workout-generator.ts
git commit -m "feat: integrate NASM OPT training phases into workout generator"
```

---

## Task 8: Pass Training Phase from Generate Plan Screen

**Files:**
- Modify: `apps/mobile/app/(app)/generate-plan.tsx`

- [ ] **Step 1: Read generate-plan.tsx**

Read the file to see how `generateWorkoutPlan()` is called.

- [ ] **Step 2: Fetch training_phase from profile and pass to generator**

In the profile fetch query, add `training_phase` to the select:

```typescript
.select("..., training_phase, phase_start_date, phase_week")
```

Then pass it to `generateWorkoutPlan()`:

```typescript
const plan = generateWorkoutPlan({
  // ... existing fields ...
  trainingPhase: profile.training_phase ?? (profile.training_history === "beginner" ? "stabilization" : "hypertrophy"),
});
```

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/app/\(app\)/generate-plan.tsx
git commit -m "feat: pass training phase from profile to workout generator"
```

---

## Task 9: Verify Deload Implementation (P1b)

**Files:**
- Read: `packages/shared/src/algorithms/periodization.ts`

- [ ] **Step 1: Read and verify the periodization file**

Read `packages/shared/src/algorithms/periodization.ts`. Confirm:
1. Deload week (week 4) has volume multiplier of 0.5 (50% reduction)
2. Deload week has intensity multiplier of 0.75
3. RPE is reduced by 2.0
4. The `applyPeriodization()` function is actually called somewhere in the workout flow

- [ ] **Step 2: Verify deload is applied in the workout display**

Search for where `applyPeriodization` or `getPeriodization` is called in the app. It should be applied either in:
- The workout generator when creating plans
- The home screen when displaying today's workout
- The workout player when showing target sets/reps

If it's NOT being called anywhere, add a call in the home screen's `loadTodaysWorkout` function to apply periodization adjustments to the displayed exercise data.

- [ ] **Step 3: If deload is NOT applied, implement it**

In `apps/mobile/app/(app)/index.tsx`, in the `loadTodaysWorkout` function, after enriching exercises with weight suggestions, apply periodization:

```typescript
import { applyPeriodization } from "@repped/shared";

// After enrichedExercises are built:
const weekNumber = Math.ceil((Date.now() - new Date(plan.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000)) || 1;
const periodization = applyPeriodization(/* base values */, weekNumber);
// Adjust sets/reps/RPE based on periodization phase
```

- [ ] **Step 4: Commit if changes were needed**

```bash
git add apps/mobile/app/\(app\)/index.tsx
git commit -m "fix: ensure deload periodization is applied to displayed workouts"
```

---

## Task 10: Display Health Warning + Phase Info on Home Screen

**Files:**
- Modify: `apps/mobile/app/(app)/index.tsx`

- [ ] **Step 1: Show health advisory banner for uncleared users**

In the home screen, after fetching the profile, check `health_cleared`. If `false`, show a subtle banner:

```typescript
{profile?.health_cleared === false && (
  <View style={{
    backgroundColor: "rgba(245,158,11,0.1)",
    borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: "rgba(245,158,11,0.2)",
    marginHorizontal: 24,
  }}>
    <Text style={{ fontSize: 13, color: "#92400E", lineHeight: 19 }}>
      Based on your health screening, we recommend consulting a doctor before intense exercise. Listen to your body and stop if you feel unwell.
    </Text>
  </View>
)}
```

- [ ] **Step 2: Show current training phase badge**

Near the hero text area, show the current phase name:

```typescript
{profile?.training_phase && profile.training_phase !== "hypertrophy" && (
  <View style={{
    backgroundColor: "rgba(52,211,153,0.1)",
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6,
    alignSelf: "flex-start", marginBottom: 8,
    marginHorizontal: 24,
  }}>
    <Text style={{ fontSize: 11, fontWeight: "700", color: theme.colors.trail, textTransform: "uppercase", letterSpacing: 1 }}>
      {TRAINING_PHASES[profile.training_phase]?.name ?? "Training"}
    </Text>
  </View>
)}
```

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/app/\(app\)/index.tsx
git commit -m "feat: display health advisory and training phase on home screen"
```

---

## Checklist Summary

### P0: PAR-Q+ Health Screening
- [ ] Task 1: Database migrations (health_conditions, training_phase columns)
- [ ] Task 2: Update onboarding store (add fields, update totalSteps)
- [ ] Task 3: Rename onboarding steps 3-8 → 4-9
- [ ] Task 4: Create PAR-Q+ health screening screen (step3-health.tsx)
- [ ] Task 5: Update final save to include health + phase data

### P1a: Beginner Phase Progression
- [ ] Task 6: Create training phase definitions (NASM OPT-aligned)
- [ ] Task 7: Integrate phases into workout generator
- [ ] Task 8: Pass training phase from generate-plan screen

### P1b: Deload Verification
- [ ] Task 9: Verify and fix deload implementation

### Integration
- [ ] Task 10: Display health warning + phase info on home screen
