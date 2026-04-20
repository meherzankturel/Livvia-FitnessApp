-- Add missing columns to profiles that the onboarding upsert requires
-- B8 fix: cuisine_preferences and current_injuries columns were never created

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cuisine_preferences text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_injuries jsonb DEFAULT '[]';

-- Fix equipment enum: onboarding offers 'home_gym' but the CHECK constraint doesn't allow it
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_equipment_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_equipment_check
  CHECK (equipment IN ('full_gym', 'home_gym', 'dumbbells_only', 'bodyweight'));
