// NEXT_PUBLIC_* values are inlined at build time, so each must be a full static expression.
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

export const env = {
  /** Fallback poll interval, ms. Realtime pushes arrive first; the poll covers a dropped socket. */
  pollMs: Number(process.env.NEXT_PUBLIC_POLL_MS ?? "15000") || 15000,
  supabaseUrl,
  supabaseAnonKey,
  /** True when the browser can open its own Realtime socket to Supabase. */
  realtime: Boolean(supabaseUrl && supabaseAnonKey),
} as const;
