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

## Backlog — Phase 2 (backend, not yet planned)
| # | Task | Status |
|---|------|--------|
| 14 | SupabaseLeaderboardSource implementing LeaderboardSource (players + scores tables, migration SQL) | TO DO |
| 15 | POST /api/scores ingest endpoint for game stations (shared secret), wristband id → player | TO DO |
| 16 | Realtime push (Supabase Realtime or SSE) replacing polling | TO DO |
| 17 | Check-in screen: username + avatar pick when a wristband is issued | TO DO |
