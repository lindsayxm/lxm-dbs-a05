import { GAMES } from "@/lib/games";
import { GameGlyph } from "./GameGlyph";
import { ROW_GRID } from "./grid";

/** Column labels above the rows. Hidden on handheld layouts (cells carry their own labels there). */
export function BoardColumns() {
  return (
    <div className={`${ROW_GRID} font-label text-[1.5vh] font-semibold tracking-[0.32em] text-dim uppercase max-lg:hidden`} aria-hidden>
      <span>#</span>
      <span />
      <span>Player</span>
      {GAMES.map((game) => (
        <span key={game.id} className="flex items-center justify-end gap-[0.4vw]">
          <GameGlyph id={game.id} className="h-[1.8vh] w-[1.8vh] text-cyan/70" />
          {game.short}
        </span>
      ))}
      <span className="text-right text-cyan/90">Total</span>
    </div>
  );
}
