import "server-only";
import type { LeaderboardSourceName } from "@/lib/types";

function parseDate(value: string | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Server-side configuration. None of it reaches the browser. */
export const serverEnv = {
  source: (process.env.LEADERBOARD_SOURCE === "supabase" ? "supabase" : "mock") satisfies LeaderboardSourceName,
  mockSeed: Number(process.env.MOCK_SEED ?? "7") || 7,
  /** When set, the mock clock is pinned here (stable screenshots and demos). */
  mockFreezeAt: parseDate(process.env.MOCK_FREEZE_AT),
} as const;
