/** The five casino games, in the order they appear as board columns. */
export const GAMES = [
  { id: "uncertainty", name: "Uncertainty", short: "UNC" },
  { id: "plinko", name: "Plinko", short: "PLK" },
  { id: "seventeen", name: "17", short: "17" },
  { id: "quantem", name: "Quant'em", short: "QTM" },
  { id: "quabble", name: "Quabble", short: "QBL" },
] as const;

export type Game = (typeof GAMES)[number];
export type GameId = Game["id"];

export const GAME_IDS: readonly GameId[] = GAMES.map((g) => g.id);
