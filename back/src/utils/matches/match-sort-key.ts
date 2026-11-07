export type MatchSortKey = readonly (number | string)[];

type MatchSortKeyInput = {
  isPreferredSport: boolean;
  isPreferredLevel: boolean;
  band: number | null;
  score: number;
  date: Date;
  id: string;
};

const BASE_KEY_LENGTH = 5;

const rankOf = (isPreferred: boolean): number => (isPreferred ? 0 : 1);

export const buildMatchSortKey = ({
  isPreferredSport,
  isPreferredLevel,
  band,
  score,
  date,
  id,
}: MatchSortKeyInput): MatchSortKey => [
  rankOf(isPreferredSport),
  rankOf(isPreferredLevel),
  ...(band === null ? [] : [band]),
  -score,
  date.getTime(),
  id,
];

export const compareMatchSortKeys = (
  a: MatchSortKey,
  b: MatchSortKey,
): number => {
  for (const [index, value] of a.entries()) {
    if (value !== b[index]) {
      return value < b[index] ? -1 : 1;
    }
  }

  return 0;
};

export const isMatchSortKey = (
  value: unknown,
  withDistance: boolean,
): value is MatchSortKey => {
  const length = BASE_KEY_LENGTH + Number(withDistance);

  if (!Array.isArray(value) || value.length !== length) {
    return false;
  }

  const numbers: unknown[] = value.slice(0, -1);

  return (
    typeof value[length - 1] === 'string' &&
    numbers.every((item) => Number.isFinite(item))
  );
};

export const takeMatchPage = <T extends { key: MatchSortKey }>(
  ranked: T[],
  after: MatchSortKey | null,
  limit: number | undefined,
): { page: T[]; lastKey: MatchSortKey | null } => {
  const remaining = after
    ? ranked.filter(({ key }) => compareMatchSortKeys(key, after) > 0)
    : ranked;

  if (limit === undefined || remaining.length <= limit) {
    return { page: remaining, lastKey: null };
  }

  const page = remaining.slice(0, limit);

  return { page, lastKey: page[page.length - 1].key };
};
