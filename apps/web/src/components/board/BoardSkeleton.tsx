import { BoardColumns } from "./BoardColumns";
import { ROW_GRID } from "./grid";

/** Ten ghost rows while the first snapshot streams in. */
export function BoardSkeleton() {
  return (
    <section aria-busy="true" aria-label="Loading leaderboard" className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-y-[0.8vh]">
      <BoardColumns />
      <ol className="grid min-h-0 grid-rows-[repeat(10,minmax(0,1fr))] gap-y-[0.6vh] max-lg:flex max-lg:flex-col max-lg:gap-2">
        {Array.from({ length: 10 }, (_, i) => (
          <li key={i} className={`hud-row hud-shimmer animate-shimmer rounded-[0.6vh] max-lg:h-16 ${ROW_GRID}`} style={{ animationDelay: `${i * 80}ms` }} />
        ))}
      </ol>
    </section>
  );
}
