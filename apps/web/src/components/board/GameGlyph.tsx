import type { GameId } from "@/lib/games";

type Props = { id: GameId; className?: string };

/** A small icon per game, used in the column header and the footer legend. */
export function GameGlyph({ id, className }: Props) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
  switch (id) {
    case "uncertainty":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" strokeDasharray="2.6 2.6" />
          <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.35" />
        </svg>
      );
    case "plinko":
      return (
        <svg {...common}>
          {[
            [12, 5],
            [8, 11],
            [16, 11],
            [4, 17],
            [12, 17],
            [20, 17],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.7" fill="currentColor" stroke="none" />
          ))}
        </svg>
      );
    case "seventeen":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="4" />
          <text x="12" y="16.2" textAnchor="middle" fontSize="10" fontWeight="700" fontFamily="var(--font-display)" fill="currentColor" stroke="none">
            17
          </text>
        </svg>
      );
    case "quantem":
      return (
        <svg {...common}>
          <circle cx="9" cy="12" r="6" />
          <circle cx="15" cy="12" r="6" />
        </svg>
      );
    case "quabble":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="7" height="7" rx="1.5" />
          <rect x="13" y="4" width="7" height="7" rx="1.5" />
          <rect x="4" y="13" width="7" height="7" rx="1.5" />
          <rect x="13" y="13" width="7" height="7" rx="1.5" fill="currentColor" fillOpacity="0.5" />
        </svg>
      );
  }
}
