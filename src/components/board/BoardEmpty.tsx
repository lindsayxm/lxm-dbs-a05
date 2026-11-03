import { QubitMotif } from "@/components/shell/QubitMotif";

export function BoardEmpty() {
  return (
    <section className="grid min-h-0 place-items-center">
      <div className="hud-panel animate-fade-up flex flex-col items-center gap-[2vh] rounded-[1vh] px-[4vw] py-[5vh] text-center">
        <QubitMotif className="h-[14vh] w-[14vh]" />
        <p className="font-display text-[3vh] font-bold tracking-[0.25em] text-cyan text-glow">AWAITING PLAYERS</p>
        <p className="font-label text-[1.8vh] tracking-[0.3em] text-dim uppercase">Tap a wristband at any game to enter the board</p>
      </div>
    </section>
  );
}
