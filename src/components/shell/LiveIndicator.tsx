"use client";

import { env } from "@/lib/env";
import { formatAgo } from "@/lib/format";
import { useNowSeconds } from "@/lib/hooks/useNow";
import { useLiveStatus } from "@/lib/liveStatus";
import { cn } from "@/lib/utils/cn";

type State = "live" | "stale" | "offline";

function deriveState(nowMs: number | null, lastGoodAt: number | null, failing: boolean): { state: State; ageMs: number } {
  if (nowMs === null || lastGoodAt === null) return { state: "live", ageMs: 0 };
  const ageMs = Math.max(0, nowMs - lastGoodAt);
  if (ageMs <= 3 * env.pollMs) return { state: "live", ageMs };
  return { state: failing ? "offline" : "stale", ageMs };
}

const styles: Record<State, { pill: string; dot: string; label: string }> = {
  live: { pill: "border-cyan/50 text-cyan", dot: "bg-cyan animate-blink", label: "LIVE" },
  stale: { pill: "border-amber/60 text-amber", dot: "bg-amber", label: "STALE" },
  offline: { pill: "border-alert/60 text-alert", dot: "bg-alert animate-blink", label: "LINK LOST" },
};

/** LIVE → STALE → LINK LOST, from what the board's poller last saw. */
export function LiveIndicator() {
  const seconds = useNowSeconds();
  const { lastGoodAt, failing } = useLiveStatus();
  const { state, ageMs } = deriveState(seconds === null ? null : seconds * 1000, lastGoodAt, failing);
  const s = styles[state];
  return (
    <div
      role="status"
      className={cn(
        "flex items-center gap-[0.6vw] rounded-full border px-[1vw] py-[0.6vh] font-label text-[1.7vh] font-bold tracking-[0.32em] uppercase max-lg:gap-2 max-lg:px-3 max-lg:py-1 max-lg:text-xs",
        s.pill,
      )}
    >
      <span aria-hidden className={cn("h-[1.1vh] w-[1.1vh] rounded-full shadow-[0_0_0.6rem_currentColor] max-lg:h-2 max-lg:w-2", s.dot)} />
      <span>{s.label}</span>
      {state !== "live" ? <span className="font-num text-[1.5vh] tracking-normal tabular-nums max-lg:text-xs">{formatAgo(ageMs)}</span> : null}
    </div>
  );
}
