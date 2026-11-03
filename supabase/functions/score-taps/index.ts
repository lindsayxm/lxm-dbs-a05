// score-taps: the worker.
//
// Supabase Cron calls this Edge Function every 10 seconds (supabase/schedule.sql). It turns the raw
// NFC tap log (public.nfc_reads, written by the readers in the a05-live-data project) into running
// totals in public.scores, which the leaderboard reads and subscribes to over Realtime.
//
// Every run is idempotent: it recomputes the scores every card should have from the tap_counts
// view, compares them with what is stored, and writes only the rows that differ ("look for delta").
// Deleting taps lowers scores again; nothing is counted twice.
//
// Runs on Deno inside Supabase. Deploy: `npm run worker:deploy` (supabase functions deploy).

import { createClient } from "npm:@supabase/supabase-js@2";

/** Which NFC reader stands at which game. Keep in sync with apps/web/src/lib/readers.ts (Deno cannot import it). */
const READER_GAMES: Record<string, string> = {
  "esp32c3-1": "uncertainty",
  "esp32c3-2": "plinko",
  "esp32c3-3": "seventeen",
  "esp32c3-4": "quantem",
  "esp32c3-5": "quabble",
};

/** Every tap at a game reader is worth this many points. */
const POINTS_PER_TAP = 100;

type TapCount = { uid: string; reader_id: string; taps: number; last_tap_at: string };
type ScoreRow = { uid: string; game_id: string; taps: number; score: number; last_tap_at: string | null };

/**
 * Credentials a caller may present: WORKER_SECRET (a dedicated token set with
 * `supabase secrets set WORKER_SECRET=...` and stored in Vault for the cron job) or any of the
 * project's secret keys from the env the runtime provides (named keys and the legacy service role key).
 */
function secretKeys(): string[] {
  const keys = new Set<string>();
  for (const name of ["WORKER_SECRET", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY"]) {
    const value = Deno.env.get(name);
    if (value) keys.add(value);
  }
  const named = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (named) {
    try {
      const parsed: unknown = JSON.parse(named);
      const values = Array.isArray(parsed) ? parsed : typeof parsed === "object" && parsed ? Object.values(parsed) : [];
      for (const entry of values) {
        if (typeof entry === "string") keys.add(entry);
        else if (entry && typeof entry === "object") {
          for (const field of ["key", "secret", "value", "api_key"]) {
            const v = (entry as Record<string, unknown>)[field];
            if (typeof v === "string") keys.add(v);
          }
        }
      }
    } catch {
      // Malformed JSON: fall back to the plain variables above.
    }
  }
  return [...keys];
}

/** Only callers holding a secret key get in: Cron (via Vault) or an operator with curl. */
function authorized(req: Request, keys: string[]): boolean {
  const apikey = req.headers.get("apikey") ?? "";
  const bearer = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  return keys.some((k) => k === apikey || k === bearer);
}

const epoch = (iso: string | null | undefined) => (iso ? new Date(iso).getTime() : null);

Deno.serve(async (req) => {
  const keys = secretKeys();
  if (!authorized(req, keys)) {
    return Response.json({ ok: false, error: "unauthorized: send WORKER_SECRET or a project secret key in the apikey header" }, { status: 401 });
  }
  const url = Deno.env.get("SUPABASE_URL");
  // Database access needs a real project key (WORKER_SECRET only unlocks this endpoint).
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? keys.find((k) => k !== Deno.env.get("WORKER_SECRET"));
  if (!url || !serviceKey) {
    return Response.json({ ok: false, error: "SUPABASE_URL or a service key is missing from the function env" }, { status: 500 });
  }

  const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const ranAt = new Date().toISOString();

  async function heartbeat(ok: boolean, message: string, changedRows: number) {
    const current = await db.from("worker_state").select("runs").eq("id", 1).maybeSingle();
    const runs = Number(current.data?.runs ?? 0) + 1;
    const { error } = await db
      .from("worker_state")
      .upsert({ id: 1, last_run_at: ranAt, last_ok: ok, last_message: message, changed_rows: changedRows, runs }, { onConflict: "id" });
    if (error) console.error(`worker_state: ${error.message}`);
  }

  try {
    // 1. What every card should have, from the tap log.
    const counts = await db.from("tap_counts").select("uid, reader_id, taps, last_tap_at");
    if (counts.error) throw new Error(`tap_counts: ${counts.error.message}`);
    const desired = new Map<string, ScoreRow>();
    let ignoredReaders = 0;
    for (const row of (counts.data ?? []) as TapCount[]) {
      const game = READER_GAMES[row.reader_id];
      if (!game) {
        ignoredReaders += 1; // test rows (laptop-test) and unknown readers do not score
        continue;
      }
      desired.set(`${row.uid}|${game}`, {
        uid: row.uid,
        game_id: game,
        taps: row.taps,
        score: row.taps * POINTS_PER_TAP,
        last_tap_at: row.last_tap_at,
      });
    }

    // 2. What is stored now.
    const stored = await db.from("scores").select("uid, game_id, taps, score, last_tap_at");
    if (stored.error) throw new Error(`scores: ${stored.error.message}`);
    const have = new Map<string, ScoreRow>();
    for (const row of (stored.data ?? []) as ScoreRow[]) have.set(`${row.uid}|${row.game_id}`, row);

    // 3. The delta.
    const changed: (ScoreRow & { updated_at: string })[] = [];
    for (const [key, want] of desired) {
      const got = have.get(key);
      const same =
        got !== undefined &&
        got.taps === want.taps &&
        got.score === want.score &&
        epoch(got.last_tap_at) === epoch(want.last_tap_at);
      if (!same) changed.push({ ...want, updated_at: ranAt });
    }
    const removed = [...have.values()].filter((row) => !desired.has(`${row.uid}|${row.game_id}`));

    // 4. Write only what changed.
    if (changed.length > 0) {
      const { error } = await db.from("scores").upsert(changed, { onConflict: "uid,game_id" });
      if (error) throw new Error(`scores upsert: ${error.message}`);
    }
    for (const row of removed) {
      const { error } = await db.from("scores").delete().eq("uid", row.uid).eq("game_id", row.game_id);
      if (error) throw new Error(`scores delete: ${error.message}`);
    }

    const summary = `${changed.length} changed, ${removed.length} removed, ${desired.size} rows, ${ignoredReaders} ignored readers`;
    await heartbeat(true, summary, changed.length + removed.length);
    console.log(`score-taps ${ranAt}: ${summary}`);
    return Response.json({
      ok: true,
      changed: changed.length,
      removed: removed.length,
      rows: desired.size,
      ignored_readers: ignoredReaders,
      ran_at: ranAt,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error(`score-taps ${ranAt}: FAILED ${message}`);
    await heartbeat(false, message, 0).catch(() => {});
    return Response.json({ ok: false, error: message, ran_at: ranAt }, { status: 500 });
  }
});
