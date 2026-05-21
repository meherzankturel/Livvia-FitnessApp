-- Livvia: collapse regional Indian cuisine preferences to a single "indian"
--
-- Previously stored values like indian_north / indian_south / indian_west /
-- indian_east all map to the unified "indian" category now. This UPDATE
-- rewrites any affected cuisine_preferences arrays, deduplicating in case
-- a user had multiple regional Indian entries (which all collapse to one).

UPDATE public.profiles
SET cuisine_preferences = (
  SELECT ARRAY(
    SELECT DISTINCT
      CASE
        WHEN c LIKE 'indian_%' THEN 'indian'
        ELSE c
      END
    FROM unnest(cuisine_preferences) AS c
  )
)
WHERE 'indian_north' = ANY(cuisine_preferences)
   OR 'indian_south' = ANY(cuisine_preferences)
   OR 'indian_west'  = ANY(cuisine_preferences)
   OR 'indian_east'  = ANY(cuisine_preferences);
