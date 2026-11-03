# Quantum Casino Leaderboard — Front-End Plan (Phase 1)

> **2026-11-02:** the data layer described below (mock source, `LeaderboardSource`, `MOCK_*` env) was replaced by the Supabase worker + Realtime design in [supabase-worker-plan.md](supabase-worker-plan.md); the UI sections still apply.

## Context

[AGENTS.md](AGENTS.md) specifies a leaderboard for an immersive quantum casino with five games (Uncertainty, Plinko, 17, Quant'em, Quabble). Players wear an NFC wristband; each game writes a score to the player's record. The board shows username, avatar, score per game and total, ranked by total, top 10, leader on top, in a clean HUD / Iron-Man / quantum-computing style, built on Next.js and hosted on Vercel.

The folder holds only `AGENTS.md` and a two-line `kanban-list.md`. No `package.json`, no git repo, no `node_modules`.

Decisions confirmed with the user (2026-10-29):
- **Data: mock only for now.** A typed data layer behind a `LeaderboardSource` interface; the real backend (likely Supabase + an ingest route handler) is a later drop-in with no UI change.
- **Display: large wall screen / TV**, landscape 16:9 kiosk (1920×1080 primary, 4K secondary), no touch, auto-refresh, readable across a room, **no page scroll** (all 10 rows fit the viewport). Phone/tablet is secondary and must not break.
- **Avatars: preset set** of 12 quantum/casino-themed avatars shipped in the app; each player record stores an `avatarId`.

Verified on this machine: Node 22.14 / npm 10.9; latest `next` 16.4.3 (Stealth Labyrinth runs 16.4.2), `react` 19.3.1, `tailwindcss` 4.3.3, `motion` 14.8.0 (peer react ^19, imports from `motion/react`), `swr` 2.5.1, `vitest` 5.0.5, `playwright` 1.64.1; Google Chrome is installed. `next/font/google` exports `Orbitron` (variable 400–900), `Rajdhani` (weights 300–700, must be listed) and `JetBrains_Mono` (variable). create-next-app 16.4 generates the `@tailwindcss/turbopack` loader in `next.config.ts` with no PostCSS config (confirmed from the initial commit of `/Users/li/mpcs_dbs/a02-ui-ux-visual-design/lxm-dbs-a02`).

House conventions mirrored from `/Users/li/mpcs_dbs/a04-fullstack/lxm-dbs-a04` (Stealth Labyrinth): TypeScript strict, `src/` + `@/*`, Tailwind v4 `@theme` tokens fed by `next/font` CSS variables (`src/app/layout.tsx`, `src/app/globals.css`), ESLint 9 flat config (`eslint.config.mjs`), Vitest node env on `src/**/*.test.ts` (`vitest.config.mts`), `src/lib/env.ts` for `NEXT_PUBLIC_*`, `server-only` modules under `src/lib/server/`, scripts `dev / build / start / lint / test / typecheck`.

## Next.js 16 rules that shape this plan (from the bundled docs)

Read before coding: `node_modules/next/dist/docs/01-app/01-getting-started/{08-caching,09-revalidating,11-css,13-fonts,15-route-handlers}.md`, `02-guides/client-side-data-fetching/swr.md`, `03-api-reference/04-functions/{io,connection}.md`, `03-api-reference/05-config/01-next-config-js/cacheComponents.md`.

- Turbopack is the default; `next build` **no longer lints** and `next lint` is gone → `"lint": "eslint ."`.
- New apps have **`cacheComponents: true` + `partialPrefetching: true`**. Data fetching is dynamic by default; `export const dynamic / revalidate / fetchCache / runtime` are **removed**. Request-time work (`Date.now()`, DB reads) must sit under `<Suspense>` after `await io()` (`next/cache`, v16.3+) so it is excluded from the static shell; the docs prefer `io()` over `connection()` in components. Route handlers use `await connection()` (`next/server`) to never be prerendered.
- Route handlers: `src/app/api/leaderboard/route.ts`, `export async function GET(request: Request)`, `Response.json(...)`.
- No built-in polling. Docs recommend **SWR `refreshInterval`** against a GET route handler, seeded with server data via `fallbackData`.
- `params` / `searchParams` / `cookies()` / `headers()` are async. `middleware` is now `proxy` (not needed here).
- Fonts: `const f = Orbitron({ subsets: ['latin'], variable: '--font-orbitron', display: 'swap' })` → `<html className={f.variable}>` → `@theme inline { --font-display: var(--font-orbitron) }`.

Decision: **keep `cacheComponents` on** (scaffold default, and where Next 17 is going). The static HUD chrome and skeleton prerender into the shell (instant paint on a TV); the board streams in at request time under one `<Suspense>`. Fallback if it fights us: `cacheComponents: false` and `export const dynamic = 'force-dynamic'` on `page.tsx` and the route handler.

## Project tracking (standing instruction in AGENTS.md)

Step 0 of M0, then maintained for every later session:
1. **`docs/leaderboard-plan.md`** — a copy of this plan, kept in sync when the plan changes.
2. **`kanban-list.md`** — convert the current two-line file to the table format used in Stealth Labyrinth, keeping the existing `Write AGENTS.md — COMPLETE` row:

```markdown
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
| 2 | Copy plan to docs/leaderboard-plan.md; convert kanban to table format | TO DO |
| 3 | M0: scaffold Next 16.4 + Tailwind in scratch dir, copy in, strip demo, deps (swr, motion, server-only; vitest, playwright), scripts, next.config, env + .env.example, git init | TO DO |
| 4 | M1: types + games + ranking + format (+ vitest) | TO DO |
| 5 | M1: prng + MockLeaderboardSource (deterministic, time-driven, cyclic) + 16 mock players (+ vitest) | TO DO |
| 6 | M1: getLeaderboardSource factory + currentTime (MOCK_FREEZE_AT) + GET /api/leaderboard (no-store) | TO DO |
| 7 | M2: fonts, @theme tokens, keyframes, HudChrome, Header, QubitMotif, LiveClock, LiveIndicator, BoardSkeleton, not-found | TO DO |
| 8 | M3: BoardLoader (Suspense + io) → LiveLeaderboard (SWR) → BoardTable / BoardRow / RankBadge / ScoreCell / GameGlyph, podium styles, empty + error states | TO DO |
| 9 | M3: 12 inline SVG avatars + fallback, Avatar component, avatars.ts map | TO DO |
| 10 | M4: motion — FLIP reorder, enter/exit at the top-10 cut, score count-up + row pulse, rank delta, #1 crown + halo; reduced motion | TO DO |
| 11 | M4: kiosk — CursorHider, FullscreenHint, drift, 6 h reload; stale/offline states with backoff; phone fallback layout | TO DO |
| 12 | M5: lint + typecheck + test + build; scripts/screenshot.mjs at 1920×1080 and 3840×2160 (no scrollbar, 10 rows visible) | TO DO |
| 13 | M5: README (run, env, kiosk notes); first commit; GitHub; Vercel import (user's accounts) | TO DO |

## Backlog — Phase 2 (backend, not yet planned)
| # | Task | Status |
|---|------|--------|
| 14 | SupabaseLeaderboardSource implementing LeaderboardSource (players + scores tables, migration SQL) | TO DO |
| 15 | POST /api/scores ingest endpoint for game stations (shared secret), wristband id → player | TO DO |
| 16 | Realtime push (Supabase Realtime or SSE) replacing polling | TO DO |
| 17 | Check-in screen: username + avatar pick when a wristband is issued | TO DO |
```

## 1. Scaffold (M0)

`create-next-app` refuses a non-empty directory and writes its own `README.md`, so scaffold into the scratchpad and copy in (same trick as Stealth Labyrinth's `docs/front-end-plan.md` §1):

```bash
cd <a scratch directory outside the repo>
npx create-next-app@16.4.3 qcl --ts --eslint --tailwind --app --src-dir --import-alias "@/*" \
  --use-npm --disable-git --skip-install --no-agents-md --no-agent-feedback --yes
# copy everything except README.md into /Users/li/mpcs_stage/leaderboard (our AGENTS.md stays; next dev re-adds its block)
```

Then in the project: `npm install`, `npm i swr motion server-only`, `npm i -D vitest playwright`, strip the demo `page.tsx`, `public/*.svg` samples and the default `globals.css` body, `git init` (no commit until the user says so). On install, confirm `motion/react` still exports `motion`, `LayoutGroup`, `AnimatePresence`, `MotionConfig`, `animate`, `useMotionValue`, `useTransform`, `useReducedMotion` (risk 1).

- **Deps (minimal, each justified):** `swr` — `refreshInterval`, `refreshWhenHidden`, `fallbackData` for hydration-safe seeding, `keepPreviousData`, built-in retry; a hand-rolled hook would re-implement all of it. `motion` — FLIP row reordering via `layout` / `LayoutGroup`, `AnimatePresence` for rows crossing the top-10 cut, `animate()` for count-ups, `MotionConfig reducedMotion="user"`; React's `<ViewTransition>` only fires from transitions/Suspense (not SWR state updates) and snapshots the page, freezing the ambient HUD animations mid-swap. `server-only` guards the data layer. Dev: `vitest`; `playwright` as a library launching the installed Chrome (`chromium.launch({ channel: "chrome" })`, no browser download) for the screenshot check.
- **Scripts:** `dev`, `build`, `start`, `lint` (`eslint .`), `test` (`vitest run`), `typecheck` (`next typegen && tsc --noEmit`), `shots` (`node scripts/screenshot.mjs`).
- **`next.config.ts`:**
  ```ts
  const nextConfig: NextConfig = {
    reactStrictMode: true,
    cacheComponents: true,
    partialPrefetching: true,
    turbopack: { rules: { "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" } } },
  };
  ```
  Remove React Compiler if the generator added it.
- **Env:** `src/lib/env.ts` (client; static `process.env.NEXT_PUBLIC_*` expressions as in the sibling): `pollMs` (`NEXT_PUBLIC_POLL_MS`, default 3000), `devTools`. `src/lib/server/env.ts` (`import "server-only"`): `source` (`LEADERBOARD_SOURCE`: `mock` default | `supabase` later), `mockSeed` (`MOCK_SEED`, default 7), `mockFreezeAt` (`MOCK_FREEZE_AT` ISO date or unset) for stable screenshots. Commit `.env.example`; `.gitignore` as the template's.

**Folder layout (`src/`):**
```
app/            layout.tsx (fonts, metadata, viewport, HudChrome, kiosk) · globals.css · page.tsx · not-found.tsx
                api/leaderboard/route.ts
components/     shell/ (HudChrome, Header, QubitMotif, LiveClock, LiveIndicator, CursorHider, FullscreenHint, Bracket)
                board/ (BoardLoader, LiveLeaderboard, BoardTable, BoardRow, RankBadge, ScoreCell, GameGlyph, Crown,
                        BoardSkeleton, BoardEmpty, BoardError)
                avatars/ (Avatar.tsx + 12 avatar SVG components + Fallback)
lib/            types.ts · games.ts · ranking.ts · format.ts · prng.ts · env.ts · utils/cn.ts
                leaderboard/ (LeaderboardSource.ts, getSource.ts, MockLeaderboardSource.ts, mockPlayers.ts)
                server/ (env.ts)
data/           avatars.ts
scripts/        screenshot.mjs
```

## 2. Domain model (`src/lib/types.ts`, `src/lib/games.ts`)

Normalised the way a `players` + `scores` database will be, so the Supabase source maps rows 1:1 later:

```ts
export const GAMES = [
  { id: "uncertainty", name: "Uncertainty", short: "UNC" },
  { id: "plinko",      name: "Plinko",      short: "PLK" },
  { id: "seventeen",   name: "17",          short: "17"  },
  { id: "quantem",     name: "Quant'em",    short: "QTM" },
  { id: "quabble",     name: "Quabble",     short: "QBL" },
] as const;
export type GameId = (typeof GAMES)[number]["id"];

export const AVATAR_IDS = ["qubit","cat","chip","atom","wave","entangle","dice","chips","spade","lattice","orbital","tunnel"] as const;
export type AvatarId = (typeof AVATAR_IDS)[number];

export type Player    = { id: string; username: string; avatarId: AvatarId; joinedAt: string };          // ISO
export type GameScore = { playerId: string; gameId: GameId; score: number; updatedAt: string };
export type LeaderboardEntry = {
  rank: number; player: Player; scores: Record<GameId, number | null>; total: number; lastUpdatedAt: string;
};
export type LeaderboardSnapshot = {
  generatedAt: string; entries: LeaderboardEntry[]; totalPlayers: number; source: "mock" | "supabase";
};
```

- **Ranking (`ranking.ts`, pure, tested):** `rankPlayers(players, scores, limit = 10)`: `total` = sum of non-null scores (unplayed = `null`, shown as `—`); sort by total desc, then `lastUpdatedAt` asc (whoever reached the total first keeps the higher rank), then `username.localeCompare(..., "en", { sensitivity: "base" })`; slice to `limit`; ranks 1..n contiguous, no shared ranks. Assumption to flag: one score per game per player and total = plain sum; whether a game stores best-of or latest is the backend's concern. Per-game range 0–9,999 so totals fit six characters.
- **Formatting (`format.ts`, tested):** `formatScore(n | null)` → `"12,480"` / `"—"` via one module-scope `Intl.NumberFormat("en-US")`; cells use `tabular-nums` + the mono font.

## 3. Data layer (M1)

**Interface (`src/lib/leaderboard/LeaderboardSource.ts`):**
```ts
export interface LeaderboardSource {
  readonly name: LeaderboardSnapshot["source"];
  getSnapshot(now: Date, limit?: number): Promise<LeaderboardSnapshot>;
}
```
`now` is a parameter: sources never read the clock, so tests are pure. `getSource.ts` (`import "server-only"`): `getLeaderboardSource()` switches on `serverEnv.source`; `currentTime()` returns `serverEnv.mockFreezeAt ?? new Date()`. A future `SupabaseLeaderboardSource.ts` implements the same interface with the `dataClient()` pattern from Stealth Labyrinth's `src/lib/server/supabase.ts` (query `players`, `scores`, call the same `rankPlayers`); flip `LEADERBOARD_SOURCE=supabase`, no UI change.

**`MockLeaderboardSource` — deterministic, stateless, O(1) per cell** (works on Vercel serverless with no shared memory; tests pin time):
- `prng.ts`: `mulberry32(seed)` and `hash32(...ints)` (splitmix-style mixer), tested against known sequences.
- Simulation is **cyclic**: `CYCLE_MS = 20 min`, `t = (now − EPOCH) mod CYCLE_MS` with `EPOCH = 2026-10-29T00:00:00Z`. Each cycle is a fresh session: players arrive, climb, then a new session starts, so the board churns forever and never saturates.
- Per `(player i, game g)`, constants derived once from `hash32(seed, i, g)`: `startMs` (arrival offset within the cycle), `intervalMs` (20–60 s between plays), `meanGain` (150–600), `spread` (< `meanGain`), `cap` 9,999. Plays so far `n = floor((t − startMs) / intervalMs)`; score `= min(cap, round(n·meanGain + spread·unit(hash32(seed, i, g, n))))`, `null` while `t < startMs`. Because `meanGain ≥ spread`, scores are monotonic within a cycle; curves cross so ranks swap every few seconds; late arrivals push others across the top-10 cut. `updatedAt = EPOCH + cycleStart + startMs + n·intervalMs` (drives the tie-break).
- **`mockPlayers.ts` — 16 players** (≤ 16 chars, one avatar each, wrapping after 12) so the cut is visible: SchrodingerAce, QubitRoyale, HeisenbergHiRoll, EntangledEddie, DecoherenceDiva, SpinUpSally, BlochBandit, TunnelingTony, SuperpositionSue, WaveFunctionWes, PauliJackpot, HadamardHustler, PlanckShark, BraKetBetty, FermiFortune, CollapseCasey.
- Tests: same `(seed, now)` → deep-equal snapshot; different seed → different; `t` vs `t + 60 s` differ; per-cell monotonic within a cycle; at least one rank change over 10 min; exactly `limit` entries with contiguous ranks; every score within `[0, cap]`; `totalPlayers === 16`.

**Route handler (`src/app/api/leaderboard/route.ts`):**
```ts
import { connection } from "next/server";
export async function GET(request: Request) {
  await connection();                                    // request-time, never prerendered
  const limit = Number(new URL(request.url).searchParams.get("limit") ?? 10);
  const snapshot = await getLeaderboardSource().getSnapshot(currentTime(), limit);
  return Response.json(snapshot, { headers: { "Cache-Control": "no-store" } });
}
```
`no-store` keeps Vercel's CDN and the browser from caching the poll.

## 4. Live updates on the client (M3/M4)

- **`BoardLoader`** (async server component, under `<Suspense fallback={<BoardSkeleton/>}>` in `page.tsx`): `await io()` then `getLeaderboardSource().getSnapshot(currentTime())`, renders `<LiveLeaderboard initial={snapshot}/>`. The chrome around it is the prerendered static shell; the board streams in.
- **`LiveLeaderboard`** (`'use client'`):
  ```ts
  const { data, error } = useSWR<LeaderboardSnapshot>("/api/leaderboard", fetcher, {
    fallbackData: initial, refreshInterval: env.pollMs, refreshWhenHidden: false, refreshWhenOffline: false,
    revalidateOnFocus: true, keepPreviousData: true, dedupingInterval: 1000,
    onErrorRetry: (_e, _k, _c, revalidate, { retryCount }) =>
      setTimeout(() => revalidate({ retryCount }), Math.min(30_000, 2000 * 2 ** retryCount)),
  });
  ```
  `fallbackData` makes the first client render identical to the server HTML (no hydration mismatch). Track `lastGoodAt` in a ref on each successful `data` change. **`LiveIndicator`:** `● LIVE` (cyan, blinking dot) → `STALE mm:ss` (amber, when `now − lastGoodAt > 3 × pollMs`) → `LINK LOST` (red, when `error` and stale); the last good board stays on screen throughout. Hidden tab pauses polling; return revalidates.
- **`LiveClock`:** `useSyncExternalStore` with `getServerSnapshot: () => null` → renders `--:--:--` on the server, real time after mount (no hydration mismatch, no `io()` on the client).
- **Rank-change animation (`motion/react`):** `<MotionConfig reducedMotion="user"><LayoutGroup>` around `<AnimatePresence initial={false}>`; each `BoardRow` is `<motion.li layout layoutId={player.id} initial={{ opacity: 0, y: 40 }} exit={{ opacity: 0, y: 40 }} transition={{ type: "spring", stiffness: 280, damping: 32 }}>` keyed by `player.id` (FLIP). **`ScoreCell`:** `useMotionValue(prev)` + `animate(mv, next, { duration: 0.6, ease: "easeOut" })` + `useTransform(mv, v => formatScore(Math.round(v)))`; with `useReducedMotion()` true, set the value directly. A `usePrevious(snapshot)` diff marks rows whose total changed (`data-changed` → `animate-pulse-row`) and shows a `▲n / ▼n` rank delta that fades after 2 s. Rank 1 gets `<Crown/>` plus `animate-halo` (slow breathing gold glow). `@media (prefers-reduced-motion: reduce)` disables sweep, pulse, halo and drift.

## 5. UI / components (M2–M4)

**No-scroll 16:9 layout.** `html { font-size: clamp(12px, 0.8333vw, 40px) }` (16 px at 1920, 32 px at 3840, so every rem scales with the wall); `html, body { height: 100%; overflow: hidden }`. `page.tsx`: `h-dvh grid grid-rows-[9vh_1fr_3vh] px-12`.
- **Header (9vh):** `QubitMotif` (orbit rings + spinning state vector, cyan) + `QUANTUM CASINO` in Orbitron, subtitle `LEADERBOARD · TOP 10`; right side `LiveClock`, `LiveIndicator`, "synced 2 s ago".
- **Board (1fr):** column-header row (`#`, `PLAYER`, five game short codes with `GameGlyph`, `TOTAL`) then an `ol` with `grid-rows-[4vh_repeat(10,minmax(0,1fr))] gap-y-[0.6vh]` (each row ≈ 8vh, 86 px at 1080p); row 1 may take `1.3fr` as the hero. Columns `grid-cols-[4rem_5.5rem_minmax(0,1fr)_repeat(5,8.5rem)_11rem]` (rank · avatar · username · five games · total). Type: rows `2.4vh`, total `3.4vh` bold, title `4vh`. Row: translucent surface, 1 px cyan hairline, inner glow. Avatar `6vh` disc with a 2 px ring in rank colour (gold / silver / bronze, cyan for 4–10). Podium rows add a left edge bar and username text-shadow in their metal; rank 1 adds crown + halo. Username `truncate min-w-0`, 16-char cap.
- **Footer (3vh):** game legend (short code → name) and `SCORES SYNC VIA NFC WRISTBAND`.
- **HUD chrome (`HudChrome`):** fixed layers — 48 px grid with radial fade (≤ 6 % alpha), vignette, four corner `Bracket`s, one translucent scan band on a 14 s loop, 12 %-alpha hairlines. Tasteful: low opacity, no scanlines. Wraps content in `animate-drift` (±4 px over 120 s, alternating) against OLED burn-in.
- **States:** `BoardSkeleton` (10 ghost rows, shimmer), `BoardEmpty` (`AWAITING PLAYERS` + motif) when `entries.length === 0`, `BoardError` only when there is no data at all. `not-found.tsx`: `SECTOR 404 · STATE NOT FOUND`, collapsed-wavefunction glyph, link home (sibling's `not-found.tsx` pattern).
- **4K:** the rem rule plus vh sizing scale 1:1. **Phones (`max-width: 1024px` or portrait):** rows become two-line cards (rank, avatar, name, total; five small game chips beneath) and `overflow-y: auto` is restored. Secondary; must not break.
- **Kiosk (in `layout.tsx`):** `CursorHider` sets `cursor: none` after 3 s idle; `FullscreenHint` shows `PRESS F FOR FULLSCREEN` for 5 s when `!document.fullscreenElement`, `F` calls `requestFullscreen()`; `location.reload()` every 6 h to recover from memory growth and pick up deploys. README documents running Chrome with `--kiosk`. Wake lock is not applicable.

## 6. Design tokens (`globals.css` `@theme inline`)

- **Palette:** void `#050811`, surface `#0a1020` / `#0e1730`; cyan `#19e3ff` (primary, ≈12.5:1 on void), blue `#3b82ff`, violet `#a855f7`, magenta `#ff2fd2` (sparingly); text `#e8f1ff` (≈16:1), dim `#8fa3c2` (≈7:1, labels), faint `#5a6a86` (decoration only); hairline `rgb(25 227 255 / 0.14)`, hairline-strong `/ 0.35`; gold `#ffc53d`, silver `#c9d4e3`, bronze `#e08a4f`; amber `#ffb347` (stale), alert `#ff4d6d`; up `#3dff9a`, down `#ff5c7a`.
- **Fonts (`layout.tsx`, sibling pattern):** `Orbitron({ subsets: ["latin"], variable: "--font-orbitron", display: "swap" })` → `--font-display` (titles, ranks, totals); `Rajdhani({ weight: ["500","600","700"], subsets: ["latin"], variable: "--font-rajdhani" })` → `--font-label` (labels, usernames); `JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" })` → `--font-num` (scores, clock; `tabular-nums`). `<body className="bg-void font-label text-text">`; `viewport.themeColor = "#050811"`.
- **Motion tokens:** `--ease-hud: cubic-bezier(0.2, 0.8, 0.2, 1)`; `--animate-scan` (14 s linear), `--animate-pulse-row` (900 ms, once), `--animate-halo` (3 s breathing), `--animate-drift` (120 s alternate), `--animate-blink` (1.2 s steps), shimmer; all under `@media (prefers-reduced-motion: no-preference)`.

## 7. Avatars (M3)

Twelve hand-authored inline SVG React components (`src/components/avatars/*.tsx`, 64×64 viewBox, 2.5 px round strokes, `currentColor` + one gradient, dark disc, 15 %-alpha glow ring) so they stay crisp at 4K, take the rank ring colour, need no image pipeline and no `remotePatterns`. Quantum meets casino: **qubit** (Bloch sphere, tilted state arrow) · **cat** (half-dashed cat silhouette) · **chip** (processor die, gold pads) · **atom** (three orbits) · **wave** (wave packet) · **entangle** (two linked rings) · **dice** (die with probability-cloud pips) · **chips** (stacked poker chips with circuit traces) · **spade** (spade from a particle trail) · **lattice** (hex ion trap) · **orbital** (p-orbital lobes) · **tunnel** (dot through a barrier) · plus **Fallback** (hex with `?`). `src/data/avatars.ts` maps `AvatarId → component`; `Avatar` renders the fallback for unknown ids.

## 8. Testing and verification (M5)

- **Unit (Vitest, node env, sibling `vitest.config.mts`):** `ranking.test.ts` (sum with nulls, tie → earlier `lastUpdatedAt` then username, top-10 cut, contiguous ranks); `format.test.ts` (`12345 → "12,345"`, `0`, `null → "—"`); `prng.test.ts` (known `mulberry32` sequence); `MockLeaderboardSource.test.ts` (determinism, change over time, monotonic cells, a rank change within 10 min, bounds, `totalPlayers`).
- `npm run lint && npm run typecheck && npm test && npm run build` (remember `next build` no longer lints).
- **`scripts/screenshot.mjs`** (against `next start` with `MOCK_FREEZE_AT` set, Playwright on the installed Chrome): for 1920×1080 and 3840×2160, `page.setViewportSize`, assert `scrollHeight <= innerHeight`, `scrollWidth <= innerWidth`, `querySelectorAll('[data-row]').length === 10`, every row `bottom <= innerHeight`; save `docs/shots/*.png`; non-zero exit on failure; eyeball the PNGs.
- **Manual:** `npm run dev`, watch rows reorder within a minute; kill the dev server → `STALE` then `LINK LOST` with the last board still shown; restart → recovery; hidden tab pauses polling; `prefers-reduced-motion` emulation stills everything; cursor hides; `F` goes fullscreen; phone width stacks and scrolls.
- **A11y:** rows are `ol/li`; one `aria-live="polite"` region announces leader changes only (not every cell); Lighthouse desktop pass for contrast.
- **Deploy:** `git init` (M0) → first commit, GitHub repo, Vercel import (framework auto-detected, Node 22). Env on Vercel: none required for mock; optional `NEXT_PUBLIC_POLL_MS`, `MOCK_SEED`. The user runs the account-side steps.

## 9. Risks / open questions (defaults taken)

1. `motion@14` API drift from the familiar `layout` / `LayoutGroup` / `AnimatePresence` → pin `^14`, verify exports on install; fallback is a 40-line `useLayoutEffect` FLIP.
2. `cacheComponents` dev-time errors about uncached data or `Date.now()` in prerender → every clock read is server-side after `await io()` (component) or `await connection()` (route) under `<Suspense>`; fallback: `cacheComponents: false` + `force-dynamic`.
3. Docs show Tailwind via PostCSS but the scaffold emits `@tailwindcss/turbopack` → use what the scaffold generates; switch to `@tailwindcss/postcss` only if the loader misbehaves.
4. Vercel CDN or browser caching the poll → `Cache-Control: no-store`, SWR `dedupingInterval` ≥ 1 s. Polling cost at 3 s ≈ 1,200 requests/h per screen: fine on Hobby; raise `NEXT_PUBLIC_POLL_MS` if more screens appear; SSE/Realtime deferred to Phase 2.
5. Smart-TV built-in browsers lag Chrome 111+ (Next 16 minimum) → recommend a mini-PC / Raspberry Pi / Chromecast running Chromium in kiosk mode; `display: "swap"` keeps text readable if fonts stall.
6. Score semantics (best vs latest per game, total = sum) → sum of one score per game; the backend decides best/latest.

## Implementation notes (2026-10-29, after the build)

Built and verified as planned, with these small deviations from the file list above:

- The twelve avatars live in one module, `src/components/avatars/glyphs.tsx`, plus `Avatar.tsx`; there is no `src/data/avatars.ts` (the id → component map sits in `Avatar.tsx`).
- `BoardError` became the App Router convention `src/app/error.tsx`, which also catches a misconfigured `LEADERBOARD_SOURCE`.
- The kiosk helpers (`CursorHider`, `FullscreenHint`, periodic reload) are one client component, `src/components/shell/Kiosk.tsx`; the burn-in drift is applied to the background glow layer in `HudChrome`.
- The ticking clock is a shared hook, `src/lib/hooks/useNow.ts`; the LIVE / STALE / LINK LOST state is a tiny external store, `src/lib/liveStatus.ts`, written by `LiveLeaderboard` and read by `LiveIndicator`.
- Mock tuning: plays every 25–75 s per cell, 60–240 points per play, arrivals within the first 12 minutes of each 20-minute cycle; `MOCK_SEED` and `MOCK_FREEZE_AT` replace the planned `LEADERBOARD_SIM` flag.

Verification run: 19 Vitest tests pass; `next build` reports `/` as a partial prerender (static shell + streamed board) and `/api/leaderboard` as dynamic; `npm run shots` passes at 1920×1080 and 3840×2160 (no scroll, 10 rows, no page errors); a live Playwright pass showed rank order changing within 9 s, LINK LOST after the API was blocked for 13 s with the last board still on screen, recovery to LIVE within 7 s, and a phone render with no horizontal overflow.
