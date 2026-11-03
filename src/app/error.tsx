"use client";

import { QubitMotif } from "@/components/shell/QubitMotif";

/** Render-time failures (for example a misconfigured data source) land here instead of a blank wall. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid h-dvh place-items-center px-4">
      <div className="hud-panel animate-fade-up flex max-w-[40rem] flex-col items-center gap-[2vh] rounded-[1vh] px-[3vw] py-[4vh] text-center">
        <QubitMotif className="h-[10vh] w-[10vh] text-alert" />
        <p className="font-display text-[3.2vh] font-bold tracking-[0.2em] text-alert text-glow">SIGNAL FAULT</p>
        <p className="font-num text-[1.8vh] text-dim">{error.message}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-[1vh] rounded-full border border-cyan/60 px-[2vw] py-[1vh] font-label text-[1.8vh] font-semibold tracking-[0.3em] text-cyan uppercase transition hover:bg-cyan/10"
        >
          Retry
        </button>
      </div>
    </main>
  );
}
