# Revive — Session Context & Progress

**Last Updated:** 2026-03-23 (evening)
**App:** Revive — AI Fitness App (React Native / Expo / Supabase)
**Location:** `/Users/meherzan/Desktop/My Projects/Fitness App - New/repped/`

---

## Architecture

### Monorepo Structure
```
repped/
├── apps/mobile/          ← React Native Expo app
├── packages/shared/      ← Business logic, types, constants, algorithms
├── packages/supabase/    ← Database client
├── packages/ui/          ← Shared UI components
├── index.js              ← CRITICAL: Metro proxy entry (Expo SDK 54 workspace fix)
├── scripts/              ← Image generation scripts
├── BUSINESS_STRATEGY.md  ← Revenue/marketing plan
├── CLAUDE.md             ← Claude Code instructions
└── SESSION_CONTEXT.md    ← This file
```

### Critical Setup Notes
- **Metro Resolution Fix:** `index.js` at monorepo root proxies `expo-router/entry` because Expo SDK 54 workspace detection sets Metro root to monorepo root, not `apps/mobile/`. Without this file, Metro can't resolve any modules.
- **No `expo-linear-gradient` or `react-native-svg`:** These packages crash in Expo Go. All gradients/SVGs are simulated with pure Views.
- **No `react-native-reanimated`:** Worklet version mismatch with Expo Go. Use React Native's built-in `Animated` API only.
- **`twrnc` (not NativeWind):** Tailwind via `twrnc` package. Arbitrary hex like `bg-[#111118]` works but opacity modifiers like `bg-[#0090ff]/10` do NOT work. Use inline `{ backgroundColor: "rgba(...)" }` instead.

### Supabase
- **Project URL:** `https://ihsnqyjspbfgmanulejw.supabase.co`
- **Anon Key:** In `apps/mobile/.env`
- **NOT accessible via Supabase MCP** (different account than the one linked)
- Tables: profiles, workout_plans, workout_plan_exercises, exercises, set_logs, workout_logs, personal_records, progress_entries, wellness_logs, body_measurements, weekly_checkins, user_achievements, meal_plans

### API Keys
- **Gemini (paid):** `AIzaSyAcaiXT_K_1ujombea3IU7i3kvGO3-x9EQ` — supports Imagen 4.0 and Gemini 2.5 Flash Image
- **Gemini (free/old):** `AIzaSyBp2xgd0zDMAz1xEV7i-6aDn9zMB4ltI60` — rate limited
- **Google Places:** In `.env`

---

## Current Design System

### Theme: Light
- **Background:** `#FFFFFF` (pure white)
- **Card surfaces:** `#F2F2F7` or `#F5F5F8`
- **Text primary:** `#1C1C1E`
- **Text secondary:** `#8E8E93`
- **Text tertiary:** `#AEAEB2`, `#C7C7CC`
- **Accent:** `#6366F1` (soft indigo)
- **Dividers:** `#E5E5EA` or `#EBEBF0` at 0.5px

### Tab Bar
- Custom floating pill tab bar: `src/components/LiquidGlassTabBar.tsx`
- Uses React Native `Animated` API for sliding glass pill (NOT reanimated)
- Only 4 visible tabs: `index`, `meals`, `progress`, `settings`
- Other screens are `href: null` (hidden)
- Tab bar filters by `VISIBLE_TABS` constant (hardcoded names)

### Shared Styles
- `src/lib/styles.ts` — `glassCard`, `warmCard`, `innerCard`, `cardBase` constants
- `src/lib/tw.ts` — twrnc instance with custom tailwind config

---

## Features Implemented

### Shared Package (`packages/shared/src/`)

#### Algorithms
| File | Purpose |
|------|---------|
| `workout-generator.ts` | Generates weekly workout plans with compound-first ordering, multi-angle targeting, weekly schedule optimization |
| `periodization.ts` | 4-week mesocycle (intro/build/peak/deload) |
| `progression.ts` | Progressive overload — weight increment by completion rate |
| `adjustment.ts` | Weekly check-in difficulty adjustments |
| `readiness.ts` | Pre-workout readiness check (fresh/okay/sore/exhausted) |
| `missed-day.ts` | Missed workout handling (reschedule/merge/skip) |
| `meal-planner.ts` | Meal plan with cuisine preferences, date-seeded rotation, cuisine-diverse alternatives, incrementing regenerate counter |
| `finisher-generator.ts` | HIIT + core finisher blocks |
| `warmup-generator.ts` | Warmup/cooldown with stretch type validation |
| `stats.ts` | Exercise progress, session summaries, muscle group distribution, strength levels |
| `weight-suggestion.ts` | Starting weight based on body weight ratios |
| `tdee.ts` | Mifflin-St Jeor TDEE calculation |
| `macros.ts` | Protein/fat/carb distribution |
| `grocery-list.ts` | Grocery list with scaled quantities (cooking → grocery amounts) and price estimates |

