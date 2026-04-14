-- Create meal_logs table for tracking actual meals consumed.
-- This table stores what the user actually ate (vs meal_plans which stores targets).
-- Used by: meals.tsx (logging), progress.tsx (nutrition tracking), NutritionCorrelation.

CREATE TABLE public.meal_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  meal_name text NOT NULL,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  calories integer NOT NULL DEFAULT 0,
  protein_g integer NOT NULL DEFAULT 0,
  carbs_g integer NOT NULL DEFAULT 0,
  fat_g integer NOT NULL DEFAULT 0,
  date date NOT NULL DEFAULT current_date,
  logged_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meal logs" ON public.meal_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meal logs" ON public.meal_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own meal logs" ON public.meal_logs
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_meal_logs_user_date ON public.meal_logs(user_id, date);
