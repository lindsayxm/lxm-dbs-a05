import { io } from "next/cache";
import { getSnapshot } from "@/lib/leaderboard/getSnapshot";
import { BoardFault } from "./BoardFault";
import { LiveLeaderboard } from "./LiveLeaderboard";

/**
 * Reads the first snapshot from Supabase at request time. `io()` keeps this out of the static
 * shell (Cache Components), so the Suspense fallback ships in the shell and the board streams
 * in with real data. A failed read renders BoardFault in place (not a thrown error), so the
 * wall shows the reason and the page recovers on the next load once the cause is fixed.
 */
export async function BoardLoader() {
  await io();
  try {
    const snapshot = await getSnapshot();
    return <LiveLeaderboard initial={snapshot} />;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error(`BoardLoader: ${message}`);
    return <BoardFault message={message} />;
  }
}
