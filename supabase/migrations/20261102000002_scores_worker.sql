-- Running totals, written by the score-taps worker (supabase/functions/score-taps/index.ts),
-- which Supabase Cron runs every 10 seconds (supabase/schedule.sql).
-- Run in the Supabase dashboard: SQL Editor -> New query -> paste -> Run. Safe to re-run.
-- Needs public.nfc_reads (a05-live-data schema.sql) and public.users (20261102000001_users.sql).

-- What the worker reads: taps per card per reader, straight from the tap log.
create or replace view public.tap_counts as
  select uid,
         reader_id,
         count(*)::integer as taps,
         max(read_at)      as last_tap_at
  from public.nfc_reads
  group by uid, reader_id;

-- Only the worker (service role) needs the view.
revoke all on public.tap_counts from anon, authenticated;

-- What the board reads: one row per card per game.
create table if not exists public.scores (
  uid         text not null,                 -- card UID, joins to users.uid (guests without a users row still score)
  game_id     text not null,                 -- uncertainty | plinko | seventeen | quantem | quabble
  taps        integer not null default 0,
  score       integer not null default 0,    -- 100 points per tap
  last_tap_at timestamptz,
  updated_at  timestamptz not null default now(),
  primary key (uid, game_id)
);

-- Heartbeat: one row the worker updates every run, so the board can show when the cron job has stopped.
create table if not exists public.worker_state (
  id           integer primary key default 1 check (id = 1),
  last_run_at  timestamptz,
  last_ok      boolean,
  last_message text,
  changed_rows integer,
  runs         bigint not null default 0
);

alter table public.scores       enable row level security;
alter table public.worker_state enable row level security;

-- The board reads with the anon key; only the worker (service role, bypasses RLS) writes.
drop policy if exists "anon can read scores" on public.scores;
create policy "anon can read scores" on public.scores
  for select to anon using (true);

drop policy if exists "anon can read worker_state" on public.worker_state;
create policy "anon can read worker_state" on public.worker_state
  for select to anon using (true);

-- Realtime: the board subscribes to changes on scores and users. Full replica identity so
-- deletes carry the old row (a score removed when its taps are deleted).
alter table public.scores replica identity full;

do $$
begin
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'scores') then
    alter publication supabase_realtime add table public.scores;
  end if;
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'users') then
    alter publication supabase_realtime add table public.users;
  end if;
end $$;
