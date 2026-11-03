import type { LeaderboardSnapshot, LeaderboardSourceName } from "@/lib/types";

/**
 * Where the board's data comes from. Sources never read the clock themselves:
 * `now` is passed in, so every source is a pure function of (its config, now).
 */
export interface LeaderboardSource {
  readonly name: LeaderboardSourceName;
  getSnapshot(now: Date, limit?: number): Promise<LeaderboardSnapshot>;
}
