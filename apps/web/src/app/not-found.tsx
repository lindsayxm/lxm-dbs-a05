import Link from "next/link";
import { QubitMotif } from "@/components/shell/QubitMotif";

export default function NotFound() {
  return (
    <main className="grid h-dvh place-items-center px-4">
      <div className="hud-panel animate-fade-up flex max-w-[36rem] flex-col items-center gap-[2vh] rounded-[1vh] px-[3vw] py-[4vh] text-center">
        <QubitMotif className="h-[10vh] w-[10vh] text-alert" />
        <p className="font-display text-[3.2vh] font-bold tracking-[0.2em] text-alert text-glow">SECTOR 404</p>
        <p className="font-label text-[2vh] tracking-[0.3em] text-dim uppercase">State not found · wavefunction collapsed</p>
        <Link
          href="/"
          className="mt-[1vh] rounded-full border border-cyan/60 px-[2vw] py-[1vh] font-label text-[1.8vh] font-semibold tracking-[0.3em] text-cyan uppercase transition hover:bg-cyan/10"
        >
          Return to the board
        </Link>
      </div>
    </main>
  );
}
