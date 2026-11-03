import { cn } from "@/lib/utils/cn";

/** Orbit rings around a glowing core with a tilted state vector. Inherits its colour. */
export function QubitMotif({ className }: { className?: string }) {
  const origin = { transformOrigin: "50px 50px" } as const;
  return (
    <svg viewBox="0 0 100 100" className={cn("text-cyan", className)} aria-hidden>
      <defs>
        <radialGradient id="qm-core">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="currentColor" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1" />
      <g className="animate-orbit" style={origin}>
        <ellipse cx="50" cy="50" rx="44" ry="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeOpacity="0.85" />
      </g>
      <g className="animate-orbit-rev" style={origin}>
        <ellipse cx="50" cy="50" rx="44" ry="15" transform="rotate(60 50 50)" fill="none" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.55" />
      </g>
      <g className="animate-orbit" style={{ ...origin, animationDuration: "8s" }}>
        <ellipse cx="50" cy="50" rx="44" ry="15" transform="rotate(-60 50 50)" fill="none" stroke="var(--color-violet)" strokeWidth="1.2" strokeOpacity="0.7" />
      </g>
      <line x1="50" y1="50" x2="71" y2="31" stroke="var(--color-violet)" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="71" cy="31" r="3.6" fill="var(--color-violet)" />
      <circle cx="50" cy="50" r="9" fill="url(#qm-core)" />
    </svg>
  );
}
