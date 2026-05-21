# Progress Screen Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current 3-tab progress screen with a clean, single-scroll dashboard featuring day strip, overview bento (steps/calories/heart rate), nutrition ring card, streak + achievements side-by-side, weekly/monthly summary cards, and recovery score.

**Architecture:** Complete rewrite of `progress.tsx` with extracted sub-components for each card. Data loading trimmed to only needed queries. Apple Health cards use placeholder data until HealthKit integration (requires dev build). All other cards are fully dynamic from Supabase.

**Tech Stack:** React Native, Expo, SVG (react-native-svg is NOT available in Expo Go — use View-based approximations or inline SVG where possible), Supabase, Zustand, twrnc.

**Mockup reference:** `.superpowers/brainstorm/63339-1777060179/content/progress-v5.html`

**Constraint:** Expo Go compatible — no native modules, no react-native-svg, no expo-linear-gradient. SVG rings must be built with View-based circular progress (nested Views with border tricks) or use the approach already used in the codebase.

**Icon assets to save:** The 3 bento card icons (footsteps, fire, heart-beat) are already in Downloads and were embedded as base64 in the mockup. Copy them to `apps/mobile/assets/progress/` for use with `require()`.

---

## File Structure

### New files to create:
- `apps/mobile/src/components/progress-v2/DayStrip.tsx` — Mon-Sun day pills with completion dots
- `apps/mobile/src/components/progress-v2/OverviewBento.tsx` — 3-card bento grid (Steps ring, Calories, Heart Rate with ECG)
- `apps/mobile/src/components/progress-v2/NutritionCard.tsx` — Calories ring + 3 macro progress bars
- `apps/mobile/src/components/progress-v2/StreakAchievementsRow.tsx` — Side-by-side streak + achievements cards
- `apps/mobile/src/components/progress-v2/WeeklySummaryCard.tsx` — Horizontal stats card with progress bar
- `apps/mobile/src/components/progress-v2/MonthlySummaryCard.tsx` — Dark-themed monthly stats card
- `apps/mobile/src/components/progress-v2/RecoveryCard.tsx` — Recovery score with HRV/Sleep/RHR tags
- `apps/mobile/src/components/progress-v2/ProgressRing.tsx` — Reusable circular progress View component
- `apps/mobile/src/components/progress-v2/index.ts` — Barrel export
- `apps/mobile/assets/progress/icon-steps.png` — Footsteps icon
- `apps/mobile/assets/progress/icon-calories.png` — Fire icon
- `apps/mobile/assets/progress/icon-heartrate.png` — Heart-beat icon

### Files to modify:
- `apps/mobile/app/(app)/progress.tsx` — Complete rewrite (backup exists at `progress.tsx.bak`)

### Files to reference (read-only):
- `apps/mobile/src/lib/styles.ts` — Theme colors
- `packages/shared/src/algorithms/stats.ts` — calculateWorkoutStreak, calculateVolumeLoad, calculateCompletionRate
- `packages/shared/src/algorithms/macros.ts` — calculateMacros
- `packages/shared/src/constants/achievements.ts` — ACHIEVEMENT_DEFINITIONS
- `packages/shared/src/types/progress.ts` — Types
- `apps/mobile/src/components/terrain.tsx` — TopoBackground component
- `apps/mobile/src/components/SkeletonLoader.tsx` — ProgressSkeleton component

---

## Data Mapping: Mockup Section → Data Source

| Mockup Section | Data Source | Dynamic? |
|---|---|---|
| Day strip (completed days) | `workout_logs` WHERE user_id AND started_at in current week | Yes |
| Steps card (ring + number) | Apple HealthKit (placeholder: 7,235 / 10,000) | Placeholder |
| Calories card | Apple HealthKit (placeholder: 325 kcal) | Placeholder |
| Heart Rate card + ECG | Apple HealthKit (placeholder: 73 bpm) | Placeholder |
| Nutrition ring (calories) | `meal_logs` aggregated for today OR profile TDEE + `calculateMacros()` | Yes |
| Nutrition macros (P/C/F) | `meal_logs` today totals vs `calculateMacros()` targets | Yes |
| Streak number | `calculateWorkoutStreak(workoutDates)` | Yes |
| Streak dots (7 days) | `workout_logs` this week completion | Yes |
| Streak best | Max streak from history | Yes |
| Achievements count | `user_achievements` count vs `ACHIEVEMENT_DEFINITIONS.length` | Yes |
| Achievements emojis | Last 3 earned from `user_achievements` joined with definitions | Yes |
| Weekly: workouts | `workout_logs` this week count vs `workout_plans` non-rest count | Yes |
| Weekly: volume | `calculateVolumeLoad()` from `set_logs` this week | Yes |
| Weekly: avg time | `workout_logs` this week avg(completed_at - started_at) | Yes |
| Weekly: PRs | `personal_records` this week count | Yes |
| Monthly: all stats | Same pattern but for current month | Yes |
| Recovery score | Placeholder (82/100) until Apple Health HRV/Sleep/RHR | Placeholder |

