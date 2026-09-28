import { MS_PER_HOUR } from '../time/milliseconds';

const HOURS = 48;

export const RATING_WINDOW_MS = HOURS * MS_PER_HOUR;

export const isRatingWindowOpen = (
  date: Date,
  now: number = Date.now(),
): boolean => now <= date.getTime() + RATING_WINDOW_MS;
