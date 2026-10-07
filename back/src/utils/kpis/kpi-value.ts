export type KpiValue = {
  value: number | null;
  numerator: number | null;
  denominator: number;
};

const PERCENT = 100;

const NO_DATA: KpiValue = { value: null, numerator: null, denominator: 0 };

export const ratio = (
  numerator: number,
  denominator: number,
  scale = 1,
): KpiValue =>
  denominator === 0
    ? NO_DATA
    : { value: (numerator / denominator) * scale, numerator, denominator };

export const percentage = (numerator: number, denominator: number): KpiValue =>
  ratio(numerator, denominator, PERCENT);

export const median = (sample: number[]): KpiValue => {
  if (sample.length === 0) {
    return NO_DATA;
  }

  const sorted = [...sample].sort((first, second) => first - second);
  const middle = Math.floor(sorted.length / 2);
  const value =
    sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];

  return { value, numerator: null, denominator: sorted.length };
};
