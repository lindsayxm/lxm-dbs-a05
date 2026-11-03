"use client";

import { env } from "@/lib/env";
import { formatAgo } from "@/lib/format";
import { useNowSeconds } from "@/lib/hooks/useNow";
import { useLiveStatus, type LiveStatus } from "@/lib/liveStatus";
import { cn } from "@/lib/utils/cn";

type State = "live" | "stale" | "offline" | "idle";

/** The worker runs every 10 s; a heartbeat older than this means the cron job has stopped. */
const WORKER_IDLE_MS = 60_000;

export function deriveState(nowMs: number | null, status: LiveStatus): { state: State; ageMs: number } {
  if (nowMs === null || status.lastGoodAt === null) return { state: "live", ageMs: 0 };
  const ageMs = Math.max(0, nowMs - status.lastGoodAt);
  if (ageMs > 3 * env.pollMs) return { state: status.failing ? "offline" : "stale", ageMs };
  const workerMs = status.workerLastRunAt === null ? null : new Date(status.workerLastRunAt).getTime();
  if (workerMs === null || Number.isNaN(workerMs)) return { state: "idle", ageMs: 0 };
  const workerAgeMs = Math.max(0, nowMs - workerMs);
  if (workerAgeMs > WORKER_IDLE_MS) return { state: "idle", ageMs: workerAgeMs };
  return { state: "live", ageMs };
}

const styles: Record<State, { pill: string; dot: string; label: string }> = {
  live: { pill: "border-cyan/50 text-cyan", dot: "bg-cyan animate-blink", label: "LIVE" },
  stale: { pill: "border-amber/60 text-amber", dot: "bg-amber", label: "STALE" },
  offline: { pill: "border-alert/60 text-alert", dot: "bg-alert animate-blink", label: "LINK LOST" },
  idle: { pill: "border-amber/60 text-amber", dot: "bg-amber", label: "WORKER IDLE" },
};

/**
 * LIVE → STALE → LINK LOST from what the board's fetcher last saw, WORKER IDLE when the
 * Supabase cron job has stopped writing scores. LIVE also says whether updates arrive by
 * Realtime push or by polling.
 */
export function LiveIndicator() {
  const seconds = useNowSeconds();
  const status = useLiveStatus();
  const { state, ageMs } = deriveState(seconds === null ? null : seconds * 1000, status);
  const s = styles[state];
  const detail =
    state === "live" ? (status.realtime === "on" ? "PUSH" : status.realtime === "connecting" ? "LINKING" : "POLL") : state === "idle" && ageMs === 0 ? "NO RUNS" : formatAgo(ageMs);
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
      <span className={cn("font-num text-[1.5vh] tracking-normal tabular-nums max-lg:text-xs", state === "live" && "text-cyan/70")}>{detail}</span>
    </div>
  );
}
