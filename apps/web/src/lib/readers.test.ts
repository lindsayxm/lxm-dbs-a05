import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { GAMES } from "@/lib/games";
import { READER_GAMES, READER_IDS, gameForReader } from "@/lib/readers";

describe("READER_GAMES", () => {
  it("pairs the five readers with the five games in AGENTS.md order", () => {
    expect(READER_IDS.map((id) => READER_GAMES[id])).toEqual(GAMES.map((g) => g.id));
    expect(gameForReader("esp32c3-3")).toBe("seventeen");
    expect(gameForReader("laptop-test")).toBeNull();
  });

  it("matches the copy inside the worker (supabase/functions/score-taps/index.ts)", () => {
    const worker = fileURLToPath(new URL("../../../../supabase/functions/score-taps/index.ts", import.meta.url));
    const source = readFileSync(worker, "utf8");
    for (const [reader, game] of Object.entries(READER_GAMES)) {
      expect(source).toMatch(new RegExp(`"${reader}":\\s*"${game}"`));
    }
    expect(source).toMatch(/POINTS_PER_TAP = 100\b/);
  });
});
