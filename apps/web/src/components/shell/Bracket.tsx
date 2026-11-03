import { cn } from "@/lib/utils/cn";

const corners = {
  tl: "top-[1.2vh] left-[1vw] border-t border-l",
  tr: "top-[1.2vh] right-[1vw] border-t border-r",
  bl: "bottom-[1.2vh] left-[1vw] border-b border-l",
  br: "bottom-[1.2vh] right-[1vw] border-b border-r",
} as const;

/** One HUD corner bracket. Four of them frame the wall. */
export function Bracket({ corner }: { corner: keyof typeof corners }) {
  return (
    <span
      aria-hidden
      className={cn("pointer-events-none fixed z-20 h-[4vh] w-[4vh] border-cyan/60 max-lg:hidden", corners[corner])}
    />
  );
}
