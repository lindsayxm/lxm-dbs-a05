import { describe, expect, it } from "vitest";
import { hash32, mulberry32, unit } from "@/lib/prng";

describe("mulberry32", () => {
  it("is deterministic and stays in [0, 1)", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = Array.from({ length: 50 }, () => a());
    const seqB = Array.from({ length: 50 }, () => b());
    expect(seqA).toEqual(seqB);
    for (const v of seqA) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("differs between seeds", () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });
});

describe("hash32", () => {
  it("is deterministic, order-sensitive and well spread", () => {
    expect(hash32(7, 1, 2)).toBe(hash32(7, 1, 2));
    expect(hash32(7, 1, 2)).not.toBe(hash32(7, 2, 1));
    expect(hash32(7, 1, 2)).not.toBe(hash32(7, 1, 2, 0));
    const values = Array.from({ length: 1000 }, (_, i) => unit(hash32(7, i)));
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    expect(mean).toBeGreaterThan(0.45);
    expect(mean).toBeLessThan(0.55);
    expect(new Set(values).size).toBe(1000);
  });
});
