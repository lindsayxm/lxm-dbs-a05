"use client";

import { useNowSeconds } from "@/lib/hooks/useNow";
import { formatClock } from "@/lib/format";

/** Wall-clock time. Renders a placeholder on the server, so hydration never mismatches. */
export function LiveClock() {
  const seconds = useNowSeconds();
  const date = seconds === null ? null : new Date(seconds * 1000);
  return (
    <time
      dateTime={date?.toISOString()}
      className="font-num text-[2.4vh] tabular-nums text-dim max-lg:text-base"
      suppressHydrationWarning
    >
      {date ? formatClock(date) : "--:--:--"}
    </time>
  );
}
