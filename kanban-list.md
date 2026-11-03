# Kanban — Quantum Casino Leaderboard

Statuses: TO DO · IN PROGRESS · COMPLETE

Rules: every task from any planning session or prompt gets a row; update the status as work proceeds; never delete rows. Plans live in `docs/`.

## 2026-10-29 — Setup
| # | Task | Status |
|---|------|--------|
| 1 | Write AGENTS.md | COMPLETE |

## 2026-10-29 — Front-end plan (Phase 1) — see docs/leaderboard-plan.md
| # | Task | Status |
|---|------|--------|
| 2 | Copy plan to docs/leaderboard-plan.md; convert kanban to table format | COMPLETE |
| 3 | M0: scaffold Next 16.4 + Tailwind in scratch dir, copy in, strip demo, deps (swr, motion, server-only; vitest, playwright), scripts, next.config, env + .env.example, git init | COMPLETE |
| 4 | M1: types + games + ranking + format (+ vitest) | COMPLETE |
| 5 | M1: prng + MockLeaderboardSource (deterministic, time-driven, cyclic) + 16 mock players (+ vitest) | COMPLETE |
| 6 | M1: getLeaderboardSource factory + currentTime (MOCK_FREEZE_AT) + GET /api/leaderboard (no-store) | COMPLETE |
| 7 | M2: fonts, @theme tokens, keyframes, HudChrome, Header, QubitMotif, LiveClock, LiveIndicator, BoardSkeleton, not-found | COMPLETE |
| 8 | M3: BoardLoader (Suspense + io) → LiveLeaderboard (SWR) → BoardTable / BoardRow / RankBadge / ScoreCell / GameGlyph, podium styles, empty + error states | COMPLETE |
| 9 | M3: 12 inline SVG avatars + fallback, Avatar component, avatars.ts map | COMPLETE |
| 10 | M4: motion — FLIP reorder, enter/exit at the top-10 cut, score count-up + row pulse, rank delta, #1 crown + halo; reduced motion | COMPLETE |
| 11 | M4: kiosk — CursorHider, FullscreenHint, drift, 6 h reload; stale/offline states with backoff; phone fallback layout | COMPLETE |
| 12 | M5: lint + typecheck + test + build; scripts/screenshot.mjs at 1920×1080 and 3840×2160 (no scrollbar, 10 rows visible) | COMPLETE |
| 13 | M5: README (run, env, kiosk notes); first commit | COMPLETE |

## Handoffs to the user (from the 2026-10-29 build)
| # | Task | Status |
|---|------|--------|
| 18 | Create the GitHub repo, push `main`, import the repo in Vercel (framework auto-detected, no env vars needed for the mock) | TO DO |
| 19 | Decide per-game score semantics with the game builders (best-of vs latest; the board sums one score per game) | TO DO |

