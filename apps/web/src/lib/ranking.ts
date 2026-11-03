import { GAMES, type GameId } from "./games";
import type { GameScore, GameScores, LeaderboardEntry, Player } from "./types";

export function emptyScores(): GameScores {
  const scores = {} as GameScores;
  for (const game of GAMES) scores[game.id] = null;
  return scores;
}

/** Total = plain sum of the games played so far. Unplayed games (`null`) count as 0. */
export function sumScores(scores: GameScores): number {
  let total = 0;
  for (const game of GAMES) {
    const value = scores[game.id];
    if (value !== null) total += value;
  }
  return total;
}

/**
 * Higher total first; on a tie the player who reached that total first (earlier
 * `lastUpdatedAt`) keeps the better rank; then username, case-insensitive.
 */
export function compareEntries(a: LeaderboardEntry, b: LeaderboardEntry): number {
  if (b.total !== a.total) return b.total - a.total;
  if (a.lastUpdatedAt !== b.lastUpdatedAt) return a.lastUpdatedAt < b.lastUpdatedAt ? -1 : 1;
  return a.player.username.localeCompare(b.player.username, "en", { sensitivity: "base" });
}

type Accumulator = {
  scores: GameScores;
  updatedAt: Partial<Record<GameId, string>>;
  lastUpdatedAt: string;
};

/**
 * Builds the ranked board from normalised rows. Pure: same input, same output.
 * Returns at most `limit` entries with contiguous ranks 1..n.
 */
export function rankPlayers(players: readonly Player[], scores: readonly GameScore[], limit = 10): LeaderboardEntry[] {
  const byPlayer = new Map<string, Accumulator>();
  for (const player of players) {
    byPlayer.set(player.id, { scores: emptyScores(), updatedAt: {}, lastUpdatedAt: player.joinedAt });
  }

  for (const row of scores) {
    const acc = byPlayer.get(row.playerId);
    if (!acc) continue; // score for an unknown player: ignore rather than crash the board
    const previous = acc.updatedAt[row.gameId];
    if (previous !== undefined && previous > row.updatedAt) continue; // keep the latest write per game
    acc.scores[row.gameId] = row.score;
    acc.updatedAt[row.gameId] = row.updatedAt;
    if (row.updatedAt > acc.lastUpdatedAt) acc.lastUpdatedAt = row.updatedAt;
  }

  const entries: LeaderboardEntry[] = players.map((player) => {
    const acc = byPlayer.get(player.id)!;
    return { rank: 0, player, scores: acc.scores, total: sumScores(acc.scores), lastUpdatedAt: acc.lastUpdatedAt };
  });

  entries.sort(compareEntries);
  return entries.slice(0, Math.max(0, limit)).map((entry, index) => ({ ...entry, rank: index + 1 }));
}
