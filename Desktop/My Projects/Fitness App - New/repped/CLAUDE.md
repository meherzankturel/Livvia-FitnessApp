# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Livvia** is an AI-powered fitness app built as a Turborepo monorepo with a React Native (Expo) mobile app, a Next.js web app, and shared packages for business logic, types, and database access.

## Commands

```bash
# Development
npm run dev                          # Start all apps (turbo)
cd apps/mobile && npx expo start     # Mobile only (Expo Go)
cd apps/web && npm run dev           # Web only (Next.js, port 3000)

# Build
npm run build                        # Build all (mobile skips — uses EAS)
cd apps/web && npm run build         # Web production build

# Type checking (no test suite or linter configured yet)
cd apps/mobile && npx tsc --noEmit
cd apps/web && npx tsc --noEmit
```

## Architecture

### Monorepo Layout (Turborepo + npm workspaces)

- **`apps/mobile/`** — Expo SDK 54, React Native 0.81, Expo Router v6 (file-based routing)
- **`apps/web/`** — Next.js 15, React 19, App Router
- **`packages/shared/`** — Framework-agnostic business logic: Zod schemas (`types/`), fitness algorithms (`algorithms/`), data constants (`constants/`), Zustand stores (`stores/`), formatting utils
- **`packages/supabase/`** — Supabase client, auth helpers, DB types, migrations, edge functions
- **`packages/ui/`** — Shared UI components (placeholder)

### Critical: Metro Entry Proxy

`/repped/index.js` at monorepo root proxies `expo-router/entry`. Expo SDK 54 workspace detection sets Metro root to the monorepo root instead of `apps/mobile/`. **Do not remove this file** — Metro can't resolve modules without it.

### Mobile Routing (`apps/mobile/app/`)

- `(auth)/` — Sign-in/sign-up screens
- `(onboarding)/` — 7-step onboarding flow (step1–step7)
- `(app)/` — Main tabbed app (4 visible tabs: index, meals, progress, settings)
- Hidden screens (workout-player, achievements, grocery-list, recipe, etc.) use `href: null`
- Tab bar filters visibility via `VISIBLE_TABS` constant in `LiquidGlassTabBar.tsx`

### State & Data

- **State:** Zustand (`useAuthStore`, `useOnboardingStore`)
- **Database:** Supabase PostgreSQL (profiles, workout_plans, exercises, set_logs, etc.)
- **Auth:** Supabase Auth (email/password)
- **Styling:** `twrnc` (not NativeWind at runtime) with custom tailwind config; shared style constants in `src/lib/styles.ts`

## Expo Go Constraints

These crash in Expo Go and must be avoided:

- **No `expo-linear-gradient`** — simulate with layered Views and pseudo-gradients
- **No `react-native-svg`** — use View-based geometric icons (see `BadgeIcon.tsx`, `MuscleIcon.tsx`)
- **No `react-native-reanimated` worklets** — use React Native's built-in `Animated` API only
- **`twrnc` opacity bug** — `bg-[#0090ff]/10` doesn't work; use inline `{ backgroundColor: "rgba(...)" }` instead

## Design System

- **Theme:** Light (white `#FFFFFF` background, card surfaces `#F2F2F7`/`#F5F5F8`)
- **Accent:** Soft indigo `#6366F1`
- **Text:** Primary `#1C1C1E`, secondary `#8E8E93`, tertiary `#AEAEB2`
- **Tab bar:** Custom floating glass pill (`LiquidGlassTabBar.tsx`) with sliding animation

## Key References

- `SESSION_CONTEXT.md` — Detailed architecture, feature status, and implementation notes
- `BUSINESS_STRATEGY.md` — Revenue model, pricing, market positioning
- `apps/mobile/.env.example` / `apps/web/.env.example` — Required environment variables
