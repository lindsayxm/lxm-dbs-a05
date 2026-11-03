import type { GameId } from "./games";

/** Preset avatars shipped with the app; `users.avatar` stores one of these ids. */
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

/** One casino guest, as the board sees them. */
export type Player = {
  /** The wristband's card UID (`users.uid`), e.g. `04:D4:16:67:CF:EF:62`. */
  id: string;
  username: string;
  /** One of AVATAR_IDS; anything else renders the fallback glyph (unregistered guests use "fallback"). */
  avatarId: string;
  /** ISO timestamp: registration, or the first tap for an unregistered guest. */
  joinedAt: string;
};

/** One score, one player, one game: what the worker keeps in `scores`. */
export type GameScore = {
  playerId: string;
  gameId: GameId;
  score: number;
  /** ISO timestamp of the latest tap that counted toward this score. */
  updatedAt: string;
};

/** Per-game scores for one player; `null` means the game has not been played yet. */
export type GameScores = Record<GameId, number | null>;

export type LeaderboardEntry = {
  rank: number;
  player: Player;
  scores: GameScores;
  total: number;
  /** ISO timestamp of the player's most recent scoring tap (tie-break: earlier wins). */
  lastUpdatedAt: string;
};

export type LeaderboardSnapshot = {
  generatedAt: string;
  entries: LeaderboardEntry[];
  totalPlayers: number;
  /** When the worker last ran (its heartbeat row); null until it has run once. */
  workerLastRunAt: string | null;
};
