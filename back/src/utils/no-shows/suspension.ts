import { MS_PER_DAY } from '../time/milliseconds';

const WINDOW_DAYS = 90;
const THRESHOLD = 3;
const FIRST_DAYS = 7;
const REPEAT_MONTHS = 6;
const REPEAT_WINDOW_MONTHS = 12;

const WINDOW_MS = WINDOW_DAYS * MS_PER_DAY;

const addDays = (date: Date, days: number): Date =>
  new Date(date.getTime() + days * MS_PER_DAY);

const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);

  return result;
};

const isWithinWindow = (date: Date, reference: Date): boolean =>
  reference.getTime() - date.getTime() < WINDOW_MS;

const pastInOrder = (dates: Date[], now: Date): Date[] =>
  dates
    .filter((date) => date <= now)
    .sort((first, second) => first.getTime() - second.getTime());

export const suspendedUntil = (
  noShowDates: Date[],
  now = new Date(),
): Date | null => {
  let pending: Date[] = [];
  let lastSuspensionStart: Date | null = null;
  let until: Date | null = null;

  for (const date of pastInOrder(noShowDates, now)) {
    pending = [
      ...pending.filter((pastDate) => isWithinWindow(pastDate, date)),
      date,
    ];

    if (pending.length < THRESHOLD) {
      continue;
    }

    const isRepeat =
      lastSuspensionStart !== null &&
      date < addMonths(lastSuspensionStart, REPEAT_WINDOW_MONTHS);

    until = isRepeat
      ? addMonths(date, REPEAT_MONTHS)
      : addDays(date, FIRST_DAYS);
    lastSuspensionStart = date;
    pending = [];
  }

  return until !== null && until > now ? until : null;
};

export const recentNoShowCount = (
  noShowDates: Date[],
  now = new Date(),
): number =>
  pastInOrder(noShowDates, now).filter((date) => isWithinWindow(date, now))
    .length;
