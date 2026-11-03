-- Casino guests: which wristband (card uid) belongs to which player, and how the board shows them.
-- Run in the Supabase dashboard: SQL Editor -> New query -> paste -> Run. Safe to re-run.
-- public.nfc_reads (the tap log) is created by the a05-live-data project's supabase/schema.sql; run that first.
-- Seed 20 guests that match supabase/seed.sql with supabase/seed_users.sql.

create table if not exists public.users (
  uid        text primary key,                 -- card UID exactly as the readers print it, e.g. 04:A3:2B:1C:5D:80:00
  user_nm    text not null
             check (char_length(user_nm) between 1 and 16),   -- 16 characters fit one board row
  avatar     text not null
             check (avatar in ('qubit','cat','chip','atom','wave','entangle',
                               'dice','chips','spade','lattice','orbital','tunnel')),  -- the 12 preset avatars
  created_at timestamptz not null default now()
);

-- The board reads this table with the public anon key; nobody writes through it (dashboard / future registration site only).
alter table public.users enable row level security;

drop policy if exists "anon can read users" on public.users;
create policy "anon can read users" on public.users
  for select to anon using (true);
