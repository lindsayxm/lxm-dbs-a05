# Deployment from scratch

Prerequisites: Node 22, a Supabase account, a Vercel account, the repo on GitHub. Run `npm install` at the repo root once (installs the Supabase CLI).

## 1. Supabase project

- Dashboard → New project. Copy from Project Settings → API: the **Project URL**, the **publishable (anon) key**, and one **secret key**.
- SQL Editor → run, in this order:
  - `a05-live-data/supabase/schema.sql` — creates `nfc_reads` (skip if the readers already log to this project)
  - `supabase/migrations/20261102000001_users.sql`
  - `supabase/migrations/20261102000002_scores_worker.sql`
  - optional test data: `supabase/seed.sql` (taps) and `supabase/seed_users.sql` (20 guests)
- CLI alternative for any SQL file: `npx supabase login`, `npm run supabase:link -- <project-ref>`, then `npm run db:sql -- <file.sql>`.

## 2. Worker (Edge Function + Cron)

- `npx supabase login` (once), then `npm run supabase:link -- <project-ref>` (the ref is the subdomain of the project URL).
- `npm run worker:deploy` — deploys `supabase/functions/score-taps`.
- SQL Editor → run `supabase/schedule.sql` (enables pg_cron + pg_net, creates the 10-second job). New project: replace the project URL in the file first.
- SQL Editor → store the key the job sends:
  ```sql
  select vault.create_secret('<secret key>', 'worker_key', 'key the score-taps cron job sends');
  ```
- Check: `select * from public.worker_state;` ticks every 10 s; Edge Functions → score-taps → Logs shows runs.

## 3. Readers

- In `a05-live-data/esp32c3_pn532_reader/secrets.h` set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `READER_ID` (`esp32c3-1` … `esp32c3-5`, one per game), then flash or run `tools/serial_bridge.py`.

## 4. Web app locally

- `cp apps/web/.env.example apps/web/.env` and fill in `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (URL + publishable key, twice). Optional: `SUPABASE_SECRET_KEY` for `npm run push-check`.
- `npm run web:dev` → http://localhost:3000. The header should read `LIVE · PUSH`.

## 5. Vercel

- Vercel → Add New → Project → import the GitHub repo.
- **Root Directory: `apps/web`** (Framework preset: Next.js, detected automatically).
- Settings → Environment Variables (Production; add Preview too if you use branch deploys):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Deploy. If the variables were added after a deploy, Deployments → ⋯ → Redeploy (they are baked in at build time).
- Open the production URL: ten rows, header `LIVE · PUSH`. A `SIGNAL FAULT` panel names what is missing.

## 6. Register guests

- Table Editor → `users`, or SQL:
  ```sql
  insert into public.users (uid, user_nm, avatar) values ('<card uid>', 'Name', 'qubit');
  ```
  `uid` as the reader prints it (e.g. `04:D4:16:67:CF:EF:62`); names up to 16 characters; avatars: `qubit cat chip atom wave entangle dice chips spade lattice orbital tunnel`. Unregistered cards show as `GUEST-xxxx` until then.

Problems: see the Troubleshooting table in [README.md](README.md).
