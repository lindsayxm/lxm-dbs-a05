import { GAMES } from "@/lib/games";
import { hash32, unit } from "@/lib/prng";
import { rankPlayers } from "@/lib/ranking";
import type { GameScore, LeaderboardSnapshot, Player } from "@/lib/types";
import type { LeaderboardSource } from "./LeaderboardSource";
import { MOCK_PLAYERS } from "./mockPlayers";

/**
 * A deterministic, stateless simulation of a casino session.
 *
 * Time runs in 20-minute cycles from EPOCH. Within a cycle every (player, game)
 * cell starts at its own offset and then gains a pseudo-random amount every
 * `intervalMs`. Everything derives from hash32(seed, player, game, ...) and the
 * wall clock, so any server instance (and any test) computes the same board for
 * the same instant with no shared memory.
 */
export const EPOCH_MS = Date.UTC(2026, 9, 29, 0, 0, 0); // 2026-10-29T00:00:00Z
export const CYCLE_MS = 20 * 60_000;
export const SCORE_CAP = 9_999;

/** Guests arrive during the first 12 minutes of a session. */
const ARRIVAL_WINDOW_MS = 12 * 60_000;
const MIN_INTERVAL_MS = 25_000;
const INTERVAL_RANGE_MS = 50_000; // 25–75 s between plays
const MIN_GAIN = 60;
const GAIN_RANGE = 180; // 60–240 points per play

type CellParams = { startMs: number; intervalMs: number; meanGain: number; spread: number };

function cellParams(seed: number, player: number, game: number): CellParams {
  const startMs = Math.floor(unit(hash32(seed, player, game, 1)) * ARRIVAL_WINDOW_MS);
  const intervalMs = MIN_INTERVAL_MS + Math.floor(unit(hash32(seed, player, game, 2)) * INTERVAL_RANGE_MS);
  const meanGain = MIN_GAIN + Math.floor(unit(hash32(seed, player, game, 3)) * GAIN_RANGE);
  const spread = Math.floor(unit(hash32(seed, player, game, 4)) * meanGain); // strictly < meanGain
  return { startMs, intervalMs, meanGain, spread };
}

export type CellState = { score: number; updatedAtOffsetMs: number } | null;

/** Score of one cell at cycle time `t` (ms since the cycle started), or null before the first play. */
export function cellScore(seed: number, player: number, game: number, t: number): CellState {
  const p = cellParams(seed, player, game);
  if (t < p.startMs) return null;
  const plays = Math.floor((t - p.startMs) / p.intervalMs) + 1;
  // meanGain > spread keeps this monotonic in `plays`; the hashed jitter makes curves cross.
  const jitter = p.spread * unit(hash32(seed, player, game, 100 + plays));
  const score = Math.min(SCORE_CAP, Math.round(plays * p.meanGain + jitter));
  return { score, updatedAtOffsetMs: p.startMs + (plays - 1) * p.intervalMs };
}

export type Simulation = { scores: GameScore[]; cycleStartMs: number; t: number };

export function simulate(seed: number, players: readonly Player[], now: Date): Simulation {
  const elapsed = now.getTime() - EPOCH_MS;
  const t = ((elapsed % CYCLE_MS) + CYCLE_MS) % CYCLE_MS;
  const cycleStartMs = now.getTime() - t;
  const scores: GameScore[] = [];
  players.forEach((player, pi) => {
    GAMES.forEach((game, gi) => {
      const cell = cellScore(seed, pi, gi, t);
      if (cell === null) return;
      scores.push({
        playerId: player.id,
        gameId: game.id,
        score: cell.score,
        updatedAt: new Date(cycleStartMs + cell.updatedAtOffsetMs).toISOString(),
      });
    });
  });
  return { scores, cycleStartMs, t };
}

export class MockLeaderboardSource implements LeaderboardSource {
  readonly name = "mock" as const;

  constructor(
    private readonly seed = 7,
    private readonly players: readonly Player[] = MOCK_PLAYERS,
  ) {}

  async getSnapshot(now: Date, limit = 10): Promise<LeaderboardSnapshot> {
    const { scores } = simulate(this.seed, this.players, now);
    return {
      generatedAt: now.toISOString(),
      entries: rankPlayers(this.players, scores, limit),
      totalPlayers: this.players.length,
      source: this.name,
    };
  }
}
