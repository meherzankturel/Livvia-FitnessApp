-- Push notification device tokens.
-- One row per device; a user can have several (phone, tablet, reinstall).
-- The mobile app upserts on `expo_token`; the send-notification Edge Function
-- reads these (via service role) to deliver "Revive" notifications.

create table if not exists public.push_tokens (
  expo_token  text primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  platform    text not null default 'unknown',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists push_tokens_user_id_idx on public.push_tokens (user_id);

alter table public.push_tokens enable row level security;

-- A user may read / write only their own device tokens.
create policy "Users manage own push tokens"
  on public.push_tokens
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
