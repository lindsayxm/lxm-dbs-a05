import { describe, expect, it } from "vitest";
import { rankPlayers, sumScores, emptyScores } from "@/lib/ranking";
import type { GameScore, Player } from "@/lib/types";

const T0 = "2026-10-29T00:00:00.000Z";
const player = (id: string, username: string, joinedAt = T0): Player => ({ id, username, avatarId: "qubit", joinedAt });
const score = (playerId: string, gameId: GameScore["gameId"], value: number, updatedAt = T0): GameScore => ({
  playerId,
  gameId,
  score: value,
  updatedAt,
});

describe("sumScores", () => {
  it("treats unplayed games as 0", () => {
    const scores = emptyScores();
    scores.plinko = 120;
    scores.quabble = 30;
    expect(sumScores(scores)).toBe(150);
  });
});

describe("rankPlayers", () => {
  it("ranks by total, highest first, with contiguous ranks", () => {
    const players = [player("a", "Alpha"), player("b", "Bravo"), player("c", "Charlie")];
    const scores = [score("a", "plinko", 100), score("b", "plinko", 300), score("c", "seventeen", 200)];
    const ranked = rankPlayers(players, scores);
    expect(ranked.map((e) => [e.rank, e.player.id, e.total])).toEqual([
      [1, "b", 300],
      [2, "c", 200],
      [3, "a", 100],
    ]);
    expect(ranked[2].scores).toEqual({ ...emptyScores(), plinko: 100 });
  });

  it("breaks ties by who reached the total first, then by username", () => {
    const players = [player("late", "Zed"), player("early", "Yan"), player("same", "Abe")];
    const scores = [
      score("late", "plinko", 500, "2026-10-29T00:05:00.000Z"),
      score("early", "plinko", 500, "2026-10-29T00:01:00.000Z"),
      score("same", "plinko", 500, "2026-10-29T00:05:00.000Z"),
    ];
    expect(rankPlayers(players, scores).map((e) => e.player.id)).toEqual(["early", "same", "late"]);
  });

  it("cuts to the limit", () => {
    const players = Array.from({ length: 16 }, (_, i) => player(`p${i}`, `Player${i}`));
    const scores = players.map((p, i) => score(p.id, "quantem", i * 10));
    const ranked = rankPlayers(players, scores, 10);
    expect(ranked).toHaveLength(10);
    expect(ranked.map((e) => e.rank)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(ranked[0].player.id).toBe("p15");
  });

  it("keeps the latest write when a game has several rows, and ignores unknown players", () => {
    const players = [player("a", "Alpha")];
    const scores = [
      score("a", "plinko", 50, "2026-10-29T00:02:00.000Z"),
      score("a", "plinko", 20, "2026-10-29T00:01:00.000Z"),
      score("ghost", "plinko", 999),
    ];
    const ranked = rankPlayers(players, scores);
    expect(ranked).toHaveLength(1);
    expect(ranked[0].scores.plinko).toBe(50);
    expect(ranked[0].lastUpdatedAt).toBe("2026-10-29T00:02:00.000Z");
  });
});
