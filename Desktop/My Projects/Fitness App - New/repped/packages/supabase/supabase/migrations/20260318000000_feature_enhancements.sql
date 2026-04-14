-- Feature Enhancements Migration
-- New columns, tables, RLS policies, and indexes

-- =============================================================================
-- ALTER EXISTING TABLES
-- =============================================================================

-- Add food exclusions to profiles (for allergy/dislike filtering)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS food_exclusions text[] DEFAULT '{}';

-- Add animation URL and secondary muscles to exercises
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS animation_url text;
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS secondary_muscles text[] DEFAULT '{}';

-- =============================================================================
-- NEW TABLE: body_measurements
-- =============================================================================
CREATE TABLE public.body_measurements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT current_date,
  waist_cm numeric,
  chest_cm numeric,
  left_arm_cm numeric,
  right_arm_cm numeric,
  left_thigh_cm numeric,
  right_thigh_cm numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own measurements" ON public.body_measurements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own measurements" ON public.body_measurements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_body_measurements_user_id ON public.body_measurements(user_id);

-- =============================================================================
-- NEW TABLE: personal_records
-- =============================================================================
CREATE TABLE public.personal_records (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES public.exercises(id),
  record_type text NOT NULL CHECK (record_type IN ('weight', 'estimated_1rm', 'volume')),
  value numeric NOT NULL,
  achieved_at timestamptz NOT NULL DEFAULT now(),
  workout_log_id uuid REFERENCES public.workout_logs(id),
  UNIQUE(user_id, exercise_id, record_type)
);

ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own PRs" ON public.personal_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own PRs" ON public.personal_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own PRs" ON public.personal_records FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX idx_personal_records_user_id ON public.personal_records(user_id);

-- =============================================================================
-- NEW TABLE: wellness_logs
-- =============================================================================
CREATE TABLE public.wellness_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT current_date,
  sleep_quality integer CHECK (sleep_quality BETWEEN 1 AND 5),
  energy_level integer CHECK (energy_level BETWEEN 1 AND 5),
  soreness_level integer CHECK (soreness_level BETWEEN 1 AND 5),
  nutrition_adherence text CHECK (nutrition_adherence IN ('yes', 'mostly', 'no')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wellness_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wellness" ON public.wellness_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wellness" ON public.wellness_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_wellness_logs_user_id ON public.wellness_logs(user_id);

-- =============================================================================
-- NEW TABLE: achievements
-- =============================================================================
CREATE TABLE public.achievements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  category text NOT NULL CHECK (category IN ('workout', 'streak', 'progress', 'nutrition'))
);

-- Achievements are readable by all authenticated users (reference data)
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view achievements" ON public.achievements FOR SELECT TO authenticated USING (true);

-- =============================================================================
-- NEW TABLE: user_achievements
-- =============================================================================
CREATE TABLE public.user_achievements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id),
  achieved_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);

-- =============================================================================
-- SEED ACHIEVEMENTS
-- =============================================================================
INSERT INTO public.achievements (key, name, description, icon, category) VALUES
('first_workout', 'First Rep', 'Completed your first workout', '🎯', 'workout'),
('10_workouts', 'Getting Serious', 'Completed 10 workouts', '💪', 'workout'),
('50_workouts', 'Iron Regular', 'Completed 50 workouts', '🏆', 'workout'),
('100_workouts', 'Century Club', 'Completed 100 workouts', '👑', 'workout'),
('streak_3', 'On a Roll', '3-week workout streak', '🔥', 'streak'),
('streak_7', 'Unstoppable', '7-week workout streak', '⚡', 'streak'),
('streak_30', 'Machine Mode', '30-week workout streak', '🤖', 'streak'),
('first_pr', 'New Heights', 'Set your first personal record', '📈', 'progress'),
('weight_logged', 'Scale Warrior', 'Logged your weight for the first time', '⚖️', 'progress'),
('measurement_logged', 'Measure Up', 'Logged body measurements for the first time', '📏', 'progress'),
('perfect_week', 'Perfect Week', 'Completed all planned workouts in a week', '⭐', 'workout'),
('early_bird', 'Early Bird', 'Started a workout before 7 AM', '🌅', 'workout'),
('night_owl', 'Night Owl', 'Started a workout after 9 PM', '🌙', 'workout'),
('first_checkin', 'Self-Aware', 'Completed your first weekly check-in', '✅', 'progress'),
('wellness_streak', 'Mind & Body', 'Logged wellness for 7 consecutive days', '🧘', 'nutrition');
