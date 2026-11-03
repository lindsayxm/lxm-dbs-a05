"use client";

import { useSyncExternalStore } from "react";

export type RealtimeState = "off" | "connecting" | "on";

export type LiveStatus = {
  /** Epoch ms of the last snapshot that arrived successfully (the SSR one counts). */
  lastGoodAt: number | null;
  /** True while the latest fetch is failing. */
  failing: boolean;
  /** The browser's Supabase Realtime socket: "on" means pushes arrive, "off" means polling only. */
  realtime: RealtimeState;
  /** The worker's heartbeat from the latest snapshot; null until it has run once. */
  workerLastRunAt: string | null;
};

let status: LiveStatus = { lastGoodAt: null, failing: false, realtime: "off", workerLastRunAt: null };
const listeners = new Set<() => void>();

/** Tiny external store so the header indicator can read what the board's fetcher and socket see. */
export function setLiveStatus(patch: Partial<LiveStatus>) {
  status = { ...status, ...patch };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => status;

export function useLiveStatus(): LiveStatus {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
