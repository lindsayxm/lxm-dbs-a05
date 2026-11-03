# Quantum Casino — Leaderboard

The wall-screen leaderboard for an immersive quantum casino. Guests wear an NFC wristband; each game (Uncertainty, Plinko, 17, Quant'em, Quabble) writes a score to their record, and this board shows the top 10 by total score, live, in a HUD style built to be read from across the room.

Spec: [AGENTS.md](AGENTS.md) · Plan: [docs/leaderboard-plan.md](docs/leaderboard-plan.md) · Task board: [kanban-list.md](kanban-list.md)

## Status

Phase 1 (front end on mock data) is built. The board runs with no backend: a deterministic simulation stands in for the casino, so rows reorder and scores count up every few seconds. Phase 2 (Supabase source + an ingest endpoint for the game stations) plugs in behind the same interface.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build && npm start` | Production build + server |
| `npm run lint` / `npm run typecheck` / `npm test` | ESLint, TypeScript (after `next typegen`), Vitest |
| `npm run shots` | Playwright layout check at 1920×1080 and 3840×2160 against a running server (no scrollbar, all 10 rows on screen); PNGs land in `docs/shots/` |

Environment (`.env.local`, git-ignored; see `.env.example`). Nothing is required.

- `NEXT_PUBLIC_POLL_MS` — how often the screen polls the API (default 3000).
- `LEADERBOARD_SOURCE` — `mock` (default). `supabase` is reserved for Phase 2.
- `MOCK_SEED` — a different seed gives different score curves.
- `MOCK_FREEZE_AT` — pin the mock clock to an ISO instant for stable screenshots or demos, e.g. `2026-10-29T00:12:00.000Z`.

## How it's put together

Next.js 16 (App Router, Turbopack, Cache Components on), React 19, Tailwind v4, `motion` for row animation, `swr` for polling, Vitest for units.

- **Domain** — `src/lib/types.ts`, `src/lib/games.ts`. Players and scores are normalised the way a `players` + `scores` database will be. `src/lib/ranking.ts` turns rows into the ranked board: total = sum of games played; ties go to whoever reached the total first, then username. `src/lib/format.ts` formats scores, the clock and ages.
- **Data source** — `src/lib/leaderboard/LeaderboardSource.ts` is the one interface the UI depends on: `getSnapshot(now, limit)`. Sources never read the clock; `now` is passed in, so everything is testable. `getSource.ts` picks the source from the env. `MockLeaderboardSource.ts` is stateless: scores are a pure function of `(seed, player, game, wall-clock time)` in 20-minute cycles, so any server instance (or Vercel function) computes the same board for the same instant with no shared memory.
- **API** — `src/app/api/leaderboard/route.ts` (`GET`, `?limit=`), always request-time (`connection()`), `Cache-Control: no-store`.
- **Page** — `src/app/page.tsx`: header and footer are the prerendered static shell; `BoardLoader` reads the first snapshot at request time (`io()` under `Suspense`) and hands it to `LiveLeaderboard`, which polls with SWR (`fallbackData` = the server snapshot, so hydration matches). `BoardTable` renders the rows with FLIP reordering (`motion` `layout`), enter/exit at the top-10 cut, count-up scores, a pulse on rows whose total changed, a ▲/▼ rank delta, and a gold halo + crown for the leader. The header's LIVE / STALE / LINK LOST pill reads a tiny store that the poller updates; the last good board stays on screen through outages.
- **Design tokens** — `src/app/globals.css` (`@theme`): palette, fonts (Orbitron / Rajdhani / JetBrains Mono via `next/font`), animations. `html { font-size: clamp(12px, 0.8333vw, 40px) }` makes 1rem scale with the wall, so a 4K screen is the 1080p layout at 2×; rows are sized in `vh`, so the ten rows always fit.
- **Avatars** — `src/components/avatars/glyphs.tsx`: twelve inline SVGs (quantum meets casino) that take the rank ring colour.
- **Kiosk** — `src/components/shell/Kiosk.tsx`: cursor hides after 3 s idle, `F` goes fullscreen, the tab reloads every 6 h to pick up deploys. Reduced-motion users get instant updates.

## Wall screen setup

Use a small PC / Raspberry Pi / Chromecast running Chromium rather than a TV's built-in browser (Next 16 targets Chrome 111+). Launch in kiosk mode and the board fills the screen:

```bash
chromium --kiosk --noerrdialogs --disable-infobars --autoplay-policy=no-user-gesture-required https://<your-deployment>/
```

On a laptop, press `F` for fullscreen. Phones and tablets get a stacked, scrollable layout, but the wall is the primary target.

## Phase 2 (not built yet)

- `SupabaseLeaderboardSource` implementing `LeaderboardSource` (tables `players(id, username, avatar_id, created_at)` and `scores(player_id, game_id, score, updated_at)`), selected by `LEADERBOARD_SOURCE=supabase`.
- `POST /api/scores` for the game stations (shared secret; wristband id → player).
- Realtime push (Supabase Realtime or SSE) in place of polling, and a check-in screen for choosing a username and avatar when a wristband is issued.
