-- Livvia: add target_weight_kg to profiles
--
-- Captured during onboarding (Step 4) for users with goal=lose_fat or
-- build_muscle. Nullable for users who chose 'maintain' or who completed
-- onboarding before this column existed.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS target_weight_kg NUMERIC;
