import { connection } from "next/server";
import { getSnapshot } from "@/lib/leaderboard/getSnapshot";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const NO_STORE = { "Cache-Control": "no-store" };

/**
 * The wall screen fetches this on every Realtime push and on its fallback poll.
 * Always request-time, never cached by the CDN or the browser.
 */
export async function GET(request: Request) {
  await connection();
  const raw = Number(new URL(request.url).searchParams.get("limit") ?? DEFAULT_LIMIT);
  const limit = Number.isFinite(raw) && raw > 0 ? Math.min(Math.floor(raw), MAX_LIMIT) : DEFAULT_LIMIT;
  try {
    const snapshot = await getSnapshot(limit);
    return Response.json(snapshot, { headers: NO_STORE });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error(`GET /api/leaderboard: ${message}`);
    // 502: the poller marks the link lost and keeps the last good board on screen.
    return Response.json({ error: message }, { status: 502, headers: NO_STORE });
  }
}
