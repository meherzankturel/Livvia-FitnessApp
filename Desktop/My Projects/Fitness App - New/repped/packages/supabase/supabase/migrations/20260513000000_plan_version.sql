-- Livvia: plan_version for automatic stale-plan detection
--
-- Adds a generator-version tag to each workout_plans row. The mobile app
-- compares this against CURRENT_PLAN_VERSION on home-screen load and silently
-- regenerates any plan flagged as stale. Future generator-logic updates ship
-- by bumping the constant — no SQL migration required.

ALTER TABLE public.workout_plans
  ADD COLUMN IF NOT EXISTS plan_version INT NOT NULL DEFAULT 1;
