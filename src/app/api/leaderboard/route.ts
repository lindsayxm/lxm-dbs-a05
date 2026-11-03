import { connection } from "next/server";
import { currentTime, getLeaderboardSource } from "@/lib/leaderboard/getSource";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

/** The wall screen polls this. Always request-time, never cached by the CDN or the browser. */
export async function GET(request: Request) {
  await connection();
  const raw = Number(new URL(request.url).searchParams.get("limit") ?? DEFAULT_LIMIT);
  const limit = Number.isFinite(raw) && raw > 0 ? Math.min(Math.floor(raw), MAX_LIMIT) : DEFAULT_LIMIT;
  const snapshot = await getLeaderboardSource().getSnapshot(currentTime(), limit);
  return Response.json(snapshot, { headers: { "Cache-Control": "no-store" } });
}
