# Quantum Casino Leaderboard — Supabase worker + Realtime (Assignment 5)

## Context

Phase 1 shipped the wall-screen board on a mock. The NFC side lives in `/Users/li/mpcs_dbs/a05-live-data`: an ESP32-C3 reader (or the laptop serial bridge) inserts one row per physical tap into `public.nfc_reads (id, uid, reader_id, read_at)` (RLS on; anon may insert + select; test rows use `reader_id = 'laptop-test'`). `supabase/seed.sql` holds 295 taps from 20 cards.

Assignment 5 requirement (user, 2026-11-02) + the Week 5 walkthrough + the user's `data-flow.png`:
- **Worker** = a Supabase Edge Function (small TypeScript function, code in the repo's `supabase/functions` folder) that **Supabase Cron calls every few seconds**. It "looks for delta" in `nfc_reads` and keeps running totals.
- **Monorepo**: `apps/web` (Next.js, Vercel Root Directory = `apps/web`) + `supabase/` (functions, SQL).
- **Web** reads from Supabase only and gets **Realtime pushes** on change; a slow poll is the fallback.
- **Second table** for identity, named as in the diagram: **`users (uid, user_nm, avatar)`**; I write schema + seed, the user runs them. The "User Registration Site" in the diagram is out of scope (backlog).
- Scoring: `esp32c3-1..5` → Uncertainty, Plinko, 17, Quant'em, Quabble; **+100 per tap**; all reads count; a card with no `users` row shows as `GUEST-<last 4 hex>` with the fallback avatar.
- Deployment: I run the Supabase CLI from here (`npx supabase@3`, nothing is installed; Docker exists); the user runs `npx supabase login` and gives me the project ref. SQL is pasted into the SQL Editor (the user's existing workflow; also works with `supabase db push`).

Facts that shape the implementation:
- `.env` sits at `/Users/li/mpcs_dbs/a05-leaderboard/.env`; Next.js only loads env from the app root → move it to `apps/web/.env` (`mv`, never read). It already uses `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_TABLE`.
- Supabase Cron supports `'10 seconds'` intervals (Postgres ≥ 15.1.1.61; pg_cron + pg_net enabled). Pattern: `cron.schedule(name, '10 seconds', $$ select net.http_post(url := <project_url>/functions/v1/<fn>, headers := jsonb_build_object('apikey', <secret key from Vault>), body := …, timeout_milliseconds := 8000) $$)`.
- Edge Function auth for server-side callers: `verify_jwt = false` and the function itself validates the `apikey` header against the project's secret keys (`SUPABASE_SECRET_KEYS` JSON env; legacy `SUPABASE_SERVICE_ROLE_KEY`; local `SUPABASE_SECRET_KEY`). Default env inside functions includes `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Deploy with `--use-api` (no Docker) and `--no-verify-jwt`.
- Realtime: `alter publication supabase_realtime add table …`; anon listeners receive rows their RLS select policy allows; JS `supabase.channel(name).on('postgres_changes', { event: '*', schema: 'public', table }, cb).subscribe()`.
- Next 16 + Cache Components: uncached fetches are request-time; keep `await io()` in `BoardLoader` and `await connection()` in the route. PostgREST pages at 1000 rows.
- Root `.gitignore` uses `/node_modules`, `/.next/` (root-anchored): after the move they must become `node_modules/`, `.next/`; add `!.env.example`, `supabase/.temp/`.

## Target layout

```
lxm-dbs-a05/
  AGENTS.md · README.md · kanban-list.md · docs/ (plans, shots) · data-flow.png · .gitignore
  package.json                  (private, scripts only: web:dev, web:build, worker:deploy, supabase:link)
  apps/web/                     ← git mv of the Next.js app (package.json, src/, public/, next.config.ts, tsconfig.json,
                                  eslint.config.mjs, vitest.config.mts, scripts/, .env (moved), .env.example)
  supabase/
    config.toml                 (project_id; [functions.score-taps] verify_jwt = false, entrypoint)
    functions/score-taps/index.ts          ← THE WORKER
    migrations/20261102000001_users.sql
    migrations/20261102000002_scores_worker.sql
    schedule.sql                (cron + Vault template; user fills project URL + secret key)
    seed.sql                    (taps, unchanged) · seed_users.sql (20 users)
```

## Data model (Supabase)

```
users         uid PK · user_nm (1–16 chars) · avatar (one of the 12 ids) · created_at           — anon select
nfc_reads     (owned by a05-live-data)                                                            — read by the worker
tap_counts    VIEW: uid, reader_id, taps = count(*), last_tap_at = max(read_at)                  — worker only
scores        (uid, game_id) PK · taps · score = 100·taps · last_tap_at · updated_at              — anon select; Realtime
worker_state  id=1 · last_run_at · last_ok · last_message · changed_rows · runs                   — anon select
```

## Worker: `supabase/functions/score-taps/index.ts`

Deno `Deno.serve`, `import { createClient } from "npm:@supabase/supabase-js@2"`. Every run (idempotent, "look for delta" = diff against stored):
1. Auth: reject unless `apikey` (or `Authorization: Bearer`) equals one of the project's secret keys (`SUPABASE_SECRET_KEYS` values, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY`) → 401.
2. Service-role client (`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`, defaults in the runtime). `select uid, reader_id, taps, last_tap_at from tap_counts`.
3. Map `reader_id` → game with `READER_GAMES` (same five pairs as the web; duplicated on purpose with a comment, since Deno cannot import from `apps/web`); skip unknown readers (`laptop-test`).
4. Desired rows `{uid, game_id, taps, score: taps*100, last_tap_at}`; `select * from scores`; **changed** = desired rows missing or differing; **removed** = stored rows with no desired counterpart (reads deleted).
5. `upsert(changed, { onConflict: "uid,game_id" })`, delete removed, `upsert worker_state {id:1, last_run_at, last_ok, changed_rows, runs+1, last_message}`.
6. `console.log` a one-line summary (Functions logs) and `Response.json({ changed, removed, rows, ran_at })`; errors → 500 with the message and `last_ok = false`.

## SQL for the user (pasted in the SQL Editor, in this order)

1. **`migrations/…_users.sql`**: `create table if not exists public.users (uid text primary key, user_nm text not null check (char_length(user_nm) between 1 and 16), avatar text not null check (avatar in ('qubit','cat','chip','atom','wave','entangle','dice','chips','spade','lattice','orbital','tunnel')), created_at timestamptz not null default now())`; RLS on; policy `anon can read users` (select). Re-runnable.
2. **`seed_users.sql`**: 20 `insert … on conflict (uid) do update` rows for the 20 seed card uids: the 16 names from `mockPlayers.ts` + 4 new (≤16 chars), avatars cycling the 12 ids; trailing `delete` comment.
3. **`migrations/…_scores_worker.sql`**: `tap_counts` view; `scores` + `worker_state` tables; RLS on both with anon **select** only (writes come from the service role); `alter table public.scores replica identity full`; `alter publication supabase_realtime add table public.scores, public.users`. Re-runnable.
4. **`schedule.sql`** (after the function is deployed): `create extension if not exists pg_cron; create extension if not exists pg_net;` · `vault.create_secret(<project url>, 'project_url')` · `vault.create_secret(<secret key>, 'worker_key')` · `cron.schedule('score-taps-every-10s', '10 seconds', $$ select net.http_post(url := (vault project_url) || '/functions/v1/score-taps', headers := jsonb_build_object('Content-Type','application/json','apikey', (vault worker_key)), body := jsonb_build_object('time', now()), timeout_milliseconds := 8000) $$)`. Comments: how to unschedule, and the two debug queries (`cron.job_run_details`, `net._http_response`).

## Web app (`apps/web`)

- **Env.** `src/lib/server/env.ts`: `supabaseUrl = SUPABASE_URL ?? NEXT_PUBLIC_SUPABASE_URL` (via the `projectOrigin()` helper from a04), `supabaseAnonKey = SUPABASE_ANON_KEY ?? NEXT_PUBLIC_SUPABASE_ANON_KEY`, `usersTable` (`SUPABASE_USERS_TABLE`, default `users`), `scoresTable` (default `scores`), `configured`; drop `source/mockSeed/mockFreezeAt`. `src/lib/env.ts`: `pollMs` default **15000** (fallback poll), `supabaseUrl`/`supabaseAnonKey` from `NEXT_PUBLIC_*`, `realtime` flag; drop `devTools`. `.env.example` lists all of these; the user adds the two `NEXT_PUBLIC_` lines to `.env` (same values as the existing two). `SUPABASE_TABLE` is no longer used by the web (documented).
- **Clients.** `src/lib/server/supabase.ts` (server-only singleton, anon key, `fetch … cache: "no-store"`, clear error when unconfigured). `src/lib/supabase/browser.ts` (lazy browser client or `null` when not configured).
- **Readers.** `src/lib/readers.ts`: `READER_GAMES` (five pairs) + `gameForReader()`; test pins the pairs.
- **Scoring (pure, tested)** `src/lib/leaderboard/scoring.ts`: row types `UserRow`, `ScoreRow`, `WorkerStateRow`; `guestName(uid)`; `buildPlayers(users, scores)` (registered + guests; `id = uid`, `username = user_nm`, `avatarId = avatar`, `joinedAt = min(created_at, earliest last_tap_at)`); `scoresToGameScores(scores)` (skip unknown `game_id`; `updatedAt = last_tap_at ?? updated_at`); `buildSnapshot(users, scores, state, now, limit)` → `{ generatedAt, entries: rankPlayers(...), totalPlayers, workerLastRunAt }`. `rankPlayers`, `format`, `games` reused unchanged.
- **Fetch** `src/lib/leaderboard/getSnapshot.ts` (server-only, replaces `getSource.ts`): parallel `users`, `scores` (paginated 1000), `worker_state`; throws on Supabase error.
- **Route** `/api/leaderboard`: `getSnapshot(limit)`; on error `console.error` + 502 JSON (SWR → LINK LOST, last board stays). **`BoardLoader`**: `await io(); getSnapshot()`.
- **Realtime** `src/lib/hooks/useRealtimeRefresh.ts`: channel `leaderboard` on `postgres_changes` for `scores` and `users` → debounced (200 ms) SWR `mutate()`; status → `liveStatus.realtime`; `removeChannel` on unmount. `LiveLeaderboard` keeps SWR (`refreshInterval: env.pollMs`, retry backoff) and calls the hook.
- **Header pill** (`liveStatus.ts`, `LiveIndicator.tsx`): `● LIVE` (socket subscribed or a fresh snapshot), `STALE` (no good snapshot for 3× pollMs), `LINK LOST` (error); new amber `WORKER IDLE` when `workerLastRunAt` is older than 60 s (cron stopped). Unchanged board/avatar/shell components otherwise.
- **Types** `types.ts`: `Player.avatarId: string`; snapshot gains `workerLastRunAt: string | null`, loses `source`; remove `LeaderboardSourceName`.
- **Remove** `MockLeaderboardSource.ts` (+test), `mockPlayers.ts`, `LeaderboardSource.ts`, `getSource.ts`, `prng.ts` (+test). Add `scoring.test.ts`, `readers.test.ts`; keep `ranking.test.ts`, `format.test.ts`.
- `scripts/screenshot.mjs`: output `../../docs/shots`; comment update. `error.tsx`: comment only.

## Repo plumbing
- `git mv` the app files into `apps/web` (history preserved); `mv ../.env apps/web/.env`.
- Root `.gitignore` fixes above. Root `package.json` (private, no deps): `web:dev`, `web:build`, `web:test`, `supabase:link`, `worker:deploy` (`npx supabase functions deploy score-taps --use-api --no-verify-jwt`).
- `apps/web`: `npm i @supabase/supabase-js@^2.118.0`.
- `supabase/config.toml` hand-written minimal (`project_id`, `[functions.score-taps] verify_jwt = false`); if the CLI rejects it, run `supabase init` in a scratch dir and copy the generated file over.

## Docs / tracking (AGENTS.md rules)
- `docs/supabase-worker-plan.md` = this plan; one line at the top of `docs/leaderboard-plan.md` pointing to it.
- `kanban-list.md`: section `## 2026-11-02 — Supabase worker + Realtime (Assignment 5) — see docs/supabase-worker-plan.md` with rows: monorepo restructure · users schema/seed · scores/worker SQL · Edge Function score-taps · schedule.sql · web env/clients · scoring + tests · getSnapshot/route/BoardLoader · Realtime hook + header states · remove mock · README/docs · lint/typecheck/test/build/shots · user: `supabase login` + project ref · user: paste SQL (4 files) · me: link + deploy function · user: Vercel root dir + env vars · backlog: User Registration Site (diagram). Backlog rows 14/15/16 → COMPLETE with notes (15 superseded by a05-live-data; 16 = Realtime now built); 17 stays TO DO (Registration Site).
- `README.md` (root): monorepo map, data flow (reader → nfc_reads → worker every 10 s → scores → Realtime → board), setup order, env table, scoring rule, worker ops (logs, unschedule, debug queries), Vercel settings.

## Deployment sequence
1. User: `npx supabase login` (browser), share the project ref. Me: `npx supabase link --project-ref <ref>` (blank DB password), `npm run worker:deploy`. If the CLI cannot see the login token from this shell, the user runs those two commands (documented).
2. User: SQL files 1–3 in the SQL Editor; then `schedule.sql` with URL + secret key filled in.
3. User: Vercel → Root Directory `apps/web`; env `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`; push `main` (I commit only when asked).

## Verification
1. `apps/web`: `npm run lint && npm run typecheck && npm test` green; `grep -ri mock src` empty. Function bundling errors surface at `functions deploy` (server-side bundling).
2. After deploy + SQL + schedule: Dashboard → Edge Functions → score-taps logs show a run every ~10 s; `select * from cron.job_run_details order by start_time desc limit 5` succeeded; `scores` holds the 20 cards' rows; `worker_state.last_run_at` ticks.
3. `npm run dev` in `apps/web` → 10 rows with `users` names/avatars; top card (`04:D4:16:67:CF:EF:62`, 18 taps) totals 1,800; one game cell = 100 × that card's taps at that reader (checked with a one-off script over `seed.sql`); header `● LIVE`.
4. Push path: insert a tap (`reader_id = 'esp32c3-3'`) in the SQL Editor → within ≤ 10 s the card's 17 column rises by 100 with the pulse/reorder, no page reload (Realtime). Unseeded uid → `GUEST-xxxx` row. `laptop-test` row → no change. Delete the inserted tap → score drops back (idempotent worker).
5. Failure modes: `cron.unschedule` → `WORKER IDLE` after 60 s, reschedule → LIVE; wrong anon key → 502 + LINK LOST, last board stays; socket blocked → 15 s poll still updates.
6. `npm run build` (`/` partial prerender, `/api/leaderboard` dynamic), `npm start`, `npm run shots` OK at 1920×1080 and 3840×2160.
7. Vercel deployment renders the same board from the production URL.

## Implementation notes (2026-11-02, after the build)

Built as planned, with these deviations:

- **Project**: `esp32c3-pn532-nfc` (`mvzxhimadnjebnnkciet`, Postgres 17). The CLI token from `npx supabase login` was visible to the agent's shell, so link, deploy, SQL (`supabase db query --remote -f`) and the cron schedule were all applied from the repo; nothing had to be pasted into the dashboard.
- **Worker auth**: the function accepts the project's secret / service_role key *or* an optional `WORKER_SECRET` token. The agent's attempts to write secrets (function secret, Vault) were blocked by the auto-mode permission classifier, so the cron job was created reading `vault.decrypted_secrets` for `worker_key` and the one `vault.create_secret(...)` statement is a human step (kanban row 34). Until then the job runs every 10 s and gets 401s, and the header shows `WORKER IDLE`.
- **schedule.sql** uses the project URL as a literal (it is public) and `coalesce(vault key, '')`, so it can be applied before the key exists.
- **Root scripts** added beyond the plan: `worker:secret`, `db:sql`, `db:status`; `apps/web` gained `push-check` (Playwright: tap → worker → Realtime → board, with polling off).
- **Verified**: lint, typecheck, 19 Vitest tests, `next build` (`/` partial prerender, `/api/leaderboard` dynamic), `npm run shots` at 1080p and 4K, a manual worker run (100 rows, 32,700 points = 327 taps × 100, equal to the tap log), and `push-check` (board moved 1.9 s after the worker wrote with the poll disabled; reverted after the tap was deleted; no page errors).
