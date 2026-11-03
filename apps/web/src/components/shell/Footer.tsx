import { GAMES } from "@/lib/games";
import { GameGlyph } from "@/components/board/GameGlyph";

export function Footer() {
  return (
    <footer className="flex items-center justify-between gap-[2vw] font-label text-[1.5vh] font-semibold tracking-[0.3em] text-dim uppercase max-lg:flex-col max-lg:items-start max-lg:gap-2 max-lg:text-[0.65rem]">
      <ul className="flex flex-wrap items-center gap-x-[2vw] gap-y-[0.6vh] max-lg:gap-x-4">
        {GAMES.map((game) => (
          <li key={game.id} className="flex items-center gap-[0.5vw] max-lg:gap-1.5">
            <GameGlyph id={game.id} className="h-[1.9vh] w-[1.9vh] text-cyan/80 max-lg:h-3.5 max-lg:w-3.5" />
            <span className="text-cyan/90">{game.short}</span>
            <span>{game.name}</span>
          </li>
        ))}
      </ul>
      <p>Scores sync via NFC wristband</p>
    </footer>
  );
}