## 2026-11-02 — Supabase worker + Realtime (Assignment 5) — see docs/supabase-worker-plan.md
| # | Task | Status |
|---|------|--------|
| 20 | Monorepo: move the Next.js app to `apps/web`, root `package.json` scripts, root `.gitignore` fixed for nested app, `.env` moved to `apps/web/.env` | COMPLETE |
| 21 | `users` table (uid, user_nm, avatar) schema + 20-row seed matching `seed.sql` (`supabase/migrations/…_users.sql`, `supabase/seed_users.sql`) | COMPLETE |
| 22 | `tap_counts` view, `scores` + `worker_state` tables, RLS select policies, Realtime publication (`supabase/migrations/…_scores_worker.sql`) | COMPLETE |
| 23 | Worker: Edge Function `supabase/functions/score-taps` (+100 per tap, reader → game map, idempotent diff + upsert, heartbeat, secret-key auth) + `supabase/config.toml` | COMPLETE |
| 24 | Supabase Cron schedule template with Vault secrets, every 10 s (`supabase/schedule.sql`) | COMPLETE |
| 25 | Web env (`SUPABASE_*` / `NEXT_PUBLIC_SUPABASE_*`), server + browser Supabase clients, `.env.example` | COMPLETE |
| 26 | Web: `readers.ts`, pure `scoring.ts` (guests, joinedAt, ranking) + Vitest, `getSnapshot` (paged reads), route 502 on failure, `BoardLoader` | COMPLETE |
| 27 | Web: Realtime subscription hook → refetch, 15 s fallback poll, header pill LIVE·PUSH/POLL · STALE · LINK LOST · WORKER IDLE | COMPLETE |
| 28 | Remove mock code (`MockLeaderboardSource`, `mockPlayers`, `prng`, `getSource`, `LeaderboardSource`, `MOCK_*` env) | COMPLETE |
| 29 | README (monorepo, data flow, setup order, env, worker ops, Vercel), docs copy of the plan, this kanban | COMPLETE |
| 30 | Verify: lint + typecheck + test + build green; `npm run shots` OK at 1080p/4K; worker run by hand = 32,700 points for 327 taps; `npm run push-check`: Realtime push moved the board 1.9 s after the worker wrote with polling off, and reverted after the tap was deleted. Cron runs still 401 until row 34 | COMPLETE |
| 31 | User: `npx supabase login`; agent: linked project `mvzxhimadnjebnnkciet` (esp32c3-pn532-nfc), deployed `score-taps` (accepts a project secret key or `WORKER_SECRET`), enabled pg_cron + pg_net, scheduled the 10 s job | COMPLETE |
| 32 | SQL applied to the project through the CLI (`supabase db query --remote`): `…_users.sql`, `seed_users.sql`, `…_scores_worker.sql`, `schedule.sql` (extensions + job) | COMPLETE |
| 33 | User: `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` added to `apps/web/.env` (done); on Vercel set Root Directory `apps/web` + the same env vars; push `main` — Vercel env set, redeployed; production verified in a browser: 10 rows, LIVE · PUSH, no errors (2026-11-03) | COMPLETE |
| 34 | User: give the cron job its credential, once, in the SQL Editor: `select vault.create_secret('<secret key>', 'worker_key');` (the agent's secret-store write was blocked by the auto-mode permission classifier) — key stored by the user; cron responses now 200, heartbeat fresh | COMPLETE |
| 35 | Add `data-flow.png` at the top of the README | COMPLETE |
| 36 | Register the two real wristbands in `users`: `47:56:6A:E7` → LXM (lattice), `5D:0C:8C:8E` → Art3mis (orbital); they were showing as GUEST-6AE7 / GUEST-8C8E | COMPLETE |
| 37 | Vercel deploy showed React #441 ("An error occurred in the Server Components render") because the project had no env vars. Code side done: `BoardFault` renders the reason inside the board; `turbopack.root` pinned to `apps/web`. User side: add `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel → Redeploy — resolved after the env vars + redeploy; BoardFault and turbopack.root changes still to be committed | COMPLETE |
| 38 | Write `DEPLOYMENT.md`: brief from-scratch steps for Supabase (SQL, worker deploy, cron + Vault key), readers, local env, Vercel (root dir + env vars), guest registration; linked from the README | COMPLETE |

## Backlog — Phase 2 (remaining)
| # | Task | Status |
|---|------|--------|
| 14 | SupabaseLeaderboardSource implementing LeaderboardSource (players + scores tables, migration SQL) — done as `getSnapshot` over `users` + `scores` (2026-11-02 section) | COMPLETE |
| 15 | POST /api/scores ingest endpoint for game stations (shared secret), wristband id → player — superseded: the readers write `nfc_reads` directly (a05-live-data firmware / serial bridge) | COMPLETE |
| 16 | Realtime push (Supabase Realtime or SSE) replacing polling — built in the 2026-11-02 section (push + 15 s fallback poll) | COMPLETE |
| 17 | Check-in screen: username + avatar pick when a wristband is issued (the "User Registration Site" in data-flow.png; writes `users`) | TO DO |
