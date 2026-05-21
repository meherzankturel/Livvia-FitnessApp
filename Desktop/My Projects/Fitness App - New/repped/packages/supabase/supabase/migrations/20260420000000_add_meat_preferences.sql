-- Add meat_preferences column for non-vegetarian users who prefer specific meats
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS meat_preferences text[] DEFAULT '{}';
