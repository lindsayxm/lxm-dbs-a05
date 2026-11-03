import { describe, expect, it } from "vitest";
import { formatAgo, formatClock, formatScore } from "@/lib/format";

describe("formatScore", () => {
  it("adds thousands separators", () => expect(formatScore(12345)).toBe("12,345"));
  it("keeps zero", () => expect(formatScore(0)).toBe("0"));
  it("shows an em dash for unplayed", () => {
    expect(formatScore(null)).toBe("—");
    expect(formatScore(undefined)).toBe("—");
  });
});

describe("formatClock", () => {
  it("pads to HH:MM:SS", () => {
    const d = new Date(2026, 0, 1, 9, 5, 3);
    expect(formatClock(d)).toBe("09:05:03");
  });
});

describe("formatAgo", () => {
  it("formats seconds and minutes", () => {
    expect(formatAgo(4200)).toBe("4s");
    expect(formatAgo(75000)).toBe("1m 15s");
    expect(formatAgo(-5)).toBe("0s");
  });
});
