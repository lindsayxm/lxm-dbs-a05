import "server-only";
import { serverEnv } from "@/lib/server/env";
import type { LeaderboardSource } from "./LeaderboardSource";
import { MockLeaderboardSource } from "./MockLeaderboardSource";

let mock: MockLeaderboardSource | undefined;

/** The one place that decides where board data comes from. Phase 2 adds the Supabase branch. */
export function getLeaderboardSource(): LeaderboardSource {
  switch (serverEnv.source) {
    case "supabase":
      throw new Error("LEADERBOARD_SOURCE=supabase is not implemented yet (Phase 2). Use mock.");
    default:
      return (mock ??= new MockLeaderboardSource(serverEnv.mockSeed));
  }
}

/** The clock the server reads for a snapshot; pinned when MOCK_FREEZE_AT is set. */
export function currentTime(): Date {
  return serverEnv.mockFreezeAt ?? new Date();
}
