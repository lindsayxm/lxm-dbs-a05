import type { ReactNode } from "react";

export type GlyphProps = { className?: string };

/** Shared frame: 64×64, 2.5px round strokes in currentColor (the rank ring colour). */
function Glyph({ className, children }: GlyphProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

const accent = "var(--color-violet)";
const gold = "var(--color-gold)";
const dark = "var(--color-surface)";

/** Bloch sphere with a tilted state vector. */
export function Qubit({ className }: GlyphProps) {
  return (
    <Glyph className={className}>
      <circle cx="32" cy="32" r="20" />
      <ellipse cx="32" cy="32" rx="20" ry="7" strokeOpacity="0.6" />
      <line x1="32" y1="12" x2="32" y2="52" strokeOpacity="0.35" />
      <line x1="32" y1="32" x2="45" y2="17" stroke={accent} strokeWidth="3" />
      <circle cx="45" cy="17" r="3.2" fill={accent} stroke="none" />
    </Glyph>
  );
}

/** Schrödinger's cat: half of it is only probably there. */
export function Cat({ className }: GlyphProps) {
  return (
    <Glyph className={className}>
      <circle cx="32" cy="37" r="16" />
      <path d="M21 25 L17 9 L29 21" />
      <path d="M43 25 L47 9 L35 21" strokeDasharray="3 3" />
      <circle cx="26" cy="37" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="38" cy="37" r="2.2" strokeDasharray="2 2" />
      <path d="M32 42 l-2.2 -2.6 h4.4 z" fill="currentColor" stroke="none" />
      <line x1="12" y1="41" x2="23" y2="42.5" />
      <line x1="12" y1="47" x2="23" y2="45" />
      <line x1="52" y1="41" x2="41" y2="42.5" strokeDasharray="3 3" />
      <line x1="52" y1="47" x2="41" y2="45" strokeDasharray="3 3" />
    </Glyph>
  );
}

/** Processor die with gold pads. */
export function Chip({ className }: GlyphProps) {
  return (
    <Glyph className={className}>
      <rect x="18" y="18" width="28" height="28" rx="3" />
      <rect x="25" y="25" width="14" height="14" rx="1.5" strokeOpacity="0.6" />
      {[24, 32, 40].map((v) => (
        <g key={v}>
          <line x1={v} y1="11" x2={v} y2="18" />
          <line x1={v} y1="46" x2={v} y2="53" />
          <line x1="11" y1={v} x2="18" y2={v} />
          <line x1="46" y1={v} x2="53" y2={v} />
        </g>
      ))}
      <circle cx="32" cy="32" r="2.6" fill={gold} stroke="none" />
    </Glyph>
  );
}

/** Nucleus with three orbits. */
export function Atom({ className }: GlyphProps) {
  return (
    <Glyph className={className}>
      <circle cx="32" cy="32" r="4" fill="currentColor" stroke="none" />
      <ellipse cx="32" cy="32" rx="22" ry="8" />
      <ellipse cx="32" cy="32" rx="22" ry="8" transform="rotate(60 32 32)" strokeOpacity="0.75" />
      <ellipse cx="32" cy="32" rx="22" ry="8" transform="rotate(-60 32 32)" stroke={accent} strokeOpacity="0.9" />
    </Glyph>
  );
}

/** A wave packet. */
export function Wave({ className }: GlyphProps) {
  return (
    <Glyph className={className}>
      <line x1="8" y1="32" x2="56" y2="32" strokeOpacity="0.3" />
      <path d="M8 32 C 11 32, 13 27, 16 27 S 21 38, 24 38 S 29 14, 32 14 S 37 50, 40 50 S 45 26, 48 26 S 53 32, 56 32" />
    </Glyph>
  );
}

/** Two linked rings. */
export function Entangle({ className }: GlyphProps) {
  return (
    <Glyph className={className}>
      <circle cx="24" cy="32" r="13" />
      <circle cx="40" cy="32" r="13" stroke={accent} />
      <circle cx="32" cy="32" r="2" fill="currentColor" stroke="none" />
    </Glyph>
  );
}

/** A die whose pips are only probably where you think. */
export function Dice({ className }: GlyphProps) {
  return (
    <Glyph className={className}>
      <rect x="14" y="14" width="36" height="36" rx="6" />
      <circle cx="32" cy="32" r="3" fill="currentColor" stroke="none" />
      <circle cx="23" cy="23" r="3" fill="currentColor" stroke="none" />
      <circle cx="41" cy="41" r="3" fill="currentColor" stroke="none" />
      <circle cx="41" cy="23" r="3" strokeDasharray="2 2" />
      <circle cx="23" cy="41" r="3" strokeDasharray="2 2" />
    </Glyph>
  );
}

/** A stack of casino chips with a circuit trace on top. */
export function Chips({ className }: GlyphProps) {
  return (
    <Glyph className={className}>
      <ellipse cx="32" cy="44" rx="18" ry="6" fill={dark} />
      <ellipse cx="32" cy="36" rx="18" ry="6" fill={dark} />
      <ellipse cx="32" cy="28" rx="18" ry="6" fill={dark} />
      <ellipse cx="32" cy="20" rx="18" ry="6" fill={dark} stroke={gold} />
      <line x1="24" y1="20" x2="40" y2="20" stroke={gold} strokeOpacity="0.8" />
      <circle cx="24" cy="20" r="1.6" fill={gold} stroke="none" />
      <circle cx="40" cy="20" r="1.6" fill={gold} stroke="none" />
    </Glyph>
  );
}

/** A spade drawn by a particle trail. */
export function Spade({ className }: GlyphProps) {
  return (
    <Glyph className={className}>
      <path d="M32 12 C 32 12 14 28 14 38 C 14 44 19 48 24 47 C 27.5 46 30 44 31 41 C 30 46 28 50 25 52 L 39 52 C 36 50 34 46 33 41 C 34 44 36.5 46 40 47 C 45 48 50 44 50 38 C 50 28 32 12 32 12 Z" />
      <circle cx="46" cy="14" r="1.4" fill={accent} stroke="none" />
      <circle cx="51" cy="19" r="1.9" fill={accent} stroke="none" />
      <circle cx="54" cy="26" r="2.4" fill={accent} stroke="none" />
    </Glyph>
  );
}

/** A hexagonal ion trap. */
export function Lattice({ className }: GlyphProps) {
  const pts: Array<[number, number]> = [
    [32, 11],
    [50, 21.5],
    [50, 42.5],
    [32, 53],
    [14, 42.5],
    [14, 21.5],
  ];
  return (
    <Glyph className={className}>
      <polygon points={pts.map((p) => p.join(",")).join(" ")} />
      {pts.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <line x1="32" y1="32" x2={x} y2={y} strokeOpacity="0.3" />
          <circle cx={x} cy={y} r="2.6" fill="currentColor" stroke="none" />
        </g>
      ))}
      <circle cx="32" cy="32" r="3.2" fill={accent} stroke="none" />
    </Glyph>
  );
}