---

## Tasks

### Task 1: Copy icon assets

**Files:**
- Create: `apps/mobile/assets/progress/icon-steps.png`
- Create: `apps/mobile/assets/progress/icon-calories.png`
- Create: `apps/mobile/assets/progress/icon-heartrate.png`

- [ ] **Step 1: Create directory and copy icons**

```bash
mkdir -p apps/mobile/assets/progress
cp ~/Downloads/footstep_8023817.png apps/mobile/assets/progress/icon-steps.png
cp ~/Downloads/fire_785116.png apps/mobile/assets/progress/icon-calories.png
cp ~/Downloads/heart-beat_9498291.png apps/mobile/assets/progress/icon-heartrate.png
```

- [ ] **Step 2: Also copy the shoe running icon for the steps ring center**

```bash
cp ~/Downloads/Screenshot\ 2026-04-24\ at\ 4.30.54\ PM.png apps/mobile/assets/progress/icon-steps-ring.png
```

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/assets/progress/
git commit -m "feat: add progress screen icon assets"
```

---

### Task 2: Create ProgressRing component

**Files:**
- Create: `apps/mobile/src/components/progress-v2/ProgressRing.tsx`

This is a reusable circular progress component built with Views (no react-native-svg needed). Uses the same technique as the existing codebase.

- [ ] **Step 1: Create ProgressRing component**

```tsx
// apps/mobile/src/components/progress-v2/ProgressRing.tsx
import { View } from "react-native";

interface ProgressRingProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0-1
  color: string;
  trackColor?: string;
  children?: React.ReactNode;
}

export function ProgressRing({
  size,
  strokeWidth,
  progress,
  color,
  trackColor = "rgba(0,0,0,0.04)",
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(progress, 1));

  // Since we can't use react-native-svg in Expo Go, we build
  // the ring using a bordered View with overflow hidden + rotation trick.
  // This is a simplified approach — for the mockup's dotted ring style,
  // we'll use View-based approximation in the Steps card specifically.

  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      {/* Track */}
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: trackColor,
        }}
      />
      {/* Progress — using two half-circles technique */}
      <HalfCircleProgress
        size={size}
        strokeWidth={strokeWidth}
        progress={progress}
        color={color}
      />
      {/* Center content */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </View>
    </View>
  );
}

function HalfCircleProgress({
  size,
  strokeWidth,
  progress,
  color,
}: {
  size: number;
  strokeWidth: number;
  progress: number;
  color: string;
}) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const rotation = clampedProgress * 360;

  if (clampedProgress === 0) return null;

  return (
    <View style={{ position: "absolute", width: size, height: size }}>
      {/* First half (0-180deg) */}
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: "transparent",
            borderTopColor: color,
            borderRightColor: clampedProgress > 0.25 ? color : "transparent",
            borderBottomColor: clampedProgress > 0.5 ? color : "transparent",
            borderLeftColor: clampedProgress > 0.75 ? color : "transparent",
            transform: [{ rotate: "-90deg" }],
          }}
        />
      </View>
    </View>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/src/components/progress-v2/ProgressRing.tsx
git commit -m "feat: add ProgressRing component for progress screen"
```

---

### Task 3: Create DayStrip component

**Files:**
- Create: `apps/mobile/src/components/progress-v2/DayStrip.tsx`

- [ ] **Step 1: Create DayStrip**

The DayStrip shows MON-SUN pills. Active day (today) is dark, completed days have green border, future days are dimmed.

Props:
- `completedDays: Set<number>` — indices (0=Mon) of days with workouts logged
- `selectedDay: number` — currently selected day index
- `onSelectDay: (index: number) => void`

```tsx
// apps/mobile/src/components/progress-v2/DayStrip.tsx
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useMemo } from "react";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

interface DayStripProps {
  completedDays: Set<number>;
  selectedDay: number;
  onSelectDay: (index: number) => void;
}

function getWeekDates(): { date: number; isToday: boolean }[] {
  const now = new Date();
  const todayDay = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (todayDay === 0 ? 6 : todayDay - 1));

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { date: d.getDate(), isToday: d.toDateString() === now.toDateString() };
  });
}

export function formatHeaderDate(): string {
  const now = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

export function getTodayIndex(): number {
  const now = new Date();
  const day = now.getDay();
  return day === 0 ? 6 : day - 1;
}

export function getWeekBounds(): { monday: Date; sunday: Date } {
  const now = new Date();
  const todayDay = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (todayDay === 0 ? 6 : todayDay - 1));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { monday, sunday };
}

