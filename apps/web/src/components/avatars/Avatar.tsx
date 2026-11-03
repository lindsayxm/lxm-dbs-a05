import type { ComponentType } from "react";
import type { Tone } from "@/components/board/grid";
import type { AvatarId } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import * as glyphs from "./glyphs";

type GlyphComponent = ComponentType<glyphs.GlyphProps>;

const AVATARS: Record<AvatarId, GlyphComponent> = {
  qubit: glyphs.Qubit,
  cat: glyphs.Cat,
  chip: glyphs.Chip,
  atom: glyphs.Atom,
  wave: glyphs.Wave,
  entangle: glyphs.Entangle,
  dice: glyphs.Dice,
  chips: glyphs.Chips,
  spade: glyphs.Spade,
  lattice: glyphs.Lattice,
  orbital: glyphs.Orbital,
  tunnel: glyphs.Tunnel,
};

type Props = { id: string; tone?: Tone; className?: string };

/** A preset avatar in a ring coloured by rank. Unknown ids get the fallback glyph. */
export function Avatar({ id, tone = "cyan", className }: Props) {
  const Glyph = (AVATARS as Record<string, GlyphComponent | undefined>)[id] ?? glyphs.Fallback;
  return (
    <div data-tone={tone} className={cn("avatar-ring grid shrink-0 place-items-center rounded-full", className)} aria-hidden>
      <Glyph className="h-[74%] w-[74%]" />
    </div>
  );
}
