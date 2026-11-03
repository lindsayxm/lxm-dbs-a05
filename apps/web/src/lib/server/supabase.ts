import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { serverEnv } from "./env";

let client: SupabaseClient | undefined;

/** Read-only access with the public anon key. Throws a clear message when the env is missing. */
export function supabase(): SupabaseClient {
  if (!serverEnv.configured) {
    throw new Error("Supabase is not configured: set SUPABASE_URL and SUPABASE_ANON_KEY (see apps/web/.env.example)");
  }
  return (client ??= createClient(serverEnv.supabaseUrl, serverEnv.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    // Every snapshot must be fresh: never let the Next.js fetch cache hold a board.
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  }));
}
