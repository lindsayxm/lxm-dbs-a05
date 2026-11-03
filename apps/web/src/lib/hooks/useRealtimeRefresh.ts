"use client";

import { useEffect } from "react";
import { setLiveStatus } from "@/lib/liveStatus";
import { browserSupabase } from "@/lib/supabase/browser";

/** The tables the worker and the registration flow write; a change in either redraws the board. */
const TABLES = ["scores", "users"] as const;
const DEBOUNCE_MS = 200;

/**
 * Subscribes to Postgres changes on the worker's tables and calls `refresh` (debounced) on each
 * push, so the board updates the moment the worker writes instead of waiting for the poll.
 * `refresh` must be referentially stable (wrap it in useCallback).
 */
export function useRealtimeRefresh(refresh: () => void) {
  useEffect(() => {
    const client = browserSupabase();
    if (!client) {
      setLiveStatus({ realtime: "off" });
      return;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    const bump = () => {
      clearTimeout(timer);
      timer = setTimeout(refresh, DEBOUNCE_MS);
    };

    let channel = client.channel("leaderboard");
    for (const table of TABLES) {
      channel = channel.on("postgres_changes", { event: "*", schema: "public", table }, bump);
    }
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setLiveStatus({ realtime: "on" });
        bump(); // catch anything that changed while the socket was down
      } else if (status === "CLOSED") {
        setLiveStatus({ realtime: "off" });
      } else {
        setLiveStatus({ realtime: "connecting" }); // TIMED_OUT / CHANNEL_ERROR: the client retries
      }
    });

    return () => {
      clearTimeout(timer);
      void client.removeChannel(channel);
      setLiveStatus({ realtime: "off" });
    };
  }, [refresh]);
}
