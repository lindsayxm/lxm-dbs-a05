/** Deterministic 32-bit PRNG (mulberry32). Same seed, same sequence, in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Mixes any number of integers into one well-distributed unsigned 32-bit hash. Order matters. */
export function hash32(...ints: number[]): number {
  let h = 0x9e3779b9 >>> 0;
  for (let k = 0; k < ints.length; k++) {
    const v = (ints[k] + Math.imul(k + 1, 0x7f4a7c15)) >>> 0;
    h = (h ^ Math.imul(v, 0x85ebca6b)) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
    h ^= h >>> 16;
  }
  // final avalanche
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

/** Maps a 32-bit hash to [0, 1). */
export function unit(hash: number): number {
  return (hash >>> 0) / 4294967296;
}
