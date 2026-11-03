import { LiveClock } from "./LiveClock";
import { LiveIndicator } from "./LiveIndicator";
import { QubitMotif } from "./QubitMotif";

export function Header() {
  return (
    <header className="flex items-center justify-between gap-[2vw] max-lg:flex-wrap max-lg:gap-3">
      <div className="flex items-center gap-[1.2vw] max-lg:gap-3">
        <QubitMotif className="h-[7vh] w-[7vh] shrink-0 max-lg:h-12 max-lg:w-12" />
        <div>
          <h1 className="font-display text-[3.4vh] leading-none font-bold tracking-[0.2em] text-text text-glow max-lg:text-xl">
            QUANTUM CASINO
          </h1>
          <p className="mt-[0.8vh] font-label text-[1.8vh] leading-none font-semibold tracking-[0.45em] text-cyan/90 uppercase max-lg:mt-1 max-lg:text-xs">
            Leaderboard · Top 10
          </p>
        </div>
      </div>
      <div className="flex items-center gap-[1.6vw] max-lg:gap-3">
        <LiveIndicator />
        <LiveClock />
      </div>
    </header>
  );
}
