-- Repped: Initial Schema
-- All tables have RLS enabled: users can only access their own data

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  age integer not null check (age >= 13 and age <= 100),
  weight_kg numeric not null check (weight_kg > 0),
  height_cm numeric not null check (height_cm > 0),
  sex text not null check (sex in ('male', 'female')),
  activity_level text not null check (activity_level in ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
  training_history text not null check (training_history in ('beginner', 'intermediate', 'advanced')),
  goal text not null check (goal in ('lose_fat', 'maintain', 'build_muscle')),
  equipment text not null check (equipment in ('full_gym', 'dumbbells_only', 'bodyweight')),
  days_per_week integer not null check (days_per_week >= 2 and days_per_week <= 7),
  dietary_preference text not null default 'no_preference' check (dietary_preference in ('no_preference', 'vegetarian', 'vegan', 'pescatarian', 'keto')),
  tdee numeric,
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'pro', 'coach')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Exercises (master library)
create table public.exercises (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  muscle_group text not null check (muscle_group in ('chest', 'back', 'shoulders', 'biceps', 'triceps', 'quads', 'hamstrings', 'glutes', 'calves', 'core', 'full_body')),
  equipment text[] not null default '{}',
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
  instructions text not null default '',
  explain_eli5 text not null default '',
  default_sets integer not null default 3,
  default_reps integer not null default 10,
  default_rest_seconds integer not null default 90,
  created_at timestamptz not null default now()
);

-- Workout Plans
create table public.workout_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  week integer not null check (week >= 1),
  day integer not null check (day >= 1 and day <= 7),
  focus text not null,
  is_rest_day boolean not null default false,
  created_at timestamptz not null default now()
);

-- Workout Plan Exercises
create table public.workout_plan_exercises (
  id uuid default gen_random_uuid() primary key,
  workout_plan_id uuid not null references public.workout_plans(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id),
  "order" integer not null,
  target_sets integer not null,
  target_reps integer not null,
  target_rpe numeric check (target_rpe >= 1 and target_rpe <= 10),
  rest_seconds integer not null default 90,
  explain_why text
);

-- Workout Logs
create table public.workout_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  workout_plan_id uuid not null references public.workout_plans(id),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  skipped boolean not null default false,
  life_happened boolean not null default false
);

-- Set Logs
create table public.set_logs (
  id uuid default gen_random_uuid() primary key,
  workout_log_id uuid not null references public.workout_logs(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id),
  set_number integer not null,
  reps integer not null,
  weight_kg numeric not null default 0,
  rpe numeric check (rpe >= 1 and rpe <= 10)
);

-- Meal Plans
create table public.meal_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  target_calories numeric not null,
  target_protein_g numeric not null,
  target_carbs_g numeric not null,
  target_fat_g numeric not null,
  meals jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- Progress Entries
create table public.progress_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null default current_date,
  weight_kg numeric,
  body_fat_pct numeric,
  photo_url text,
  notes text,
  created_at timestamptz not null default now()
);

-- Weekly Check-ins
create table public.weekly_checkins (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  week integer not null,
  difficulty_rating text not null check (difficulty_rating in ('too_easy', 'just_right', 'too_hard')),
  adjustment_applied text,
  created_at timestamptz not null default now()
);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.workout_plans enable row level security;
alter table public.workout_plan_exercises enable row level security;
alter table public.workout_logs enable row level security;
alter table public.set_logs enable row level security;
alter table public.meal_plans enable row level security;
alter table public.progress_entries enable row level security;
alter table public.weekly_checkins enable row level security;

-- RLS Policies: Users can only access their own data
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Exercises are readable by all authenticated users
create policy "Authenticated users can view exercises" on public.exercises for select to authenticated using (true);

create policy "Users can view own workout plans" on public.workout_plans for select using (auth.uid() = user_id);
create policy "Users can insert own workout plans" on public.workout_plans for insert with check (auth.uid() = user_id);
create policy "Users can delete own workout plans" on public.workout_plans for delete using (auth.uid() = user_id);

create policy "Users can view own workout plan exercises" on public.workout_plan_exercises for select
  using (exists (select 1 from public.workout_plans wp where wp.id = workout_plan_id and wp.user_id = auth.uid()));
create policy "Users can insert own workout plan exercises" on public.workout_plan_exercises for insert
  with check (exists (select 1 from public.workout_plans wp where wp.id = workout_plan_id and wp.user_id = auth.uid()));

create policy "Users can view own workout logs" on public.workout_logs for select using (auth.uid() = user_id);
create policy "Users can insert own workout logs" on public.workout_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own workout logs" on public.workout_logs for update using (auth.uid() = user_id);

create policy "Users can view own set logs" on public.set_logs for select
  using (exists (select 1 from public.workout_logs wl where wl.id = workout_log_id and wl.user_id = auth.uid()));
create policy "Users can insert own set logs" on public.set_logs for insert
  with check (exists (select 1 from public.workout_logs wl where wl.id = workout_log_id and wl.user_id = auth.uid()));

create policy "Users can view own meal plans" on public.meal_plans for select using (auth.uid() = user_id);
create policy "Users can insert own meal plans" on public.meal_plans for insert with check (auth.uid() = user_id);

create policy "Users can view own progress" on public.progress_entries for select using (auth.uid() = user_id);
create policy "Users can insert own progress" on public.progress_entries for insert with check (auth.uid() = user_id);

create policy "Users can view own checkins" on public.weekly_checkins for select using (auth.uid() = user_id);
create policy "Users can insert own checkins" on public.weekly_checkins for insert with check (auth.uid() = user_id);

-- Updated_at trigger for profiles
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Indexes for common queries
create index idx_workout_plans_user_id on public.workout_plans(user_id);
create index idx_workout_logs_user_id on public.workout_logs(user_id);
create index idx_set_logs_workout_log_id on public.set_logs(workout_log_id);
create index idx_meal_plans_user_id on public.meal_plans(user_id);
create index idx_progress_entries_user_id on public.progress_entries(user_id);
create index idx_weekly_checkins_user_id on public.weekly_checkins(user_id);
