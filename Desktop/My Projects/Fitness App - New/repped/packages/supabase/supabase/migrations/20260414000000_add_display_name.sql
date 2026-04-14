-- Add display_name to profiles for personalized greetings
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name text;
