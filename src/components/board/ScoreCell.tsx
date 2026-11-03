"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect } from "react";
import { formatScore } from "@/lib/format";
import { cn } from "@/lib/utils/cn";

type Props = {
  value: number | null;
  /** Shown on handheld layouts only, where the column header is gone. */
  label?: string;
  emphasis?: boolean;
};

/** A score that counts up to each new value. The motion value remembers what was last shown. */
export function ScoreCell({ value, label, emphasis = false }: Props) {
  const reduced = useReducedMotion();
  const mv = useMotionValue(value ?? 0);
  const text = useTransform(mv, (v) => formatScore(Math.round(v)));

  useEffect(() => {
    if (value === null) return;
    if (reduced) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration: 0.6, ease: "easeOut" });
    return () => controls.stop();
  }, [value, reduced, mv]);

  return (
    <div className="flex items-baseline justify-end gap-1 max-lg:flex-col max-lg:items-center max-lg:gap-0">
      {label ? <span className="hidden font-label text-[0.6rem] font-semibold tracking-[0.2em] text-dim uppercase max-lg:block">{label}</span> : null}
      {value === null ? (
        <span className={cn("font-num tabular-nums text-faint", emphasis ? "text-[3.2vh] max-lg:text-lg" : "text-[2.2vh] max-lg:text-sm")}>—</span>
      ) : (
        <motion.span
          className={cn(
            "font-num tabular-nums",
            emphasis ? "text-[3.2vh] font-bold text-text text-glow max-lg:text-lg" : "text-[2.2vh] text-text/90 max-lg:text-sm",
          )}
        >
          {text}
        </motion.span>
      )}
    </div>
  );
}
