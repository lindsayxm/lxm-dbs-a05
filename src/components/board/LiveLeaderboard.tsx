"use client";

import { useEffect } from "react";
import useSWR from "swr";
import { env } from "@/lib/env";
import { setLiveStatus } from "@/lib/liveStatus";
import type { LeaderboardSnapshot } from "@/lib/types";
import { BoardEmpty } from "./BoardEmpty";
import { BoardTable } from "./BoardTable";

const KEY = "/api/leaderboard";

async function fetcher(url: string): Promise<LeaderboardSnapshot> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

/**
 * Polls the route handler and hands each snapshot to the table. `fallbackData`
 * is the server-rendered snapshot, so the first client render matches the HTML.
 * On failure the last good snapshot stays on screen and the header shows STALE / LINK LOST.
 */
export function LiveLeaderboard({ initial }: { initial: LeaderboardSnapshot }) {
  const { data, error } = useSWR<LeaderboardSnapshot>(KEY, fetcher, {
    fallbackData: initial,
    refreshInterval: env.pollMs,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
    revalidateOnFocus: true,
    dedupingInterval: 1000,
    onErrorRetry: (_error, _key, _config, revalidate, { retryCount }) => {
      setTimeout(() => revalidate({ retryCount }), Math.min(30_000, 2000 * 2 ** retryCount));
    },
  });
  const snapshot = data ?? initial;

  useEffect(() => {
    setLiveStatus({ lastGoodAt: Date.now(), failing: false });
  }, [snapshot.generatedAt]);

  useEffect(() => {
    setLiveStatus({ failing: Boolean(error) });
  }, [error]);

  if (snapshot.entries.length === 0) return <BoardEmpty />;
  return <BoardTable snapshot={snapshot} />;
}
