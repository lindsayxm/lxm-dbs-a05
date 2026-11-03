import { QubitMotif } from "@/components/shell/QubitMotif";

/**
 * The board's data source failed on the server (Supabase unreachable, env missing, table absent).
 * Rendered inside the Suspense boundary so the header and footer stay up and the wall shows a
 * readable reason instead of a minified React error.
 */
export function BoardFault({ message }: { message: string }) {
  return (
    <section className="grid min-h-0 place-items-center" role="alert">
      <div className="hud-panel animate-fade-up flex max-w-[60vw] flex-col items-center gap-[2vh] rounded-[1vh] px-[4vw] py-[5vh] text-center max-lg:max-w-full">
        <QubitMotif className="h-[12vh] w-[12vh] text-alert" />
        <p className="font-display text-[3vh] font-bold tracking-[0.25em] text-alert text-glow">SIGNAL FAULT</p>
        <p className="font-num text-[1.8vh] break-words text-dim">{message}</p>
        <p className="font-label text-[1.6vh] tracking-[0.3em] text-dim uppercase">Retrying automatically</p>
      </div>
    </section>
  );
}
