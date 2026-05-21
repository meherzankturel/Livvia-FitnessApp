-- Livvia: NASM auto-phase-advance + conditioning-day support
--
-- Purpose:
--   1. Defensively backfill profiles.phase_start_date for any pre-existing
--      rows where it might be NULL (legacy data from before the column had
--      a default).
--   2. Allow workout_plans rows to represent ACSM-compliant conditioning days
--      in addition to strength days, while preserving every existing row as
--      a strength day (default 'strength' applies during the ADD COLUMN).
--   3. Add an audit log of NASM OPT phase advancements for debugging and
--      future "your training journey" features.
--
-- Safety: All ADD COLUMN operations are IF NOT EXISTS and idempotent.
-- Existing rows are not rewritten — defaults handle backfill.

-- ─── 1. Backfill phase_start_date for legacy rows ──────────────────────────
-- Column was added with DEFAULT CURRENT_DATE in 20260415100000_add_training_phase.sql,
-- but defensive: if any row still has NULL (e.g. created via direct insert
-- bypassing defaults), fill it with the row's creation date so the phase
-- clock has a defined starting point.
UPDATE public.profiles
   SET phase_start_date = COALESCE(phase_start_date, created_at::date)
 WHERE phase_start_date IS NULL;

-- ─── 2. Conditioning support on workout_plans ──────────────────────────────
-- Every existing row becomes a 'strength' day automatically via the DEFAULT.
ALTER TABLE public.workout_plans
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'strength'
    CHECK (kind IN ('strength', 'conditioning'));

ALTER TABLE public.workout_plans
  ADD COLUMN IF NOT EXISTS conditioning_template_name TEXT;

-- Coherence: a conditioning day MUST have a template; a strength day MUST NOT.
-- Use DO block so re-running the migration does not error on duplicate constraint.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'workout_plans_conditioning_template_consistency'
  ) THEN
    ALTER TABLE public.workout_plans
      ADD CONSTRAINT workout_plans_conditioning_template_consistency
        CHECK (
          (kind = 'conditioning' AND conditioning_template_name IS NOT NULL)
          OR
          (kind = 'strength' AND conditioning_template_name IS NULL)
        );
  END IF;
END $$;

-- ─── 3. Index for fast phase-advancement queries ───────────────────────────
-- Home-screen load counts completed workouts since phase_start_date.
-- A partial index over completed, non-skipped logs keeps the count cheap.
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_completed
  ON public.workout_logs(user_id, started_at DESC)
  WHERE skipped = false AND completed_at IS NOT NULL;

-- ─── 4. Phase-advancement audit log ────────────────────────────────────────
-- One row per phase transition. Small (a user changes phases a few times per
-- year), useful for debugging and future progress-history features.
CREATE TABLE IF NOT EXISTS public.phase_advancements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  from_phase TEXT NOT NULL,
  to_phase TEXT NOT NULL,
  weeks_in_previous_phase NUMERIC NOT NULL,
  completed_sessions_in_phase INTEGER NOT NULL,
  advanced_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.phase_advancements ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'phase_advancements'
       AND policyname = 'Users can view own phase advancements'
  ) THEN
    CREATE POLICY "Users can view own phase advancements"
      ON public.phase_advancements
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'phase_advancements'
       AND policyname = 'Users can insert own phase advancements'
  ) THEN
    CREATE POLICY "Users can insert own phase advancements"
      ON public.phase_advancements
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_phase_advancements_user_id
  ON public.phase_advancements(user_id);
