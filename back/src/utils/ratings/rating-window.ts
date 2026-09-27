const HOURS = 48;
const MS_PER_HOUR = 60 * 60 * 1000;

export const RATING_WINDOW_MS = HOURS * MS_PER_HOUR;

export const isRatingWindowOpen = (
  date: Date,
  now: number = Date.now(),
): boolean => now <= date.getTime() + RATING_WINDOW_MS;
