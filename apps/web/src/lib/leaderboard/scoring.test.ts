import { describe, expect, it } from "vitest";
import { buildPlayers, buildSnapshot, guestName, iso, toGameScores, type ScoreRow, type UserRow } from "./scoring";

const T = (h: number, m = 0) => `2026-11-02T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00.000Z`;
const user = (uid: string, user_nm: string, created_at = T(8)): UserRow => ({ uid, user_nm, avatar: "qubit", created_at });
const score = (uid: string, game_id: string, taps: number, last_tap_at: string | null = T(12)): ScoreRow => ({
  uid,
  game_id,
  taps,
  score: taps * 100,
  last_tap_at,
  updated_at: T(12, 30),
});

describe("guestName", () => {
  it("uses the last four hex digits of the uid", () => {
    expect(guestName("04:D4:16:67:CF:EF:62")).toBe("GUEST-EF62");
    expect(guestName("b2:af:de:46")).toBe("GUEST-DE46");
    expect(guestName("A1")).toBe("GUEST-00A1");
  });
});

describe("iso", () => {
  it("normalises Postgres offsets and rejects junk", () => {
    expect(iso("2026-11-02 12:01:22+00")).toBe("2026-11-02T12:01:22.000Z");
    expect(iso("2026-11-02T12:01:22+00:00")).toBe("2026-11-02T12:01:22.000Z");
    expect(iso("nope")).toBeNull();
    expect(iso(null)).toBeNull();
  });
});

describe("toGameScores", () => {
  it("keeps the worker's score and dates it by the last tap, dropping unknown games", () => {
    const rows = [score("a", "plinko", 3, "2026-11-02 12:01:22+00"), score("a", "roulette", 9), score("a", "quabble", 1, null)];
    expect(toGameScores(rows)).toEqual([
      { playerId: "a", gameId: "plinko", score: 300, updatedAt: "2026-11-02T12:01:22.000Z" },
      { playerId: "a", gameId: "quabble", score: 100, updatedAt: T(12, 30) },
    ]);
  });
});

describe("buildPlayers", () => {
  it("adds GUEST placeholders for cards that scored without a users row", () => {
    const players = buildPlayers([user("04:D4:16:67:CF:EF:62", "QubitBryce")], toGameScores([score("04:D4:16:67:CF:EF:62", "plinko", 2), score("5F:D0:E2:A5", "seventeen", 1, T(9))]));
    expect(players.map((p) => [p.id, p.username, p.avatarId, p.joinedAt])).toEqual([
      ["04:D4:16:67:CF:EF:62", "QubitBryce", "qubit", T(8)],
      ["5F:D0:E2:A5", "GUEST-E2A5", "fallback", T(9)],
    ]);
  });

  it("dates a late registration from the first tap instead", () => {
    const [p] = buildPlayers([user("a", "Late", T(20))], toGameScores([score("a", "plinko", 1, T(10))]));
    expect(p.joinedAt).toBe(T(10));
  });
});

describe("buildSnapshot", () => {
  it("ranks 100 points per tap, summed across games, with contiguous ranks", () => {
    const users = [user("a", "Alpha"), user("b", "Bravo"), user("c", "Charlie")];
    const rows = [
      score("a", "plinko", 3, T(10)),
      score("a", "seventeen", 2, T(11)),
      score("b", "quantem", 6, T(10, 30)),
      score("c", "uncertainty", 1, T(9)),
      score("ghost", "quabble", 4, T(9, 15)),
    ];
    const snap = buildSnapshot(users, rows, { last_run_at: "2026-11-02 12:00:00+00", last_ok: true, last_message: null }, new Date(T(13)), 10);
    expect(snap.workerLastRunAt).toBe(T(12));
    expect(snap.totalPlayers).toBe(4);
    expect(snap.entries.map((e) => [e.rank, e.player.username, e.total])).toEqual([
      [1, "Bravo", 600],
      [2, "Alpha", 500],
      [3, "GUEST-HOST", 400],
      [4, "Charlie", 100],
    ]);
    expect(snap.entries[1].scores).toEqual({ uncertainty: null, plinko: 300, seventeen: 200, quantem: null, quabble: null });
    expect(snap.entries[1].lastUpdatedAt).toBe(T(11));
  });

  it("cuts to the limit and lists registered guests who have not played yet at zero", () => {
    const users = Array.from({ length: 12 }, (_, i) => user(`u${i}`, `Guest${i}`));
    const rows = users.slice(0, 5).map((u, i) => score(u.uid, "plinko", i + 1, T(10, i)));
    const snap = buildSnapshot(users, rows, null, new Date(T(13)), 10);
    expect(snap.entries).toHaveLength(10);
    expect(snap.entries.map((e) => e.rank)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(snap.entries[0].player.id).toBe("u4");
    expect(snap.entries[9].total).toBe(0);
    expect(snap.workerLastRunAt).toBeNull();
  });
});
