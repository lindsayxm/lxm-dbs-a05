import type { GameId } from "./games";

/**
 * Which NFC reader stands at which game. The worker carries the same table in
 * supabase/functions/score-taps/index.ts (Deno cannot import this file); readers.test.ts
 * checks that the two copies agree.
 */
export const READER_GAMES = {
  "esp32c3-1": "uncertainty",
  "esp32c3-2": "plinko",
  "esp32c3-3": "seventeen",
  "esp32c3-4": "quantem",
  "esp32c3-5": "quabble",
} as const satisfies Record<string, GameId>;

export type ReaderId = keyof typeof READER_GAMES;
export const READER_IDS = Object.keys(READER_GAMES) as ReaderId[];

/** The game a reader scores for, or null for anything else (test rows such as `laptop-test`). */
export function gameForReader(readerId: string): GameId | null {
  return (READER_GAMES as Record<string, GameId | undefined>)[readerId] ?? null;
}