/** A p-orbital: two lobes about a nucleus. */
export function Orbital({ className }: GlyphProps) {
  return (
    <Glyph className={className}>
      <path d="M32 32 C 20 26, 18 8, 32 10 C 46 8, 44 26, 32 32 Z" />
      <path d="M32 32 C 20 38, 18 56, 32 54 C 46 56, 44 38, 32 32 Z" stroke={accent} />
      <circle cx="32" cy="32" r="2.6" fill="currentColor" stroke="none" />
    </Glyph>
  );
}

/** A particle passing through a barrier. */
export function Tunnel({ className }: GlyphProps) {
  return (
    <Glyph className={className}>
      <rect x="28" y="14" width="8" height="36" rx="1.5" fill="currentColor" fillOpacity="0.22" />
      <line x1="6" y1="32" x2="12" y2="32" strokeDasharray="2 3" strokeOpacity="0.7" />
      <circle cx="17" cy="32" r="4" fill="currentColor" stroke="none" />
      <line x1="40" y1="32" x2="44" y2="32" strokeOpacity="0.7" />
      <circle cx="49" cy="32" r="4" stroke={accent} strokeDasharray="2.5 2.5" />
    </Glyph>
  );
}

/** Unknown avatar id. */
export function Fallback({ className }: GlyphProps) {
  return (
    <Glyph className={className}>
      <polygon points="32,11 50,21.5 50,42.5 32,53 14,42.5 14,21.5" strokeOpacity="0.7" />
      <text x="32" y="39" textAnchor="middle" fontSize="20" fontWeight="700" fontFamily="var(--font-display)" fill="currentColor" stroke="none">
        ?
      </text>
    </Glyph>
  );
}
