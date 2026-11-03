import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

let client: SupabaseClient | null | undefined;

/** The browser's own client, used only for the Realtime subscription. `null` when NEXT_PUBLIC_SUPABASE_* are unset. */
export function browserSupabase(): SupabaseClient | null {
  if (client === undefined) {
    client = env.realtime
      ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
          auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        })
      : null;
  }
  return client;
}
