-- NASM OPT-aligned training phase tracking
-- Beginners start in 'stabilization' (NASM Phase 1)
-- Intermediates/Advanced start in 'hypertrophy' (NASM Phase 3)

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS training_phase TEXT DEFAULT 'stabilization'
    CHECK (training_phase IN ('stabilization', 'strength_endurance', 'hypertrophy', 'strength', 'power')),
  ADD COLUMN IF NOT EXISTS phase_start_date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS phase_week INTEGER DEFAULT 1;
