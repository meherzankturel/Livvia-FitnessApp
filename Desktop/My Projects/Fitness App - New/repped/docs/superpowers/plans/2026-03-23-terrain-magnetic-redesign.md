# Terrain × Magnetic Full App Redesign

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign every screen in the Livvia fitness app using the Terrain × Magnetic design language — earthy expedition palette, bento widgets, trail-style layouts, expandable exercise cards, living organism animations, and personal messaging.

**Architecture:** Foundation-first approach. Build a shared design system (theme, animation utilities, base components) first, then rewrite screens starting with the highest-impact pages. Each screen gets the terrain palette (#2D2A24 earth, #F6F5F0 sand, #34D399 trail), topographic background texture, bento widget patterns, and choreographed animations using React Native's Animated API.

**Tech Stack:** React Native 0.81, Expo SDK 54, Expo Router 6, twrnc, Zustand, Supabase, React Native Animated API (no reanimated worklets, no SVG, no linear-gradient)

---

## Phase 1: Design System Foundation

### Task 1: New Theme Constants

**Files:**
- Modify: `apps/mobile/src/lib/styles.ts`

Replace the entire color/style system with Terrain × Magnetic tokens.

- [ ] **Step 1: Replace color palette in styles.ts**

```typescript
// Terrain × Magnetic Design Tokens
export const theme = {
  colors: {
    earth: '#2D2A24',
    sand: '#F6F5F0',
    trail: '#34D399',
    rock: '#8E8E7A',
    stone: '#EDEBE5',
    accent: '#6366F1',
    accentLight: '#818CF8',

    // Semantic
    success: '#34D399',
    warning: '#F59E0B',
    error: '#EF4444',

    // Text
    textPrimary: '#2D2A24',
    textSecondary: '#8E8E7A',
    textTertiary: '#AEAEB2',
    textOnDark: '#F6F5F0',
    textOnDarkMuted: 'rgba(246,245,240,0.35)',

    // Backgrounds
    bg: '#F6F5F0',
    bgCard: '#FFFFFF',
    bgWidget: '#EDEBE5',
    bgDark: '#2D2A24',

    // Borders
    border: 'rgba(0,0,0,0.04)',
    borderLight: '#DDD9CE',

    // Muscle group tints (for exercise cards)
    muscleTints: {
      chest: { bg: '#E8E4F8', tint: '#6366F1' },
      shoulders: { bg: '#FEF3C7', tint: '#F59E0B' },
      back: { bg: '#D1FAE5', tint: '#34D399' },
      legs: { bg: '#FEE2E2', tint: '#EF4444' },
      arms: { bg: '#E0E7FF', tint: '#818CF8' },
      core: { bg: '#FEF3C7', tint: '#F59E0B' },
      default: { bg: '#EDEBE5', tint: '#8E8E7A' },
    },
  },

  // Consistent radii
  radii: {
    sm: 12,
    md: 18,
    lg: 22,
    xl: 24,
    pill: 100,
    phone: 48,
  },

  // Animation configs
  animation: {
    heartbeat: 2400,
    spring: { damping: 18, stiffness: 180, mass: 0.8 },
    springBouncy: { damping: 12, stiffness: 200, mass: 0.6 },
    staggerDelay: 80,
  },

  // Typography
  type: {
    hero: { fontSize: 26, fontWeight: '700' as const, letterSpacing: -0.8, lineHeight: 30 },
    sectionTitle: { fontSize: 14, fontWeight: '700' as const, color: '#2D2A24' },
    widgetNum: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -1.5 },
    label: { fontSize: 9, fontWeight: '600' as const, textTransform: 'uppercase' as const, letterSpacing: 1 },
    body: { fontSize: 14, fontWeight: '400' as const, color: '#2D2A24' },
    meta: { fontSize: 11, color: '#8E8E7A' },
  },
} as const;
```

- [ ] **Step 2: Add shared card/widget style presets**

```typescript
export const cards = {
  widget: {
    borderRadius: theme.radii.lg,
    padding: 16,
    overflow: 'hidden' as const,
  },
  exercise: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    overflow: 'hidden' as const,
  },
  dark: {
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.earth,
    padding: 16,
    overflow: 'hidden' as const,
  },
};
```

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/lib/styles.ts
git commit -m "feat: replace design system with Terrain × Magnetic tokens"
```

---

### Task 2: Animation Utilities

**Files:**
- Create: `apps/mobile/src/lib/animations.ts`

Centralized animation helpers that every screen will use.

- [ ] **Step 1: Create animations.ts**

```typescript
import { Animated, Easing } from 'react-native';
import { theme } from './styles';

// Heartbeat — shared pulsing value (2.4s cycle)
export function createHeartbeat(): Animated.Value {
  const val = new Animated.Value(0);
  Animated.loop(
    Animated.sequence([
      Animated.timing(val, { toValue: 1, duration: theme.animation.heartbeat * 0.3, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(val, { toValue: 0, duration: theme.animation.heartbeat * 0.7, easing: Easing.in(Easing.ease), useNativeDriver: true }),
    ])
  ).start();
  return val;
}

// Staggered entrance — returns array of Animated.Values for opacity+translateY
export function createStaggerEntrance(count: number, delay = theme.animation.staggerDelay): { opacities: Animated.Value[]; translateYs: Animated.Value[] } {
  const opacities = Array.from({ length: count }, () => new Animated.Value(0));
  const translateYs = Array.from({ length: count }, () => new Animated.Value(20));

  const animations = opacities.map((opacity, i) =>
    Animated.delay(i * delay,
      Animated.parallel([
        Animated.spring(opacity, { toValue: 1, ...theme.animation.springBouncy, useNativeDriver: true }),
        Animated.spring(translateYs[i], { toValue: 0, ...theme.animation.springBouncy, useNativeDriver: true }),
      ])
    )
  );
  Animated.stagger(delay, animations).start();
  return { opacities, translateYs };
}

// Spring scale — for widget pop-in
export function springIn(val: Animated.Value, delay = 0): void {
  Animated.sequence([
    Animated.delay(delay),
    Animated.spring(val, { toValue: 1, ...theme.animation.springBouncy, useNativeDriver: true }),
  ]).start();
}

// Pulse animation for trail dots, alive indicators
export function createPulse(val: Animated.Value): void {
  Animated.loop(
    Animated.sequence([
      Animated.timing(val, { toValue: 1.35, duration: theme.animation.heartbeat * 0.3, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(val, { toValue: 1, duration: theme.animation.heartbeat * 0.7, easing: Easing.in(Easing.ease), useNativeDriver: true }),
    ])
  ).start();
}

// Bar grow — for volume chart
export function growBar(val: Animated.Value, delay = 0): void {
  Animated.sequence([
    Animated.delay(delay),
    Animated.spring(val, { toValue: 1, damping: 14, stiffness: 120, mass: 0.8, useNativeDriver: true }),
  ]).start();
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/src/lib/animations.ts
git commit -m "feat: add shared animation utilities (heartbeat, stagger, spring)"
```

---

### Task 3: TopoBackground Component

**Files:**
- Create: `apps/mobile/src/components/terrain/TopoBackground.tsx`

Reusable topographic contour background that goes behind every screen.

- [ ] **Step 1: Create TopoBackground.tsx**

Renders 4-6 absolutely positioned large rounded Views at 2% opacity that slowly animate position. This is the "topographic contour lines" effect.

Key implementation:
- Absolute fill container with `pointerEvents: 'none'`
- 4 large borderRadius-50% Views with `borderWidth: 1, borderColor: theme.colors.earth, opacity: 0.02`
- Positioned at corners with negative offsets (e.g., top: -100, left: -100)
- No animation initially (static is fine — animation can be added later)

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/src/components/terrain/TopoBackground.tsx
git commit -m "feat: add TopoBackground contour line component"
```

---

### Task 4: TrailLine Component

**Files:**
- Create: `apps/mobile/src/components/terrain/TrailLine.tsx`

The vertical trail line with animated green pulse that connects exercise waypoints.

- [ ] **Step 1: Create TrailLine.tsx**

Key implementation:
- Absolutely positioned container (left: 39px, top to bottom)
- 2px wide sand-colored (#DDD9CE) vertical line
- 4px wide, 20px tall green (#34D399) dot that animates translateY from top to bottom in a loop (4s duration)
- Uses Animated.loop with Animated.timing

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/src/components/terrain/TrailLine.tsx
git commit -m "feat: add TrailLine animated component"
```

---

### Task 5: BentoWidget Component

**Files:**
- Create: `apps/mobile/src/components/terrain/BentoWidget.tsx`

Reusable bento grid widget cell (used for streak, momentum, volume, etc.).

- [ ] **Step 1: Create BentoWidget.tsx**

Props: `variant: 'dark' | 'stone'`, `children`, `style`

- Dark variant: earth background, sand text
- Stone variant: stone background, earth text
- Shared: borderRadius 20, padding 16, overflow hidden
- Entrance animation: scale from 0.92 → 1 with springBouncy

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/src/components/terrain/BentoWidget.tsx
git commit -m "feat: add BentoWidget reusable component"
```

---

### Task 6: AliveDot Component

**Files:**
- Create: `apps/mobile/src/components/terrain/AliveDot.tsx`

The pulsing green dot used in status bars and readiness indicators.

- [ ] **Step 1: Create AliveDot.tsx**

- 6px green circle
- Animated scale pulsing on heartbeat rhythm (1 → 1.35 → 1)
- Optionally accepts a label string to render next to it

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/src/components/terrain/AliveDot.tsx
git commit -m "feat: add AliveDot pulsing indicator"
```

---

### Task 7: ExpandableExerciseCard Component

**Files:**
- Create: `apps/mobile/src/components/terrain/ExpandableExerciseCard.tsx`

The star component — collapsed waypoint row that expands to full detail view.

- [ ] **Step 1: Create ExpandableExerciseCard.tsx**

This is the most complex component. Props:
```typescript
interface Props {
  exercise: Exercise;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  lastSession?: { weight: number; reps: number };
  suggestedWeight: number;
  focusCue: string;
  muscleGroup: string;
}
```

**Collapsed state (default):**
- 56×56 thumbnail with muscle-group color tint + exercise image
- Exercise name, meta line (muscle · sets×reps)
- Weight display (right-aligned)
- Chevron indicator
- Press feedback: scale to 0.97

**Expanded state:**
- Full-width 180px image area with muscle tint background + exercise image
- Close button (top-right)
- Muscle + type tags (colored pills)
- Exercise name (20px bold)
- Stats grid: 3-column (Sets / Reps / kg) in stone-colored cells
- Set progress pips (horizontal bars)
- Focus cue card (green-tinted, terrain style)
- Last session reference ("75kg × 8 reps · Today: +2.5kg")

**Animation choreography (Animated API):**
- Expand: Animated.Value for height/opacity, staggered children using Animated.stagger
- Collapse: reverse — children fade, then card shrinks, then collapsed row springs in
- Only relies on opacity + translateY + scale (all nativeDriver compatible)

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/src/components/terrain/ExpandableExerciseCard.tsx
git commit -m "feat: add ExpandableExerciseCard with collapse/expand animations"
```

---

### Task 8: VolumeChart Component

**Files:**
- Create: `apps/mobile/src/components/terrain/VolumeChart.tsx`

Weekly volume bar chart — bars as mountain range, green "today" bar with pinging dot.

- [ ] **Step 1: Create VolumeChart.tsx**

Props: `data: { day: string; volume: number; status: 'done' | 'today' | 'rest' | 'future' | 'plan' }[]`

- Stone background card with rounded corners
- 7 columns (Mon-Sun), each a vertical bar
- Bar height proportional to volume (max = 100% of 90px container)
- Colors: earth (done), trail (today), #D6D3CA (rest), rgba earth 0.08 (future)
- Today bar gets a pinging green dot on top (animated scale pulse)
- Bars animate from scaleY(0) → scaleY(1) with staggered delays
- Day labels + volume labels below each bar

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/src/components/terrain/VolumeChart.tsx
git commit -m "feat: add VolumeChart weekly bar component"
```

---

### Task 9: Update Tab Bar Theme

**Files:**
- Modify: `apps/mobile/src/components/LiquidGlassTabBar.tsx`

- [ ] **Step 1: Update LiquidGlassTabBar colors to terrain palette**

Change:
- Background from `rgba(255,255,255,0.92)` → `rgba(246,245,240,0.94)` (sand tint)
- Active pill color from `#6366F1` → `#2D2A24` (earth)
- Active icon/label color → `#F6F5F0` (sand, for contrast on dark pill)
- Inactive icon/label color → `#8E8E7A` (rock)
- Border → `rgba(45,42,36,0.06)`

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/src/components/LiquidGlassTabBar.tsx
git commit -m "feat: update tab bar to terrain palette"
```

---

## Phase 2: Home Screen Rewrite

### Task 10: Rewrite Home Screen

**Files:**
- Rewrite: `apps/mobile/app/(app)/index.tsx`
- Delete (or ignore): `apps/mobile/src/components/home/LayoutA.tsx`, `LayoutB.tsx`, `LayoutC.tsx`, `LayoutPicker.tsx`

- [ ] **Step 1: Rewrite index.tsx with Terrain × Magnetic layout**

The home screen follows our finalized mockup exactly:

1. **TopoBackground** — contour lines behind everything
2. **Status bar** — time + AliveDot with "Fresh" label (from readiness data)
3. **Personal hero** — context line (day · focus · week), data-driven message with green highlight
4. **Bento widgets** — 3-column grid: streak (dark), days (stone), volume (stone with trend)
5. **VolumeChart** — weekly volume bars with today indicator
6. **Trail section** — header ("Today's Route" + count), TrailLine, ExpandableExerciseCard for each exercise
7. **Finish marker** — flag emoji + "Summit — complete all 5"
8. **CTA button** — "Begin Ascent →" with earth background, subtle glow pulse

Key data wiring:
- Hero message: generate from streak count, PR proximity, completion rate (use existing Supabase data)
- Widgets: pull from existing workout_logs, progress_entries
- Exercises: from existing workout plan data (same data as before, new UI)
- Volume chart: aggregate set_logs per day for current week

- [ ] **Step 2: Remove old layout picker components**

Delete LayoutA, LayoutB, LayoutC, LayoutPicker — no longer needed.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/app/\(app\)/index.tsx
git rm apps/mobile/src/components/home/Layout*.tsx
git commit -m "feat: rewrite Home Screen with Terrain × Magnetic design"
```

---

## Phase 3: Progress Screen

### Task 11: Rewrite Progress Screen

**Files:**
- Rewrite: `apps/mobile/app/(app)/progress.tsx`

- [ ] **Step 1: Redesign progress.tsx**

Terrain-styled layout:
1. **TopoBackground**
2. **Header** — "Your Journey" with context line
3. **Bento grid** (2×2):
   - Completion ring (dark widget, large %, animated fill)
   - Streak count (dark widget)
   - Volume trend (stone widget with spark bars)
   - Workout count (stone widget)
4. **Heatmap** — 12-week grid with terrain colors (earth = workout, stone = rest, trail = today). Cells animate in with staggered pop.
5. **Weight section** — current weight display with log button, trend arrow
6. **1RM estimates** — trail-style cards (waypoint layout without trail line)
7. **Recent PRs** — expandable list with celebration indicators
8. **Body measurements** — collapsible accordion

Same data, new visuals. Keep all existing Supabase queries.

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/app/\(app\)/progress.tsx
git commit -m "feat: rewrite Progress Screen with terrain bento layout"
```

---

## Phase 4: Meals Screen

### Task 12: Rewrite Meals Screen

**Files:**
- Rewrite: `apps/mobile/app/(app)/meals.tsx`

- [ ] **Step 1: Redesign meals.tsx**

Terrain-styled layout:
1. **TopoBackground**
2. **Header** — "Today's Fuel" with terrain language
3. **Macro bento** — 4-column compact widgets (Calories, Protein, Carbs, Fat) in stone cells
4. **Meal trail** — 4 meal slots (Breakfast → Lunch → Dinner → Snack) as a vertical trail:
   - Trail line connecting meal waypoints
   - Each meal: expandable card with collapsed thumbnail + name + macros, expanded shows full recipe info, cook/eatout toggle, alternatives
5. **Grocery link** — earth-colored card at bottom linking to grocery list
6. Keep all existing modals (allergy, cuisine, alternatives) but restyle to terrain palette

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/app/\(app\)/meals.tsx
git commit -m "feat: rewrite Meals Screen with trail-style meal slots"
```

---

## Phase 5: Settings Screen

### Task 13: Rewrite Settings Screen

**Files:**
- Rewrite: `apps/mobile/app/(app)/settings.tsx`

- [ ] **Step 1: Redesign settings.tsx**

Clean terrain-themed settings:
1. **TopoBackground**
2. **Profile card** (earth bg) — avatar initial circle, name, email, goal badge, training level
3. **Settings groups** — stone-colored grouped rows with earth text:
   - Workout: Equipment, Days/Week, Calories
   - Actions: Regenerate Plan, Weekly Check-in
   - Links: Achievements, Weekly Summary
4. **Sign Out** — outlined red button at bottom

Styling: all rows use stone background, earth text, rock secondary text, subtle dividers.

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/app/\(app\)/settings.tsx
git commit -m "feat: rewrite Settings Screen with terrain theme"
```

---

## Phase 6: Workout Player

### Task 14: Rewrite Workout Player

**Files:**
- Rewrite: `apps/mobile/app/(app)/workout-player.tsx`

- [ ] **Step 1: Redesign workout-player.tsx**

This is the largest and most critical screen. Trail-themed workout flow:

**Exercise state:**
1. **Header** — elapsed time badge, exercise counter ("2 of 5"), trail progress bar (earth fill on stone track)
2. **Exercise hero** — full-width muscle-tinted image area (same as expanded card), exercise name, muscle tags
3. **Focus cue** — green-tinted terrain card
4. **Set table** — stone-colored rows: SET | PREVIOUS | KG | REPS | ✓
   - Current set row highlighted with subtle trail-green left border
   - Completed sets: earth checkmark, slight dim
   - Input fields: stone background, earth text
5. **Log Set button** — earth CTA
6. **Swap exercise** — rock-colored text button

**Rest timer state:**
- Large countdown number (earth, 48px bold)
- "Next up:" preview card
- Skip button (outlined rock)
- Background: sand with topo contours

**Completion state:**
- Celebration with terrain language ("Summit reached!")
- Stats in bento grid (exercises, duration, volume)
- Cool Down button (trail green) + Skip (rock outlined)

Keep all existing logic (PR detection, vibration, finisher flow). Only change visuals.

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/app/\(app\)/workout-player.tsx
git commit -m "feat: rewrite Workout Player with terrain trail design"
```

---

## Phase 7: Secondary Screens

### Task 15: Achievements Screen

**Files:**
- Rewrite: `apps/mobile/app/(app)/achievements.tsx`

- [ ] **Step 1: Redesign achievements.tsx**

Terrain-themed badge collection:
- TopoBackground
- Header with overall progress (earth-colored ring)
- Tier legend: earth dots with tier names
- Category sections with trail-colored accent bars
- Badge grid with PremiumBadge (keep existing component, update colors)
- Modal: terrain-styled with earth header, stone body

- [ ] **Step 2: Commit**

### Task 16: Grocery List Screen

**Files:**
- Rewrite: `apps/mobile/app/(app)/grocery-list.tsx`

- [ ] **Step 1: Redesign grocery-list.tsx**

Trail-style grocery checklist:
- TopoBackground
- Header with progress count
- Items grouped by category in stone cards
- Checkbox: trail-green when checked
- Price display in rock color
- Nearby stores: earth-colored cards with distance

- [ ] **Step 2: Commit**

### Task 17: Recipe Screen

**Files:**
- Rewrite: `apps/mobile/app/(app)/recipe.tsx`

- [ ] **Step 1: Redesign recipe.tsx**

Terrain recipe viewer:
- Full-width image area at top
- Prep/cook time in stone pills
- Ingredients in stone table
- Steps as trail waypoints (numbered dots + step cards)
- YouTube button: earth-colored

- [ ] **Step 2: Commit**

### Task 18: Remaining Secondary Screens

**Files:**
- Modify: `apps/mobile/app/(app)/wellness.tsx`
- Modify: `apps/mobile/app/(app)/weekly-summary.tsx`
- Modify: `apps/mobile/app/(app)/checkin.tsx`
- Modify: `apps/mobile/app/(app)/cooldown.tsx`
- Modify: `apps/mobile/app/(app)/warmup.tsx`
- Modify: `apps/mobile/app/(app)/injury-check.tsx`

- [ ] **Step 1: Apply terrain palette to all secondary screens**

For each: replace colors (white bg → sand, gray cards → stone, indigo accent → earth/trail), add TopoBackground, update text colors to earth/rock hierarchy. These are simpler screens so the changes are mostly color/spacing swaps.

- [ ] **Step 2: Commit each screen individually**

---

## Phase 8: Onboarding

### Task 19: Redesign Onboarding Flow

**Files:**
- Modify: `apps/mobile/app/(onboarding)/step1-basics.tsx` through `step7-diet.tsx`

- [ ] **Step 1: Update onboarding theme**

Keep dark background but with terrain styling:
- Background: `#0C0C0F` (near-black)
- Primary text: `#F6F5F0` (sand)
- Active/selected states: `#34D399` (trail green) instead of indigo
- Inactive: `rgba(246,245,240,0.15)`
- Input fields: `rgba(246,245,240,0.06)` background
- Continue button: trail green background
- Progress indicator: trail dots instead of "Step X of 7" text — 7 small dots, filled up to current step
- Subtle topo contour lines at very low opacity (1%) on dark background

Apply to all 7 steps. The layout structure stays the same — only colors and accent treatment change.

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/app/\(onboarding\)/
git commit -m "feat: update onboarding to terrain dark theme"
```

---

## Phase 9: Auth Screens

### Task 20: Redesign Auth Screens

**Files:**
- Modify: `apps/mobile/app/(auth)/sign-in.tsx`
- Modify: `apps/mobile/app/(auth)/sign-up.tsx`

- [ ] **Step 1: Update auth theme**

Same dark treatment as onboarding:
- Background: `#0C0C0F`
- Text: sand (#F6F5F0)
- Input fields: low-opacity sand bg
- Primary button: trail green
- Secondary link: rock color
- Error text: #EF4444
- Add subtle topo contours

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/app/\(auth\)/
git commit -m "feat: update auth screens to terrain dark theme"
```

---

## Phase 10: Component Cleanup

### Task 21: Update Remaining Shared Components

**Files:**
- Modify: `apps/mobile/src/components/ProgressRing.tsx` — earth/trail colors
- Modify: `apps/mobile/src/components/StatCard.tsx` — stone bg, earth text
- Modify: `apps/mobile/src/components/AccentButton.tsx` — earth primary, trail secondary
- Modify: `apps/mobile/src/components/LiquidGlass.tsx` — update tints to terrain palette
- Modify: `apps/mobile/src/components/GradientHeader.tsx` — earth bg with low-opacity topo texture
- Modify: `apps/mobile/src/components/ExerciseSwapModal.tsx` — terrain modal styling
- Modify: `apps/mobile/src/components/PremiumBadge.tsx` — terrain tier colors
- Modify: `apps/mobile/src/components/AwardPreviewModal.tsx` — terrain modal

- [ ] **Step 1: Update each component's colors to terrain palette**

For each component: replace `#6366F1` → context-appropriate (earth for primary, trail for active), `#FFFFFF` bg → sand, `#F2F2F7` → stone, text colors to earth/rock hierarchy.

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/src/components/
git commit -m "feat: update all shared components to terrain palette"
```

---

## Phase 11: Final Polish

### Task 22: Personal Message Generator

**Files:**
- Create: `apps/mobile/src/lib/personal-messages.ts`

- [ ] **Step 1: Create message generator**

Function that takes user data (streak, last PR, completion rate, current week) and returns a personalized hero message with terrain language. Examples:
- "You're {X} sessions away from your longest streak."
- "Your bench has climbed {X}kg in {Y} weeks."
- "You haven't missed a Monday in {X} weeks."
- "It's deload week. Lighter loads. Trust the descent."

Returns `{ message: string; highlight: string }` where highlight is the key phrase to color green.

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/src/lib/personal-messages.ts
git commit -m "feat: add personal message generator for Home hero"
```

---

### Task 23: Verify All Screens Compile

- [ ] **Step 1: Run TypeScript check**

```bash
cd apps/mobile && npx tsc --noEmit
```

Fix any type errors.

- [ ] **Step 2: Run Expo and test each screen**

```bash
cd apps/mobile && npx expo start
```

Navigate through every screen on Expo Go. Verify:
- All screens render with terrain palette
- Animations play correctly (no reanimated crashes)
- Exercise cards expand/collapse smoothly
- Tab bar pill slides correctly
- No crashes on any screen

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "fix: resolve any compilation and runtime issues from redesign"
```

---

## Summary

| Phase | Tasks | Screens Affected |
|-------|-------|-----------------|
| 1: Foundation | Tasks 1-9 | All (shared components) |
| 2: Home | Task 10 | Home/Today |
| 3: Progress | Task 11 | Progress |
| 4: Meals | Task 12 | Meals |
| 5: Settings | Task 13 | Settings |
| 6: Workout | Task 14 | Workout Player |
| 7: Secondary | Tasks 15-18 | 8 screens |
| 8: Onboarding | Task 19 | 7 steps |
| 9: Auth | Task 20 | Sign In/Up |
| 10: Components | Task 21 | 8 components |
| 11: Polish | Tasks 22-23 | Home + all |

**Total: 23 tasks, 28 screens, ~20 components**
