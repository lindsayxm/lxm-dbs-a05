import { io } from "next/cache";
import { currentTime, getLeaderboardSource } from "@/lib/leaderboard/getSource";
import { LiveLeaderboard } from "./LiveLeaderboard";

/**
 * Reads the first snapshot at request time. `io()` keeps this out of the static
 * shell (Cache Components), so the Suspense fallback ships in the shell and the
 * board streams in with real data.
 */
export async function BoardLoader() {
  await io();
  const snapshot = await getLeaderboardSource().getSnapshot(currentTime());
  return <LiveLeaderboard initial={snapshot} />;
}
