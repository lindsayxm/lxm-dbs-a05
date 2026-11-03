"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useState } from "react";
import { formatScore } from "@/lib/format";
import type { LeaderboardSnapshot } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { BoardColumns } from "./BoardColumns";
import { BoardRowContent } from "./BoardRow";
import { ROW_GRID, toneFor } from "./grid";

/** The snapshot before the current one (by generatedAt), for deltas and change pulses. */
function usePreviousSnapshot(snapshot: LeaderboardSnapshot): LeaderboardSnapshot | null {
  const [pair, setPair] = useState<{ current: LeaderboardSnapshot; previous: LeaderboardSnapshot | null }>({
    current: snapshot,
    previous: null,
  });
  if (pair.current.generatedAt !== snapshot.generatedAt) {
    setPair({ current: snapshot, previous: pair.current });
    return pair.current;
  }
  return pair.previous;
}

/** Announces leader changes only; announcing every score would be noise. */
function LeaderAnnouncer({ snapshot }: { snapshot: LeaderboardSnapshot }) {
  const leader = snapshot.entries[0];
  const [announced, setAnnounced] = useState<{ id: string; text: string } | null>(null);
  if (leader && announced?.id !== leader.player.id) {
    setAnnounced({ id: leader.player.id, text: `${leader.player.username} leads with ${formatScore(leader.total)} points` });
  }
  return (
    <p className="sr-only" aria-live="polite">
      {announced?.text ?? ""}
    </p>
  );
}

export function BoardTable({ snapshot }: { snapshot: LeaderboardSnapshot }) {
  const previous = usePreviousSnapshot(snapshot);
  const previousRank = new Map(previous?.entries.map((e) => [e.player.id, e.rank]));
  const previousTotal = new Map(previous?.entries.map((e) => [e.player.id, e.total]));

  return (
    <section aria-label="Top 10 players" className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-y-[0.8vh]">
      <BoardColumns />
      <MotionConfig reducedMotion="user">
        <ol className="grid min-h-0 grid-rows-[repeat(10,minmax(0,1fr))] gap-y-[0.6vh] max-lg:flex max-lg:flex-col max-lg:gap-2">
          <AnimatePresence initial={false} mode="popLayout">
            {snapshot.entries.map((entry) => {
              const tone = toneFor(entry.rank);
              return (
                <motion.li
                  key={entry.player.id}
                  layout="position"
                  data-row
                  data-tone={tone}
                  initial={{ opacity: 0, y: 48 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 48 }}
                  transition={{ type: "spring", stiffness: 280, damping: 32 }}
                  className={cn(
                    "hud-row rounded-[0.6vh] max-lg:flex max-lg:flex-wrap max-lg:items-center max-lg:gap-3 max-lg:px-3 max-lg:py-2",
                    ROW_GRID,
                    tone === "gold" && "animate-halo",
                  )}
                >
                  <BoardRowContent
                    entry={entry}
                    previousRank={previous ? (previousRank.get(entry.player.id) ?? null) : null}
                    previousTotal={previousTotal.get(entry.player.id)}
                  />
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>
      </MotionConfig>
      <LeaderAnnouncer snapshot={snapshot} />
    </section>
  );
}
