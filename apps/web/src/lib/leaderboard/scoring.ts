import { GAME_IDS, type GameId } from "@/lib/games";
import { rankPlayers } from "@/lib/ranking";
import type { GameScore, LeaderboardSnapshot, Player } from "@/lib/types";

/** A row of `public.users`. */
export type UserRow = { uid: string; user_nm: string; avatar: string; created_at: string };

/** A row of `public.scores`, written by the score-taps worker. */
export type ScoreRow = {
  uid: string;
  game_id: string;
  taps: number;
  score: number;
  last_tap_at: string | null;
  updated_at: string;
};

/** The worker's heartbeat row (`public.worker_state`). */
export type WorkerStateRow = { last_run_at: string | null; last_ok: boolean | null; last_message: string | null };

const EPOCH = new Date(0).toISOString();

/** Postgres returns `+00:00` offsets; normalise so timestamps compare and sort as plain strings. */
export function iso(value: string | null | undefined): string | null {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? null : new Date(ms).toISOString();
}

/** `04:D4:16:67:CF:EF:62` → `GUEST-EF62`: a wristband that has scored but has no `users` row yet. */
export function guestName(uid: string): string {
  const hex = uid.replace(/[^0-9a-z]/gi, "").toUpperCase();
  return `GUEST-${hex.slice(-4).padStart(4, "0")}`;
}

const isGameId = (id: string): id is GameId => (GAME_IDS as readonly string[]).includes(id);

/** `scores` rows → the rows the ranking understands. Rows for unknown games are dropped. */
export function toGameScores(rows: readonly ScoreRow[]): GameScore[] {
  const out: GameScore[] = [];
  for (const row of rows) {
    if (!isGameId(row.game_id)) continue;
    out.push({
      playerId: row.uid,
      gameId: row.game_id,
      score: row.score,
      updatedAt: iso(row.last_tap_at) ?? iso(row.updated_at) ?? EPOCH,
    });
  }
  return out;
}

/**
 * Registered guests, plus a GUEST-xxxx placeholder for every card that has scores but no
 * `users` row. `joinedAt` is the earlier of registration and first scoring tap, so registering
 * late never costs a tie-break.
 */
export function buildPlayers(users: readonly UserRow[], scores: readonly GameScore[]): Player[] {
  const firstScoreAt = new Map<string, string>();
  for (const s of scores) {
    const previous = firstScoreAt.get(s.playerId);
    if (previous === undefined || s.updatedAt < previous) firstScoreAt.set(s.playerId, s.updatedAt);
  }

  const players: Player[] = [];
  const seen = new Set<string>();
  for (const user of users) {
    if (seen.has(user.uid)) continue;
    seen.add(user.uid);
    const candidates = [iso(user.created_at), firstScoreAt.get(user.uid)].filter((x): x is string => Boolean(x)).sort();
    players.push({ id: user.uid, username: user.user_nm, avatarId: user.avatar, joinedAt: candidates[0] ?? EPOCH });
  }
  for (const [uid, first] of firstScoreAt) {
    if (seen.has(uid)) continue;
    seen.add(uid);
    players.push({ id: uid, username: guestName(uid), avatarId: "fallback", joinedAt: first });
  }
  return players;
}

/** The ranked board from raw rows. Pure: same input, same output. */
export function buildSnapshot(
  users: readonly UserRow[],
  scoreRows: readonly ScoreRow[],
  state: WorkerStateRow | null,
  now: Date,
  limit = 10,
): LeaderboardSnapshot {
  const scores = toGameScores(scoreRows);
  const players = buildPlayers(users, scores);
  return {
    generatedAt: now.toISOString(),
    entries: rankPlayers(players, scores, limit),
    totalPlayers: players.length,
    workerLastRunAt: iso(state?.last_run_at),
  };
}
