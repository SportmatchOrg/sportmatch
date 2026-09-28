const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;

const SHORT = new Intl.RelativeTimeFormat('es-AR', { numeric: 'auto', style: 'short' });
const LONG = new Intl.RelativeTimeFormat('es-AR', { numeric: 'auto' });
const DAY_MONTH = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' });

export function formatRelativeTime(value: string, now: number = Date.now()): string {
  const elapsed = now - new Date(value).getTime();

  if (elapsed < MINUTE_MS) return SHORT.format(0, 'second');
  if (elapsed < HOUR_MS) return SHORT.format(-Math.floor(elapsed / MINUTE_MS), 'minute');
  if (elapsed < DAY_MS) return SHORT.format(-Math.floor(elapsed / HOUR_MS), 'hour');
  if (elapsed < WEEK_MS) return LONG.format(-Math.floor(elapsed / DAY_MS), 'day');

  return DAY_MONTH.format(new Date(value));
}
