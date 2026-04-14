-- Make workout_plan_id nullable on workout_logs so that logs survive plan regeneration.
-- When a user regenerates their workout plan, old logs get detached (set to null)
-- instead of being orphaned or causing FK constraint errors.

ALTER TABLE public.workout_logs
  ALTER COLUMN workout_plan_id DROP NOT NULL;
