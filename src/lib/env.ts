// NEXT_PUBLIC_* values are inlined at build time, so each must be a full static expression.
export const env = {
  /** Poll interval for the wall screen, ms. */
  pollMs: Number(process.env.NEXT_PUBLIC_POLL_MS ?? "3000") || 3000,
  devTools: process.env.NEXT_PUBLIC_DEV_TOOLS === "true",
} as const;
