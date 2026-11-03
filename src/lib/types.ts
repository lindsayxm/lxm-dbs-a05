import type { GameId } from "./games";

/** Preset avatars shipped with the app; a player record stores one of these ids. */
export const AVATAR_IDS = [
  "qubit",
  "cat",
  "chip",
  "atom",
  "wave",
  "entangle",
  "dice",
  "chips",
  "spade",
  "lattice",
  "orbital",
  "tunnel",
] as const;
export type AvatarId = (typeof AVATAR_IDS)[number];

export type LeaderboardSourceName = "mock" | "supabase";

/** One casino guest. Shaped like the future `players` table. */
export type Player = {
  id: string;
  username: string;
  avatarId: AvatarId;
  /** ISO timestamp: when the wristband was issued. */
  joinedAt: string;
};

/** One score row. Shaped like the future `scores` table (one row per player per game). */
export type GameScore = {
  playerId: string;
  gameId: GameId;
  score: number;
  /** ISO timestamp of the last write for this player + game. */
  updatedAt: string;
};

/** Per-game scores for one player; `null` means the game has not been played yet. */
export type GameScores = Record<GameId, number | null>;

export type LeaderboardEntry = {
  rank: number;
  player: Player;
  scores: GameScores;
  total: number;
  /** ISO timestamp of the player's most recent score write (tie-break: earlier wins). */
  lastUpdatedAt: string;
};

export type LeaderboardSnapshot = {
  generatedAt: string;
  entries: LeaderboardEntry[];
  totalPlayers: number;
  source: LeaderboardSourceName;
};
