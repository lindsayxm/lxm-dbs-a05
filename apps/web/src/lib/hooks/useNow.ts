"use client";

import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (timer === null) timer = setInterval(() => listeners.forEach((l) => l()), 1000);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };
}

const getSnapshot = () => Math.floor(Date.now() / 1000);
const getServerSnapshot = () => null;

/**
 * The current time in whole seconds, ticking once a second. `null` on the server
 * and during hydration, so the first client render matches the server HTML.
 */
export function useNowSeconds(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
