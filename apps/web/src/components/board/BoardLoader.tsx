import { io } from "next/cache";
import { getSnapshot } from "@/lib/leaderboard/getSnapshot";
import { LiveLeaderboard } from "./LiveLeaderboard";

/**
 * Reads the first snapshot from Supabase at request time. `io()` keeps this out of the static
 * shell (Cache Components), so the Suspense fallback ships in the shell and the board streams
 * in with real data. A failed read lands in app/error.tsx.
 */
export async function BoardLoader() {
  await io();
  const snapshot = await getSnapshot();
  return <LiveLeaderboard initial={snapshot} />;
}
