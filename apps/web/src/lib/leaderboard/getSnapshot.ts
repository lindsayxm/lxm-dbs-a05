import "server-only";
import { serverEnv } from "@/lib/server/env";
import { supabase } from "@/lib/server/supabase";
import type { LeaderboardSnapshot } from "@/lib/types";
import { buildSnapshot, type ScoreRow, type UserRow, type WorkerStateRow } from "./scoring";

/** PostgREST returns at most this many rows per request, so tables are read in pages. */
const PAGE = 1000;

async function fetchAll<T>(table: string, columns: string, orderBy: readonly string[]): Promise<T[]> {
  const db = supabase();
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    let query = db.from(table).select(columns);
    for (const column of orderBy) query = query.order(column, { ascending: true });
    const { data, error } = await query.range(from, from + PAGE - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    const page = (data ?? []) as T[];
    rows.push(...page);
    if (page.length < PAGE) return rows;
  }
}

/**
 * The board right now: `users` joined to the worker's `scores`, ranked. Throws when Supabase
 * is unreachable or misconfigured; callers decide whether that is a 502 or an error page.
 */
export async function getSnapshot(limit = 10): Promise<LeaderboardSnapshot> {
  const [users, scores, state] = await Promise.all([
    fetchAll<UserRow>(serverEnv.usersTable, "uid, user_nm, avatar, created_at", ["uid"]),
    fetchAll<ScoreRow>(serverEnv.scoresTable, "uid, game_id, taps, score, last_tap_at, updated_at", ["uid", "game_id"]),
    supabase().from("worker_state").select("last_run_at, last_ok, last_message").eq("id", 1).maybeSingle(),
  ]);
  if (state.error) throw new Error(`worker_state: ${state.error.message}`);
  return buildSnapshot(users, scores, (state.data as WorkerStateRow | null) ?? null, new Date(), limit);
}
