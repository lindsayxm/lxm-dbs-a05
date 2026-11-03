import "server-only";

/** The bare project origin. Accepts the Data API URL (…/rest/v1) or a missing scheme, which the dashboard makes easy to paste. */
function projectOrigin(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  try {
    return new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`).origin;
  } catch {
    return "";
  }
}

const tableName = (raw: string | undefined, fallback: string) => (raw ?? "").trim() || fallback;

const supabaseUrl = projectOrigin(process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

/**
 * Server-side configuration. The server reads the board with the public anon key (RLS allows
 * select on users, scores and worker_state); the worker writes with the secret key on Supabase.
 */
export const serverEnv = {
  supabaseUrl,
  supabaseAnonKey,
  usersTable: tableName(process.env.SUPABASE_USERS_TABLE, "users"),
  scoresTable: tableName(process.env.SUPABASE_SCORES_TABLE, "scores"),
  /** True when both the URL and the key are set; otherwise every snapshot fails with a clear message. */
  configured: Boolean(supabaseUrl && supabaseAnonKey),
} as const;
