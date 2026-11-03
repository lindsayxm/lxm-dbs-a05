import type { ReactNode } from "react";
import { Bracket } from "./Bracket";

/** Background layers and frame of the HUD. Pure markup: part of the static shell. */
export function HudChrome({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-void">
        <div className="hud-glow animate-drift absolute inset-[-2rem]" />
        <div className="hud-grid absolute inset-0" />
        <div className="hud-scan animate-scan absolute inset-x-0 top-0 h-[20vh]" />
        <div className="hud-vignette absolute inset-0" />
      </div>
      <Bracket corner="tl" />
      <Bracket corner="tr" />
      <Bracket corner="bl" />
      <Bracket corner="br" />
      {children}
    </div>
  );
}
