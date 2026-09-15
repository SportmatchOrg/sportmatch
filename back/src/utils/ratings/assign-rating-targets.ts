export const RATINGS_PER_PLAYER = 3;

const hashString = (value: string): number => {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

const createRandom = (seed: number): (() => number) => {
  let state = seed | 0;

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const seededShuffle = (items: string[], seed: string): string[] => {
  const random = createRandom(hashString(seed));
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index--) {
    const target = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }

  return shuffled;
};

export const assignRatingTargets = (
  matchId: string,
  playerIds: string[],
  raterId: string,
): string[] => {
  const ordered = seededShuffle([...new Set(playerIds)].sort(), matchId);
  const position = ordered.indexOf(raterId);

  if (position === -1) {
    return [];
  }

  const count = Math.min(RATINGS_PER_PLAYER, ordered.length - 1);

  return Array.from(
    { length: count },
    (_, step) => ordered[(position + step + 1) % ordered.length],
  );
};