export function DayStrip({ completedDays, selectedDay, onSelectDay }: DayStripProps) {
  const weekDates = useMemo(() => getWeekDates(), []);
  const todayIdx = useMemo(() => getTodayIndex(), []);

  return (
    <View style={s.strip}>
      {DAYS.map((day, i) => {
        const isActive = i === selectedDay;
        const isDone = completedDays.has(i);
        const isFuture = i > todayIdx;

        return (
          <Pressable
            key={i}
            onPress={() => onSelectDay(i)}
            style={[
              s.pill,
              isActive && s.pillActive,
              !isActive && isDone && s.pillDone,
              isFuture && !isActive && s.pillFuture,
            ]}
          >
            <Text style={[s.dayName, isActive && s.dayNameActive]}>{day}</Text>
            <Text style={[s.dayDate, isActive && s.dayDateActive]}>
              {weekDates[i].date}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  strip: { flexDirection: "row", gap: 6, paddingHorizontal: 18, marginBottom: 16 },
  pill: {
    flex: 1, alignItems: "center", paddingVertical: 9, paddingBottom: 13,
    borderRadius: 16, backgroundColor: "#fff", borderWidth: 1.5, borderColor: "transparent",
  },
  pillActive: { backgroundColor: "#1a1a1a", borderColor: "#1a1a1a" },
  pillDone: { borderColor: "#2DB877" },
  pillFuture: { opacity: 0.45 },
  dayName: { fontSize: 10, fontWeight: "600", color: "#aaa", letterSpacing: 0.5, marginBottom: 5 },
  dayNameActive: { color: "rgba(255,255,255,0.45)" },
  dayDate: { fontSize: 18, fontWeight: "700", color: "#1a1a1a", lineHeight: 18 },
  dayDateActive: { color: "#fff" },
});
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/src/components/progress-v2/DayStrip.tsx
git commit -m "feat: add DayStrip component"
```

---

### Task 4: Create OverviewBento component

**Files:**
- Create: `apps/mobile/src/components/progress-v2/OverviewBento.tsx`

- [ ] **Step 1: Create OverviewBento**

The bento grid has 3 cards: Steps (tall left with ring), Calories (top right), Heart Rate (bottom right with ECG line).

Since we can't use react-native-svg in Expo Go, the Steps ring and ECG line will be built with View-based approximations. The Steps ring uses the ProgressRing component. The ECG is built with small View dots positioned to simulate a heartbeat line.

Props:
- `steps: number`
- `stepsGoal: number`
- `calories: number`
- `heartRate: number`

All values are placeholder until Apple Health integration.

```tsx
// apps/mobile/src/components/progress-v2/OverviewBento.tsx
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import { ProgressRing } from "./ProgressRing";

const ICON_STEPS = require("../../../assets/progress/icon-steps.png");
const ICON_CALORIES = require("../../../assets/progress/icon-calories.png");
const ICON_HEARTRATE = require("../../../assets/progress/icon-heartrate.png");
const ICON_STEPS_RING = require("../../../assets/progress/icon-steps-ring.png");

interface OverviewBentoProps {
  steps: number;
  stepsGoal: number;
  calories: number;
  heartRate: number;
}

export function OverviewBento({ steps, stepsGoal, calories, heartRate }: OverviewBentoProps) {
  const progress = Math.min(steps / stepsGoal, 1);

  return (
    <View>
      <Text style={s.label}>Overview</Text>
      <View style={s.grid}>
        {/* Steps Card — tall left */}
        <View style={[s.card, s.stepsCard]}>
          <View style={s.cardTop}>
            <Image source={ICON_STEPS} style={s.icon} />
            <Text style={s.cardName}>Steps</Text>
          </View>
          <View style={s.ringWrap}>
            <ProgressRing
              size={150}
              strokeWidth={9}
              progress={progress}
              color="#4CAF7A"
              trackColor="rgba(0,0,0,0.04)"
            >
              <Image source={ICON_STEPS_RING} style={s.ringIcon} />
              <Text style={s.stepsVal}>{steps.toLocaleString()}</Text>
              <Text style={s.stepsLabel}>Steps</Text>
            </ProgressRing>
          </View>
        </View>

        {/* Calories Card — top right */}
        <View style={[s.card, s.smallCard]}>
          <View style={s.cardTop}>
            <Image source={ICON_CALORIES} style={s.icon} />
            <Text style={s.cardName}>Calories</Text>
          </View>
          <Text style={s.bigVal}>{calories}</Text>
          <Text style={s.unit}>kcal</Text>
        </View>

        {/* Heart Rate Card — bottom right */}
        <View style={[s.card, s.smallCard]}>
          <View style={s.cardTop}>
            <Image source={ICON_HEARTRATE} style={s.icon} />
            <Text style={s.cardName}>Heart Rate</Text>
          </View>
          <ECGLine />
          <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 4 }}>
            <Text style={[s.bigVal, { color: "#E25B5B" }]}>{heartRate}</Text>
            <Text style={s.unit}> bpm</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function ECGLine() {
  // View-based ECG approximation — a row of small colored Views
  // simulating a heartbeat waveform
  const heights = [2, 2, 2, 3, 2, 2, 8, 14, 4, 16, 12, 6, 2, 2, 3, 2, 2, 8, 14, 4, 16, 12, 6, 2, 2, 3, 2, 2];
  const baseHeight = 18;

  return (
    <View style={s.ecgContainer}>
      {/* Shadow layer */}
      <View style={s.ecgRow}>
        {heights.map((h, i) => (
          <View
            key={`s${i}`}
            style={{
              flex: 1,
              height: h + 4,
              backgroundColor: "rgba(226,91,91,0.08)",
              borderRadius: 1,
              marginTop: baseHeight - h,
            }}
          />
        ))}
      </View>
      {/* Main line */}
      <View style={[s.ecgRow, { position: "absolute", top: 0, left: 0, right: 0 }]}>
        {heights.map((h, i) => (
          <View
            key={`l${i}`}
            style={{
              flex: 1,
              height: Math.max(h, 2),
              backgroundColor: "#E25B5B",
              borderRadius: 1,
              marginTop: baseHeight - h,
            }}
          />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", color: "#1a1a1a", marginLeft: 2, marginBottom: 8 },
  grid: {
    flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff", borderRadius: 20, padding: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  stepsCard: {
    width: "48%", flexGrow: 1,
  },
  smallCard: {
    width: "48%", flexGrow: 1,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  icon: { width: 16, height: 16, resizeMode: "contain" },
  cardName: { fontSize: 13, fontWeight: "500", color: "#888" },
  ringWrap: { alignItems: "center", marginVertical: 4 },
  ringIcon: { width: 36, height: 36, resizeMode: "contain", marginBottom: 4 },
  stepsVal: { fontSize: 28, fontWeight: "700", color: "#4A4A4A", letterSpacing: -0.3 },
  stepsLabel: { fontSize: 13, color: "#9ca3af", fontWeight: "500", marginTop: 2 },
  bigVal: { fontSize: 26, fontWeight: "700", color: "#1a1a1a", letterSpacing: -0.8 },
  unit: { fontSize: 12, color: "#bbb", fontWeight: "400" },
  ecgContainer: { height: 22, marginVertical: 6, position: "relative" },
  ecgRow: { flexDirection: "row", gap: 1, height: 22, alignItems: "flex-end" },
});
```

Note: The bento grid layout with the Steps card spanning 2 rows while Calories and Heart Rate stack on the right needs special handling in React Native since CSS Grid isn't available. We'll use a flexbox approach with absolute sizing.

- [ ] **Step 2: Refine the bento layout for React Native**

Update the grid to use a proper 2-column layout where Steps spans the full height of both right cards:

Replace the grid styles with:
```tsx
// In the render, wrap as:
<View style={s.grid}>
  {/* Left column: Steps */}
  <View style={s.leftCol}>
    {/* Steps card content */}
  </View>
  {/* Right column: Calories + Heart Rate stacked */}
  <View style={s.rightCol}>
    {/* Calories card */}
    {/* Heart Rate card */}
  </View>
</View>

// Styles:
grid: { flexDirection: "row", gap: 8, marginBottom: 12 },
leftCol: { flex: 1 },
rightCol: { flex: 1, gap: 8 },
```

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/components/progress-v2/OverviewBento.tsx
git commit -m "feat: add OverviewBento component with Steps ring, Calories, Heart Rate ECG"
```

---

### Task 5: Create NutritionCard component

**Files:**
- Create: `apps/mobile/src/components/progress-v2/NutritionCard.tsx`

- [ ] **Step 1: Create NutritionCard**

Props:
- `calories: number`, `caloriesGoal: number`
- `protein: number`, `proteinGoal: number`
- `carbs: number`, `carbsGoal: number`
- `fat: number`, `fatGoal: number`

Layout: Calories ring on left, 3 macro rows with progress bars on right.

```tsx
// apps/mobile/src/components/progress-v2/NutritionCard.tsx
import { View, Text, StyleSheet } from "react-native";
import { ProgressRing } from "./ProgressRing";

interface NutritionCardProps {
  calories: number;
  caloriesGoal: number;
  protein: number;
  proteinGoal: number;
  carbs: number;
  carbsGoal: number;
  fat: number;
  fatGoal: number;
}

function MacroRow({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  const pct = Math.min(value / goal, 1) * 100;
  return (
    <View style={s.macroRow}>
      <View style={s.macroHeader}>
        <Text style={s.macroLabel}>{label}</Text>
        <Text style={s.macroValue}>
          {value}g <Text style={s.macroGoal}>/ {goal}g</Text>
        </Text>
      </View>
      <View style={s.barTrack}>
        <View style={[s.barFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export function NutritionCard(props: NutritionCardProps) {
  const calPct = Math.min(props.calories / props.caloriesGoal, 1);

  return (
    <View style={s.card}>
      <View style={s.header}>
        <View style={s.titleRow}>
          <Text style={{ fontSize: 14 }}>{"\uD83C\uDF5C"}</Text>
          <Text style={s.title}>Nutrition</Text>
        </View>
        <Text style={s.link}>View details ›</Text>
      </View>
      <View style={s.body}>
        {/* Calories Ring */}
        <View style={s.ringCol}>
          <ProgressRing size={90} strokeWidth={7} progress={calPct} color="#2DB877">
            <Text style={s.calVal}>{props.calories.toLocaleString()}</Text>
            <Text style={s.calGoal}>/ {props.caloriesGoal.toLocaleString()} kcal</Text>
          </ProgressRing>
        </View>
        {/* Macros */}
        <View style={s.macroCol}>
          <MacroRow label="Protein" value={props.protein} goal={props.proteinGoal} color="#D4930D" />
          <MacroRow label="Carbs" value={props.carbs} goal={props.carbsGoal} color="#6366F1" />
          <MacroRow label="Fat" value={props.fat} goal={props.fatGoal} color="#E25B5B" />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: "#fff", borderRadius: 20, padding: 12, marginBottom: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  title: { fontSize: 13, fontWeight: "600", color: "#1a1a1a" },
  link: { fontSize: 10, color: "#2DB877", fontWeight: "500" },
  body: { flexDirection: "row", alignItems: "center", gap: 12 },
  ringCol: { flexShrink: 0 },
  calVal: { fontSize: 16, fontWeight: "700", color: "#1a1a1a", letterSpacing: -0.5 },
  calGoal: { fontSize: 8, color: "#bbb", marginTop: 1 },
  macroCol: { flex: 1, gap: 8 },
  macroRow: {},
  macroHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  macroLabel: { fontSize: 10, color: "#888", fontWeight: "500" },
  macroValue: { fontSize: 12, fontWeight: "700", color: "#1a1a1a" },
  macroGoal: { fontSize: 9, color: "#bbb", fontWeight: "400" },
  barTrack: { height: 3, backgroundColor: "rgba(0,0,0,0.04)", borderRadius: 1.5, marginTop: 3, overflow: "hidden" },
  barFill: { height: 3, borderRadius: 1.5 },
});
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/src/components/progress-v2/NutritionCard.tsx
git commit -m "feat: add NutritionCard component with calories ring and macro bars"
```

---

### Task 6: Create StreakAchievementsRow component

**Files:**
- Create: `apps/mobile/src/components/progress-v2/StreakAchievementsRow.tsx`

- [ ] **Step 1: Create StreakAchievementsRow**

Props:
- `streak: number`
- `streakBest: number`
- `completedDays: Set<number>` — for the 7 dots
- `earnedCount: number`
- `totalAchievements: number`
- `recentEarnedEmojis: string[]` — last 3 earned achievement emojis

```tsx
// apps/mobile/src/components/progress-v2/StreakAchievementsRow.tsx
import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";

interface Props {
  streak: number;
  streakBest: number;
  completedDays: Set<number>;
  earnedCount: number;
  totalAchievements: number;
  recentEarnedEmojis: string[];
}

export function StreakAchievementsRow(props: Props) {
  return (
    <View style={s.row}>
      {/* Streak Card */}
      <View style={s.card}>
        <View style={s.cardTop}>
          <Text style={{ fontSize: 14 }}>{"\uD83D\uDD25"}</Text>
          <Text style={s.cardTitle}>Streak</Text>
        </View>
        <View style={s.center}>
          <Text style={s.streakNum}>{props.streak}</Text>
          <Text style={s.streakLabel}>days</Text>
        </View>
        <View style={s.dots}>
          {Array.from({ length: 7 }, (_, i) => (
            <View
              key={i}
              style={[s.dot, { backgroundColor: props.completedDays.has(i) ? "#2DB877" : "rgba(0,0,0,0.06)" }]}
            />
          ))}
        </View>
        <Text style={s.bestText}>
          <Text style={s.bestLabel}>Best: </Text>
          <Text style={s.bestVal}>{props.streakBest} days</Text>
        </Text>
      </View>

      {/* Achievements Card */}
      <View style={s.card}>
        <View style={s.cardTop}>
          <Text style={{ fontSize: 14 }}>{"\uD83C\uDFC6"}</Text>
          <Text style={s.cardTitle}>Achievements</Text>
        </View>
        <View style={s.emojis}>
          {props.recentEarnedEmojis.map((emoji, i) => (
            <Text key={i} style={s.emoji}>{emoji}</Text>
          ))}
        </View>
        <View style={s.center}>
          <Text style={s.achCount}>{props.earnedCount}</Text>
          <Text style={s.achTotal}> / {props.totalAchievements}</Text>
        </View>
        <View style={s.achBar}>
          <View style={[s.achBarFill, { width: `${(props.earnedCount / props.totalAchievements) * 100}%` }]} />
        </View>
        <Pressable onPress={() => router.push("/achievements" as any)} style={s.viewAll}>
          <Text style={s.viewAllText}>View all ›</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 8, marginBottom: 12 },
  card: {
    flex: 1, backgroundColor: "#fff", borderRadius: 20, padding: 12, paddingBottom: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  cardTitle: { fontSize: 13, fontWeight: "600", color: "#1a1a1a" },
  center: { alignItems: "center", paddingVertical: 8 },
  streakNum: { fontSize: 36, fontWeight: "700", color: "#1a1a1a", lineHeight: 36 },
  streakLabel: { fontSize: 11, color: "#888", fontWeight: "500", marginTop: 3 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 4, marginTop: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  bestText: { textAlign: "center", marginTop: 6 },
  bestLabel: { fontSize: 9, color: "#bbb", fontWeight: "500" },
  bestVal: { fontSize: 9, color: "#D4930D", fontWeight: "600" },
  emojis: { flexDirection: "row", justifyContent: "center", gap: 6, marginBottom: 8 },
  emoji: { fontSize: 28 },
  achCount: { fontSize: 22, fontWeight: "700", color: "#1a1a1a" },
  achTotal: { fontSize: 12, color: "#bbb", fontWeight: "400" },
  achBar: { height: 3, backgroundColor: "rgba(0,0,0,0.04)", borderRadius: 1.5, marginTop: 6, overflow: "hidden" },
  achBarFill: { height: 3, borderRadius: 1.5, backgroundColor: "#2DB877" },
  viewAll: { alignItems: "center", marginTop: 6 },
  viewAllText: { fontSize: 10, color: "#2DB877", fontWeight: "500" },
});
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/src/components/progress-v2/StreakAchievementsRow.tsx
git commit -m "feat: add StreakAchievementsRow component"
```

---

### Task 7: Create WeeklySummaryCard and MonthlySummaryCard

**Files:**
- Create: `apps/mobile/src/components/progress-v2/WeeklySummaryCard.tsx`
- Create: `apps/mobile/src/components/progress-v2/MonthlySummaryCard.tsx`

- [ ] **Step 1: Create WeeklySummaryCard**

```tsx
// apps/mobile/src/components/progress-v2/WeeklySummaryCard.tsx
import { View, Text, StyleSheet } from "react-native";

interface WeeklySummaryProps {
  weekLabel: string;
  workoutsCompleted: number;
  workoutsPlanned: number;
  volume: number;
  volumeChange: number; // percentage
  avgDuration: number; // minutes
  prs: number;
}

export function WeeklySummaryCard(props: WeeklySummaryProps) {
  const completionPct = props.workoutsPlanned > 0
    ? Math.round((props.workoutsCompleted / props.workoutsPlanned) * 100)
    : 0;

  const formatVol = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`;

  return (
    <View style={s.card}>
      <View style={s.header}>
        <View style={s.titleRow}>
          <Text style={{ fontSize: 14 }}>{"\uD83D\uDCC5"}</Text>
          <Text style={s.title}>This Week</Text>
        </View>
        <Text style={s.badge}>{props.weekLabel}</Text>
      </View>
      <View style={s.stats}>
        <View>
          <Text style={s.val}>{props.workoutsCompleted}<Text style={s.valSub}>/{props.workoutsPlanned}</Text></Text>
          <Text style={s.label}>WORKOUTS</Text>
        </View>
        <View>
          <Text style={s.val}>{formatVol(props.volume)}</Text>
          <Text style={s.label}>VOLUME</Text>
          {props.volumeChange !== 0 && (
            <Text style={[s.change, { color: props.volumeChange > 0 ? "#2DB877" : "#E25B5B" }]}>
              {props.volumeChange > 0 ? "+" : ""}{props.volumeChange}%
            </Text>
          )}
        </View>
        <View>
          <Text style={s.val}>{props.avgDuration}m</Text>
          <Text style={s.label}>AVG TIME</Text>
        </View>
        <View>
          <Text style={s.val}>{props.prs}</Text>
          <Text style={s.label}>PRS</Text>
        </View>
      </View>
      <View style={s.bar}>
        <View style={[s.barFill, { width: `${completionPct}%` }]} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: "#fff", borderRadius: 20, padding: 12, paddingBottom: 14, marginBottom: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  title: { fontSize: 13, fontWeight: "600", color: "#1a1a1a" },
  badge: { fontSize: 10, fontWeight: "500", color: "#2DB877", backgroundColor: "rgba(45,184,119,0.08)", paddingHorizontal: 9, paddingVertical: 3, borderRadius: 6, overflow: "hidden" },
  stats: { flexDirection: "row", gap: 14, marginBottom: 10 },
  val: { fontSize: 20, fontWeight: "700", color: "#1a1a1a", lineHeight: 20 },
  valSub: { fontSize: 11, color: "#bbb", fontWeight: "400" },
  label: { fontSize: 9, color: "#bbb", letterSpacing: 0.3, fontWeight: "500", marginTop: 2 },
  change: { fontSize: 9, fontWeight: "600", marginTop: 1 },
  bar: { height: 3, backgroundColor: "rgba(0,0,0,0.04)", borderRadius: 1.5, overflow: "hidden" },
  barFill: { height: 3, borderRadius: 1.5, backgroundColor: "#2DB877" },
});
```

- [ ] **Step 2: Create MonthlySummaryCard**

```tsx
// apps/mobile/src/components/progress-v2/MonthlySummaryCard.tsx
import { View, Text, StyleSheet } from "react-native";

interface MonthlySummaryProps {
  monthLabel: string;
  workouts: number;
  workoutsChange: number;
  volume: number;
  volumeChange: number;
  avgDuration: number;
  prs: number;
  completionRate: number;
}

export function MonthlySummaryCard(props: MonthlySummaryProps) {
  const formatVol = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`;

  return (
    <View style={s.card}>
      <View style={s.header}>
        <View style={s.titleRow}>
          <Text style={{ fontSize: 14 }}>{"\uD83D\uDCC8"}</Text>
          <Text style={s.title}>{props.monthLabel} Summary</Text>
        </View>
        <Text style={s.badge}>{props.completionRate}% complete</Text>
      </View>
      <View style={s.stats}>
        <View>
          <Text style={s.val}>{props.workouts}</Text>
          <Text style={s.label}>WORKOUTS</Text>
          {props.workoutsChange !== 0 && (
            <Text style={s.change}>
              {props.workoutsChange > 0 ? "+" : ""}{props.workoutsChange} vs last
            </Text>
          )}
        </View>
        <View>
          <Text style={s.val}>{formatVol(props.volume)}</Text>
          <Text style={s.label}>VOLUME</Text>
          {props.volumeChange !== 0 && (
            <Text style={s.change}>
              {props.volumeChange > 0 ? "+" : ""}{props.volumeChange}%
            </Text>
          )}
        </View>
        <View>
          <Text style={s.val}>{props.avgDuration}m</Text>
          <Text style={s.label}>AVG TIME</Text>
        </View>
        <View>
          <Text style={s.val}>{props.prs}</Text>
          <Text style={s.label}>PRS</Text>
        </View>
      </View>
      <View style={s.bar}>
        <View style={[s.barFill, { width: `${props.completionRate}%` }]} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: "#1a1a1a", borderRadius: 20, padding: 12, paddingBottom: 14, marginBottom: 12,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  title: { fontSize: 13, fontWeight: "600", color: "#eee" },
  badge: { fontSize: 10, fontWeight: "500", color: "#2DB877", backgroundColor: "rgba(45,184,119,0.12)", paddingHorizontal: 9, paddingVertical: 3, borderRadius: 6, overflow: "hidden" },
  stats: { flexDirection: "row", gap: 14, marginBottom: 10 },
  val: { fontSize: 20, fontWeight: "700", color: "#eee", lineHeight: 20 },
  label: { fontSize: 9, color: "#666", letterSpacing: 0.3, fontWeight: "500", marginTop: 2 },
  change: { fontSize: 9, fontWeight: "600", color: "#2DB877", marginTop: 1 },
  bar: { height: 3, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 1.5, overflow: "hidden" },
  barFill: { height: 3, borderRadius: 1.5, backgroundColor: "#2DB877" },
});
```

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/components/progress-v2/WeeklySummaryCard.tsx apps/mobile/src/components/progress-v2/MonthlySummaryCard.tsx
git commit -m "feat: add WeeklySummaryCard and MonthlySummaryCard"
```

---

### Task 8: Create RecoveryCard component

**Files:**
- Create: `apps/mobile/src/components/progress-v2/RecoveryCard.tsx`

- [ ] **Step 1: Create RecoveryCard**

Placeholder data until Apple Health. Props are all optional with defaults.

```tsx
// apps/mobile/src/components/progress-v2/RecoveryCard.tsx
import { View, Text, StyleSheet } from "react-native";

interface RecoveryCardProps {
  score?: number;
  message?: string;
  hrv?: number;
  sleepHours?: number;
  restingHR?: number;
}

export function RecoveryCard({
  score = 82,
  message = "Good to train — body is well rested",
  hrv = 48,
  sleepHours = 7.4,
  restingHR = 68,
}: RecoveryCardProps) {
  return (
    <View style={s.card}>
      <View style={s.ring}>
        <Text style={s.score}>{score}</Text>
      </View>
      <View style={s.info}>
        <Text style={s.title}>Recovery Score</Text>
        <Text style={s.desc}>{message}</Text>
        <View style={s.tags}>
          <View style={s.tag}><Text style={s.tagText}>HRV {hrv}ms</Text></View>
          <View style={s.tag}><Text style={s.tagText}>Sleep {sleepHours}h</Text></View>
          <View style={s.tag}><Text style={s.tagText}>RHR {restingHR}</Text></View>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: "#F0F8F4", borderRadius: 18, padding: 12, marginBottom: 10,
    flexDirection: "row", alignItems: "center", gap: 12,
    borderWidth: 0.5, borderColor: "rgba(45,184,119,0.12)",
  },
  ring: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 3, borderColor: "#2DB877",
    alignItems: "center", justifyContent: "center",
  },
  score: { fontSize: 16, fontWeight: "700", color: "#1a1a1a" },
  info: { flex: 1 },
  title: { fontSize: 12, fontWeight: "600", color: "#1a1a1a" },
  desc: { fontSize: 10, color: "#5A9B73", marginTop: 1 },
  tags: { flexDirection: "row", gap: 5, marginTop: 5 },
  tag: { backgroundColor: "rgba(45,184,119,0.1)", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4 },
  tagText: { fontSize: 8, color: "#5A9B73", fontWeight: "500" },
});
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/src/components/progress-v2/RecoveryCard.tsx
git commit -m "feat: add RecoveryCard component"
```

---

### Task 9: Create barrel export

**Files:**
- Create: `apps/mobile/src/components/progress-v2/index.ts`

- [ ] **Step 1: Create barrel export**

```tsx
// apps/mobile/src/components/progress-v2/index.ts
export { DayStrip, formatHeaderDate, getTodayIndex, getWeekBounds } from "./DayStrip";
export { OverviewBento } from "./OverviewBento";
export { NutritionCard } from "./NutritionCard";
export { StreakAchievementsRow } from "./StreakAchievementsRow";
export { WeeklySummaryCard } from "./WeeklySummaryCard";
export { MonthlySummaryCard } from "./MonthlySummaryCard";
export { RecoveryCard } from "./RecoveryCard";
export { ProgressRing } from "./ProgressRing";
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/src/components/progress-v2/index.ts
git commit -m "feat: add barrel export for progress-v2 components"
```

---

### Task 10: Rewrite progress.tsx

**Files:**
- Modify: `apps/mobile/app/(app)/progress.tsx` (complete rewrite — backup at `progress.tsx.bak`)

- [ ] **Step 1: Write the new progress.tsx**

This is the main screen file. It handles all data loading and passes props to the sub-components. Key data flows:

1. **Day strip**: Query `workout_logs` for current week to determine which days are completed
2. **Overview bento**: Placeholder Apple Health data (steps=7235, calories=325, heartRate=73)
3. **Nutrition**: Query `meal_logs` for today + calculate macro targets from profile TDEE
4. **Streak**: Use `calculateWorkoutStreak` from all workout dates
5. **Achievements**: Query `user_achievements` count + get recent earned emojis
6. **Weekly**: Query this week's workout_logs + set_logs for volume, PRs, duration
7. **Monthly**: Same queries scoped to current month vs last month
8. **Recovery**: Placeholder data

The full component code should:
- Import all sub-components from `progress-v2`
- Import shared utilities (`useAuthStore`, `calculateWorkoutStreak`, `calculateVolumeLoad`, `calculateCompletionRate`, `calculateMacros`, `ACHIEVEMENT_DEFINITIONS`)
- Import Supabase client
- Import `TopoBackground` and `ProgressSkeleton`
- Define state variables for all needed data
- Implement `loadData()` that runs parallel Supabase queries
- Render a single `ScrollView` with `RefreshControl`
- Layout: Header → Divider → Date row → DayStrip → pad container (OverviewBento → NutritionCard → StreakAchievementsRow → WeeklySummaryCard → MonthlySummaryCard → RecoveryCard) → Tab bar

Reference the existing `progress.tsx.bak` lines 180-565 for the query patterns, but trim to only needed queries. The nutrition data comes from two sources:
- **Targets**: profile.tdee + `calculateMacros(tdee, goal, weight_kg)` 
- **Actuals**: `meal_logs` for today, summed by calories, protein_g, carbs_g, fat_g

- [ ] **Step 2: Type-check**

```bash
cd apps/mobile && npx tsc --noEmit 2>&1 | grep "progress" | head -20
```

Fix any type errors in the new progress.tsx and components.

- [ ] **Step 3: Test on device**

Run `npx expo start` and verify:
- Day strip shows correct days with completion status
- Overview bento renders Steps ring, Calories, Heart Rate with ECG
- Nutrition card shows dynamic macros from meal_logs
- Streak and achievements show real data
- Weekly and monthly summaries show real stats
- Recovery card renders with placeholder data
- Pull-to-refresh works
- No console errors

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/app/(app)/progress.tsx
git commit -m "feat: redesign progress screen with single-scroll dashboard layout"
```
