-- Security hardening for Row-Level Security policies.
--
-- The UPDATE policies below were created with only a USING clause. Postgres then
-- reuses USING as the WITH CHECK expression, so they are safe *today* — but only by
-- accident. If anyone later edits the USING predicate to something that doesn't
-- reference the owner column, the post-update ownership check silently disappears
-- and a user could reassign a row to another user. Pinning an explicit WITH CHECK
-- makes the ownership guarantee permanent and self-documenting (defense in depth).

-- profiles.UPDATE — owner is the row id
alter policy "Users can update own profile" on public.profiles
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- workout_logs.UPDATE — owner is user_id
alter policy "Users can update own workout logs" on public.workout_logs
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- personal_records.UPDATE — owner is user_id
alter policy "Users can update own PRs" on public.personal_records
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Storage: the avatar UPDATE policy had USING but no WITH CHECK, which let a user
-- MOVE/RENAME a file INTO another user's folder on update (the new path was never
-- re-validated). Add a WITH CHECK so the destination path must also be in the
-- caller's own folder.
alter policy "Users can update own avatar" on storage.objects
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- NOTE ON PRIVATE PHOTOS (no schema change here — guidance for when you build it):
-- The `avatars` bucket is intentionally public-read (avatars are low-sensitivity and
-- the app loads them via getPublicUrl). Do NOT store body / progress photos there.
-- When `progress_entries.photo_url` is wired to real uploads, create a SEPARATE
-- PRIVATE bucket and scope read access to the owner, e.g.:
--
--   insert into storage.buckets (id, name, public) values ('progress-photos','progress-photos', false);
--   create policy "Users read own progress photos" on storage.objects
--     for select using (
--       bucket_id = 'progress-photos'
--       and auth.uid()::text = (storage.foldername(name))[1]
--     );
--   create policy "Users write own progress photos" on storage.objects
--     for insert with check (
--       bucket_id = 'progress-photos'
--       and auth.uid()::text = (storage.foldername(name))[1]
--     );
-- Serve those images with createSignedUrl(), not getPublicUrl().
