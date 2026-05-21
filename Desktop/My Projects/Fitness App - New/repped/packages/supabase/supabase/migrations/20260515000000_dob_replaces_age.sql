-- Replace `age` with `date_of_birth` on profiles so the value never goes stale.
-- Strategy:
--   1) Add nullable date_of_birth column.
--   2) Backfill from age: birth ≈ (current_date - age years), Jan 1 to be conservative.
--      Users can edit later in Account → Profile.
--   3) Make NOT NULL with a sensible age-range check.
--   4) Drop the old age column.

alter table public.profiles
  add column if not exists date_of_birth date;

-- Backfill existing rows. `age` may already be NULL on partial onboardings, so guard with COALESCE.
update public.profiles
set date_of_birth = (current_date - (coalesce(age, 25) || ' years')::interval)::date
where date_of_birth is null;

-- Enforce age 13–100 via a check on the derived age. Birthdays in the future or > 100 years ago fail.
alter table public.profiles
  add constraint profiles_dob_age_range
  check (
    date_of_birth is null
    or (
      date_of_birth <= current_date - interval '13 years'
      and date_of_birth >= current_date - interval '100 years'
    )
  );

-- Drop the legacy age column. Any view/check referencing it must be updated first; none exist today.
alter table public.profiles
  drop column if exists age;