#### Constants
| File | Purpose |
|------|---------|
| `meals.ts` | ~48 Western meal templates with full recipes. Has `cuisine?: string` field. |
| `indian-meals.ts` | 50 Indian meals (North/South/West/East) with verified macros. All audited for accuracy. |
| `cuisines.ts` | 9 cuisine options: indian_north, indian_south, indian_west, indian_east, mediterranean, east_asian, mexican, american, middle_eastern |
| `nutrition-tips.ts` | Goal-based nutrition guidance (plate method, 85/15 rule) |
| `nutrition-db.ts` | 100+ ingredient nutritional values (USDA/IFCT sourced) with `validateMealMacros()` |
| `guilt-free-meals.ts` | Monthly guilt-free meal tracking (3/month) |
| `focus-cues.ts` | Mind-muscle connection cues per exercise/muscle group |
| `finishers.ts` | HIIT + core finisher exercise library |
| `conditioning.ts` | Standalone conditioning day templates by equipment type |
| `movement-patterns.ts` | Exercise name → movement pattern inference |
| `achievements.ts` | 37 achievements with BadgeShape (circle/hexagon/shield/diamond), BadgeTier (starter/intermediate/advanced/elite), CATEGORY_ACCENT colors, CATEGORY_LABELS, TIER_LABELS |
| `injuries.ts` | Injury severity tiers and exercise filtering |
| `warmups.ts` | Warmup/cooldown routines with stretchType: "dynamic"/"static" |

#### Types
| File | Purpose |
|------|---------|
| `user.ts` | UserProfile with `cuisine_preferences: string[]`, `apple_health_connected: boolean` |
| `exercise.ts` | Exercise with muscle_group, equipment, difficulty, secondary_muscles |
| `workout.ts` | WorkoutPlan, WorkoutPlanExercise, WorkoutLog, SetLog |
| `meal.ts` | Meal, MealRecipe, Ingredient, MealPlan |
| `progress.ts` | PersonalRecord, BodyMeasurement, WellnessLog, WeeklySummary |
| `health.ts` | HealthData, calculateHealthReadiness (Apple Health prep) |
| `warmup.ts` | WarmUpExercise (stretchType: "dynamic"), CoolDownExercise (stretchType: "static") |

### Mobile App Screens (`apps/mobile/app/(app)/`)

| Screen | Key Features |
|--------|-------------|
| `index.tsx` | Home — Kinetic-inspired layout: weekly momentum header, week dates row, accent-bar workout title, exercise cards with images, floating "Start Workout" button. Has "Skip Today" with confirmation Alert. One-time cleanup useEffect for accidental skips. |
| `meals.tsx` | Cuisine selector (horizontal scrollable pills), meal category tabs (All/Breakfast/Lunch/Dinner/Snack), guilt-free countdown, nutrition guide (visual plate bars), real-time cuisine reload, restaurant search by food category |
| `progress.tsx` | Completion ring, blue heatmap, simplified 1RM ("~80 kg max"), volume with context, body measurements collapsed, weight history limited to 5 |
| `settings.tsx` | Apple-style grouped list with LiquidGlass cards, profile avatar |
| `workout-player.tsx` | Table-style set logger (SET/PREVIOUS/KG/REPS/CHECK), elapsed timer, set progress bar, green check animation, focus cue collapsible, HIIT finisher flow, "Yes! You did it." completion |
| `achievements.tsx` | PremiumBadge grid (circle/hexagon/shield/diamond shapes), tier ring colors, preview modal with Animated spring entrance, "How to unlock" hints |
| `grocery-list.tsx` | Scaled quantities, custom checkboxes, budget tips, nearby stores sorted by distance, "Find Stores" button |
| `recipe.tsx` | Light theme, step-by-step mode, prep/cook time pills |
| `warmup.tsx` / `cooldown.tsx` | Dynamic/static stretch type banners |
| `weekly-summary.tsx` | Motivational message by completion rate, volume comparison, highlight of the week |

