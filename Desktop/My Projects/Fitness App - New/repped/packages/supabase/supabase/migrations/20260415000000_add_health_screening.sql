-- PAR-Q+ health screening fields
-- health_conditions stores question IDs where user answered "Yes":
--   'heart_condition', 'chest_pain_activity', 'chest_pain_rest',
--   'dizziness', 'bone_joint', 'blood_pressure_meds', 'other_reason'
-- health_cleared = false means user answered YES to any PAR-Q question

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS health_conditions TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS health_cleared BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS health_screening_completed BOOLEAN DEFAULT FALSE;
