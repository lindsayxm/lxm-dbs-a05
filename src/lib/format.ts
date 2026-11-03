const scoreFormat = new Intl.NumberFormat("en-US");

/** `12480` → `"12,480"`; an unplayed game (`null`) → `"—"`. */
export function formatScore(value: number | null | undefined): string {
  return value === null || value === undefined ? "—" : scoreFormat.format(value);
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Local wall-clock time, 24 h, `HH:MM:SS`. */
export function formatClock(date: Date): string {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

/** `4200` → `"4s"`, `75000` → `"1m 15s"`. */
export function formatAgo(ms: number): string {
  const seconds = Math.max(0, Math.round(ms / 1000));
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${pad2(seconds % 60)}s`;
}