### Key Components (`apps/mobile/src/components/`)

| Component | Purpose |
|-----------|---------|
| `ExerciseDetailCard.tsx` | Exercise card with bundled AI image, stat columns (SETS/REPS/WEIGHT), expandable details (focus cue, instructions, video link) |
| `LiquidGlassTabBar.tsx` | Floating pill tab bar with `Animated.spring` sliding highlight. Filters by `VISIBLE_TABS = ["index", "meals", "progress", "settings"]` |
| `PremiumBadge.tsx` | Multi-shape badges with darken/lighten helpers, tier ring colors, glow for earned |
| `BadgeIcon.tsx` | 20 View-based vector icons (dumbbell, flame, trophy, crown, star, etc.) |
| `MuscleIcon.tsx` | Geometric muscle group icons (fallback when no exercise image) |
| `LiquidGlass.tsx` | Glass card wrapper (light theme: `#F2F2F7` bg, 20px radius) |
| `HexBadge.tsx` | Legacy hex badge (kept but replaced by PremiumBadge) |
| `home/LayoutA.tsx` | Clean Hub layout (unused, kept for reference) |
| `home/LayoutB.tsx` | Current unused — home screen logic is now inline in index.tsx |
| `home/LayoutC.tsx` | Bold Minimal layout (unused, kept for reference) |
| `home/LayoutPicker.tsx` | Dot-based layout switcher (unused) |

### Utilities (`apps/mobile/src/lib/`)

| File | Purpose |
|------|---------|
| `deeplink.ts` | Smart deep linking — uses HTTPS universal links on iOS (YouTube, UberEats, DoorDash, Apple Maps). No custom URL schemes needed. |
| `exercise-images.ts` | Maps exercise names to bundled `require()` assets. Fuzzy matching: exact → cleaned → partial. Fallback returns `null`. |
| `styles.ts` | Design tokens: `glassCard`, `warmCard`, `innerCard`, `ACCENT`, `SCREEN_BG`, etc. |
| `places.ts` | Google Places API — restaurants (open only) and grocery stores (sorted by distance, open only) |
| `tw.ts` | twrnc Tailwind instance with custom config |

---

## Exercise Images — CURRENT STATUS

### Location
`apps/mobile/assets/exercises/` — 55 PNG images, bundled with app via `require()`.

### How They're Loaded
`src/lib/exercise-images.ts` exports `getExerciseImage(exerciseName)` which returns a `require()` source or `null`. The `ExerciseDetailCard` component tries this first, falls back to `MuscleIcon` geometric placeholder.

### Generation Infrastructure
- **Imagen 4.0 API:** `POST https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=AIzaSyAcaiXT_K_1ujombea3IU7i3kvGO3-x9EQ`
- **Parameters:** `{ sampleCount: 1, aspectRatio: "1:1", personGeneration: "allow_adult", safetySetting: "block_low_and_above" }`
- **Gemini Flash fallback:** `models/gemini-2.5-flash-image:generateContent` (lower quality but more flexible with prompts)

### Prompt Template (Male)
```
Professional fitness studio photography. Athletic male, medium muscular build, short dark hair, wearing fitted black t-shirt and dark grey athletic shorts, black training shoes. Clean light grey seamless studio background. Soft even studio lighting with no harsh shadows. Sharp focus. Full body visible and centered. No text, no logos, no watermarks, no labels, no annotations. Photorealistic.
[EXERCISE-SPECIFIC FORM DESCRIPTION]
```

### Scripts
| Script | Purpose |
|--------|---------|
| `scripts/imagen4-generate-all.js` | All 55 exercises with Imagen 4.0, form-specific prompts. Has `safetySetting: "block_low_and_above"`. |
| `scripts/imagen4-fix-problem.js` | 24 problem images regenerated with Imagen 4.0 |
| `scripts/imagen4-round3.js` | 5 hardest images (calf raise, dumbbell fly, diamond push-up, skull crusher, kickback) |
| `scripts/generate-exercise-images.js` | Original Gemini Flash script (legacy) |
| `scripts/regenerate-exercise-images.js` | Gemini Flash with detailed prompts (legacy) |
| `scripts/fix-4-exercises.js` | Gemini Flash fix for 4 exercises (legacy) |

### Image Quality Audit (as of Round 3)

