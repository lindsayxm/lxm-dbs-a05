import { AVATAR_IDS, type Player } from "@/lib/types";

const JOINED_AT = "2026-10-29T00:00:00.000Z";

const USERNAMES = [
  "SchrodingerNancy",
  "QubitBryce",
  "HeisenbergDavid",
  "EntangledRahaf",
  "DecoherenceDon",
  "SpinUpJaz",
  "BlochRahaf",
  "TunnelingTony",
  "SuperpositionLindsay",
  "WaveFunctionAustin",
  "PauliJackpot",
  "HadamardHarry",
  "PlanckGabrielle",
  "BraKetBrian",
  "FermiSunanda",
  "CollapseCasey",
] as const;

/** Sixteen guests, so the top-10 cut is visible and churns. */
export const MOCK_PLAYERS: readonly Player[] = USERNAMES.map((username, index) => ({
  id: `p${String(index + 1).padStart(2, "0")}`,
  username,
  avatarId: AVATAR_IDS[index % AVATAR_IDS.length],
  joinedAt: JOINED_AT,
}));
