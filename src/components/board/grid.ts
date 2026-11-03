/** One grid definition shared by the column header, the skeleton and every row. */
export const ROW_GRID =
  "lg:grid lg:grid-cols-[4rem_5.5rem_minmax(0,1fr)_repeat(5,8.5rem)_11rem] lg:items-center lg:gap-x-[1vw] lg:px-[1.2vw]";

export type Tone = "gold" | "silver" | "bronze" | "cyan";

export function toneFor(rank: number): Tone {
  if (rank === 1) return "gold";
  if (rank === 2) return "silver";
  if (rank === 3) return "bronze";
  return "cyan";
}
