import type { Tone } from "./grid";
import { cn } from "@/lib/utils/cn";

const toneText: Record<Tone, string> = {
  gold: "text-gold text-glow",
  silver: "text-silver text-glow",
  bronze: "text-bronze text-glow",
  cyan: "text-cyan/80",
};

type Props = { rank: number; tone: Tone; delta: number | null };

/** Rank number plus a short-lived ▲/▼ when the player just moved. */
export function RankBadge({ rank, tone, delta }: Props) {
  return (
    <div className="flex items-center gap-[0.4vw] max-lg:gap-1">
      <span className={cn("font-display text-[3vh] font-bold tabular-nums max-lg:text-lg", toneText[tone])}>
        {String(rank).padStart(2, "0")}
      </span>
      {delta ? (
        <span
          key={`${rank}:${delta}`}
          className={cn(
            "animate-fade-out font-label text-[1.6vh] font-bold tabular-nums max-lg:text-xs",
            delta > 0 ? "text-up" : "text-down",
          )}
          aria-hidden
        >
          {delta > 0 ? `▲${delta}` : `▼${-delta}`}
        </span>
      ) : null}
    </div>
  );
}
