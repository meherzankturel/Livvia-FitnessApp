-- Cuisine taxonomy change: "east_asian" was renamed to "asian" (broader bucket
-- covering East + Southeast Asian dishes). Update existing user profiles so
-- their saved cuisine_preferences keep working under the new key.

UPDATE public.profiles
SET cuisine_preferences = array_replace(cuisine_preferences, 'east_asian', 'asian')
WHERE 'east_asian' = ANY(cuisine_preferences);
