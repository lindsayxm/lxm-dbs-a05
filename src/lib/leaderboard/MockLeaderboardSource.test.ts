import { describe, expect, it } from "vitest";
import { GAMES } from "@/lib/games";
import { CYCLE_MS, EPOCH_MS, MockLeaderboardSource, SCORE_CAP, cellScore, simulate } from "./MockLeaderboardSource";
import { MOCK_PLAYERS } from "./mockPlayers";

const at = (offsetMs: number) => new Date(EPOCH_MS + offsetMs);
const MIN = 60_000;

describe("MockLeaderboardSource", () => {
  it("is deterministic for the same seed and instant", async () => {
    const a = await new MockLeaderboardSource(7).getSnapshot(at(12 * MIN));
    const b = await new MockLeaderboardSource(7).getSnapshot(at(12 * MIN));
    expect(a).toEqual(b);
  });

  it("differs by seed and over time", async () => {
    const seed7 = await new MockLeaderboardSource(7).getSnapshot(at(12 * MIN));
    const seed8 = await new MockLeaderboardSource(8).getSnapshot(at(12 * MIN));
    const later = await new MockLeaderboardSource(7).getSnapshot(at(13 * MIN));
    expect(seed7.entries).not.toEqual(seed8.entries);
    expect(seed7.entries).not.toEqual(later.entries);
  });

  it("returns a full top 10 mid-session with contiguous ranks and bounded scores", async () => {
    const snap = await new MockLeaderboardSource(7).getSnapshot(at(12 * MIN));
    expect(snap.entries).toHaveLength(10);
    expect(snap.totalPlayers).toBe(MOCK_PLAYERS.length);
    expect(snap.source).toBe("mock");
    expect(snap.entries.map((e) => e.rank)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    for (const entry of snap.entries) {
      let sum = 0;
      for (const game of GAMES) {
        const v = entry.scores[game.id];
        if (v === null) continue;
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(SCORE_CAP);
        sum += v;
      }
      expect(entry.total).toBe(sum);
    }
    expect(snap.entries[0].total).toBeGreaterThanOrEqual(snap.entries[9].total);
  });

  it("is monotonic per cell within a cycle and resets at the next cycle", () => {
    for (let pi = 0; pi < MOCK_PLAYERS.length; pi++) {
      for (let gi = 0; gi < GAMES.length; gi++) {
        let previous = -1;
        let seen = false;
        for (let t = 0; t < CYCLE_MS; t += 15_000) {
          const cell = cellScore(7, pi, gi, t);
          if (cell === null) {
            expect(seen).toBe(false); // once a cell has started it never goes back to null
            continue;
          }
          seen = true;
          expect(cell.score).toBeGreaterThanOrEqual(previous);
          previous = cell.score;
        }
        expect(seen).toBe(true); // every cell starts within the arrival window
      }
    }
    const endOfCycle = simulate(7, MOCK_PLAYERS, at(CYCLE_MS - 1)).scores.length;
    const startOfNext = simulate(7, MOCK_PLAYERS, at(CYCLE_MS + 1)).scores.length;
    expect(endOfCycle).toBe(MOCK_PLAYERS.length * GAMES.length);
    expect(startOfNext).toBeLessThan(endOfCycle);
  });

  it("changes rank order within ten minutes", async () => {
    const source = new MockLeaderboardSource(7);
    const before = (await source.getSnapshot(at(5 * MIN))).entries.map((e) => e.player.id);
    const after = (await source.getSnapshot(at(15 * MIN))).entries.map((e) => e.player.id);
    expect(after).not.toEqual(before);
  });

  it("stamps updatedAt from the cycle start, never in the future", () => {
    const now = at(CYCLE_MS * 3 + 9 * MIN);
    const { scores, cycleStartMs } = simulate(7, MOCK_PLAYERS, now);
    expect(cycleStartMs).toBe(EPOCH_MS + CYCLE_MS * 3);
    for (const s of scores) {
      const ts = new Date(s.updatedAt).getTime();
      expect(ts).toBeGreaterThanOrEqual(cycleStartMs);
      expect(ts).toBeLessThanOrEqual(now.getTime());
    }
  });
});
