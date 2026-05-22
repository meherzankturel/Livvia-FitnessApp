-- Per-user rate limiting for the ext-proxy Edge Function.
--
-- The proxy calls billable third-party APIs (Gemini, Google Places) on the user's
-- behalf. A signed-in user could otherwise hammer it and run up the bill. This adds a
-- DB-backed fixed-window limiter: each user gets N requests per window; over that, the
-- function returns 429. State lives in Postgres so it works across all function workers.

create table if not exists public.api_rate_limit (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  window_start timestamptz not null default now(),
  count        integer not null default 0
);

-- The table is only ever touched through the SECURITY DEFINER function below, so lock
-- it down: enable RLS with no policies => no direct client access at all.
alter table public.api_rate_limit enable row level security;

-- Atomically record one request for the CURRENT user and report whether they're still
-- within the limit. Derives the user from auth.uid() inside the function so a caller
-- cannot consume/affect another user's budget.
create or replace function public.consume_rate_limit(p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  new_count integer;
begin
  if uid is null then
    return false; -- unauthenticated: deny
  end if;

  insert into public.api_rate_limit as r (user_id, window_start, count)
    values (uid, now(), 1)
  on conflict (user_id) do update
    set
      window_start = case
        when r.window_start < now() - make_interval(secs => p_window_seconds) then now()
        else r.window_start
      end,
      count = case
        when r.window_start < now() - make_interval(secs => p_window_seconds) then 1
        else r.count + 1
      end
  returning count into new_count;

  return new_count <= p_limit;
end;
$$;

-- Only logged-in users may call it; revoke from anon for safety.
revoke all on function public.consume_rate_limit(integer, integer) from public, anon;
grant execute on function public.consume_rate_limit(integer, integer) to authenticated;