**GOOD — Imagen 4.0 quality (24 images regenerated):**
- Hip Thrust: ⚠️ Back is against bench but hips not clearly elevated (best we got — AI struggles with this pose)
- Skull Crusher: ✅ Lying flat, EZ-bar visible, correct angle
- Calf Raise: ✅ On platform, dumbbells, proper form
- Dumbbell Fly: ✅ Lying flat, arms wide open (top-down angle)
- Diamond Push-Up: ❌ Generated a woman in a photo studio instead of exercise — needs re-run
- Kickback: Need to verify
- Barbell Row: ✅ Bent over, pulling barbell
- Cable Row: ✅ Seated at machine
- Romanian Deadlift: ✅ Hip hinge position
- Leg Curl: ✅ Lying prone on machine
- Rear Delt Fly: ✅ Bent over, arms wide
- All others from Round 2: ✅

**GOOD — Gemini Flash quality (31 images from initial batch):**
- These are lower quality than Imagen 4.0 but form is correct
- Inconsistency: different body types/appearances between Gemini Flash and Imagen 4.0 images

### KNOWN REMAINING ISSUES
1. **Diamond Push-Up** — Round 3 generated a woman in a photo studio (wrong). Needs another attempt.
2. **Consistency gap** — 31 images are Gemini Flash quality, 24 are Imagen 4.0 quality. They look different. Ideally regenerate ALL 55 with Imagen 4.0 for uniformity.
3. **Kickback** — Last round may have wrong form. Needs verification.
4. **Hip Thrust** — AI consistently struggles. Best result so far has back against bench but hips aren't clearly in the "bridge" position.

### NEXT STEPS for Images
1. **Fix Diamond Push-Up** — regenerate with Imagen 4.0
2. **Regenerate all 55 with Imagen 4.0** using `scripts/imagen4-generate-all.js` (update safetySetting to `block_low_and_above` first) for complete uniformity
3. **Generate female set** — duplicate all 55 with "athletic female" prompt for female users. Store in `assets/exercises/female/`. Show based on `profile.sex`.
4. **Add to exercise-images.ts** — update `getExerciseImage` to accept gender parameter

### To regenerate all with Imagen 4.0:
1. Edit `scripts/imagen4-generate-all.js`: change `safetySetting: "block_only_high"` → `"block_low_and_above"`
2. Run: `cd repped && node scripts/imagen4-generate-all.js`
3. Takes ~4-5 minutes (55 images × 3s delay)
4. Verify quality of all images
5. Force-close Expo Go and reopen

---

## Business Strategy
- See `BUSINESS_STRATEGY.md` for full plan
- Pricing: Free / Pro $6.99/mo / Elite $12.99/mo
- Key differentiator: Indian cuisine meal plans (4 regions, 50 recipes)
- Projected Year 1 revenue: ~$131K (conservative)

---

## How to Run

```bash
# Start Expo (from apps/mobile directory)
cd apps/mobile && npx expo start --clear

# If Metro can't resolve modules:
# 1. Ensure /repped/index.js exists (proxy entry point)
# 2. Kill all Metro: pkill -f metro
# 3. Clear caches: rm -rf apps/mobile/.expo apps/mobile/node_modules/.cache
# 4. Restart

# Generate exercise images (Imagen 4.0)
node scripts/imagen4-generate-all.js       # All 55 (edit safetySetting first!)
node scripts/imagen4-fix-problem.js        # 24 problem ones
node scripts/imagen4-round3.js             # 5 hardest ones

# TypeScript check
npx tsc --noEmit --project packages/shared/tsconfig.json
```

---

## Known Issues / Technical Debt
1. **Supabase types:** Many `as any` casts — no generated types for Supabase client
2. **One-time cleanup code:** `index.tsx` has useEffect that deletes accidental skip logs — should be removed
3. **Exercise images:** Diamond push-up needs regeneration; ideally regenerate ALL 55 with Imagen 4.0
4. **Onboarding screens:** Still dark theme (`bg-gray-900`), not converted to light
5. **Auth screens:** Still dark theme
6. **Unused layout components:** `LayoutA.tsx`, `LayoutB.tsx`, `LayoutC.tsx`, `LayoutPicker.tsx` — can be deleted
7. **Pre-workout readiness check:** Removed from home screen — could be added to workout-player pre-flow
8. **`expo-linear-gradient` and `react-native-svg`:** Installed in node_modules but NOT usable in Expo Go
9. **Meal category tabs:** "All" tab works, individual category tabs filter correctly but don't scroll to the filtered meal
10. **Skip button:** Has confirmation Alert now but the one-time cleanup useEffect should be removed after confirmed
