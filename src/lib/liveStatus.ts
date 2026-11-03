"use client";

import { useSyncExternalStore } from "react";

export type LiveStatus = {
  /** Epoch ms of the last snapshot that arrived successfully (the SSR one counts). */
  lastGoodAt: number | null;
  /** True while the latest poll is failing. */
  failing: boolean;
};

let status: LiveStatus = { lastGoodAt: null, failing: false };
const listeners = new Set<() => void>();

/** Tiny external store so the header indicator can read what the board's poller sees. */
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
