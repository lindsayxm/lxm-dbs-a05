"use client";

import { GAMES, type GameId } from "@/lib/games";
import type { LeaderboardEntry } from "@/lib/types";
import { Avatar } from "@/components/avatars/Avatar";
import { Crown } from "./Crown";
import { RankBadge } from "./RankBadge";
import { ScoreCell } from "./ScoreCell";
import { toneFor } from "./grid";

export type RowProps = {
  entry: LeaderboardEntry;
  /** Rank in the previous snapshot, null if the player was not on the board. */
  previousRank: number | null;
  /** Total in the previous snapshot, undefined if there was no previous snapshot or the player was absent. */
  previousTotal: number | undefined;
};

/** The content of one row. The surrounding motion.li lives in BoardTable. */
export function BoardRowContent({ entry, previousRank, previousTotal }: RowProps) {
  const tone = toneFor(entry.rank);
  const delta = previousRank === null ? null : previousRank - entry.rank; // positive = moved up
  const changed = previousTotal !== undefined && previousTotal !== entry.total;

  return (
    <>
      <RankBadge rank={entry.rank} tone={tone} delta={delta} />
      <Avatar id={entry.player.avatarId} tone={tone} className="h-[6.2vh] w-[6.2vh] max-lg:h-11 max-lg:w-11" />
      <div className="flex min-w-0 items-center gap-[0.8vw] max-lg:flex-1 max-lg:gap-2">
        <span className="truncate font-label text-[2.7vh] font-semibold tracking-[0.06em] text-text max-lg:text-base" title={entry.player.username}>
          {entry.player.username}
        </span>
        {entry.rank === 1 ? <Crown className="h-[3vh] w-[3vh] shrink-0 max-lg:h-5 max-lg:w-5" /> : null}
      </div>
      <div className="contents max-lg:order-last max-lg:flex max-lg:w-full max-lg:justify-between max-lg:gap-2 max-lg:border-t max-lg:border-hairline max-lg:pt-2">
        {GAMES.map((game) => (
          <ScoreCell key={game.id} value={entry.scores[game.id as GameId]} label={game.short} />
        ))}
      </div>
      <ScoreCell value={entry.total} emphasis />
      {changed ? (
        <span
          key={entry.total}
          aria-hidden
          className="animate-pulse-row pointer-events-none absolute inset-0 rounded-[0.6vh] bg-cyan/10 ring-1 ring-cyan/60"
        />
      ) : null}
    </>
  );
}
