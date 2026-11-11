import { MS_PER_DAY } from './milliseconds';

const ARGENTINA_TIME_ZONE = 'America/Argentina/Buenos_Aires';

const ARGENTINA_UTC_OFFSET = '-03:00';

const argentinaDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: ARGENTINA_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const toArgentinaDate = (date: Date): string =>
  argentinaDate.format(date);

const argentinaDateTime = new Intl.DateTimeFormat('es-AR', {
  timeZone: ARGENTINA_TIME_ZONE,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

export const formatArgentinaDateTime = (date: Date): string =>
  argentinaDateTime.format(date);

const TIME_ZONE_SUFFIX = /(Z|[+-]\d{2}:?\d{2})$/i;

export const parseArgentinaDateTime = (value: string): Date | null => {
  const date = new Date(
    TIME_ZONE_SUFFIX.test(value) ? value : `${value}${ARGENTINA_UTC_OFFSET}`,
  );

  return Number.isNaN(date.getTime()) ? null : date;
};

export const toDayIndex = (day: string): number =>
  new Date(`${day}T00:00:00Z`).getTime() / MS_PER_DAY;

export const fromDayIndex = (dayIndex: number): string =>
  new Date(dayIndex * MS_PER_DAY).toISOString().slice(0, 10);

export const addDays = (day: string, days: number): string =>
  fromDayIndex(toDayIndex(day) + days);

export const startOfArgentinaDay = (day: string): Date =>
  new Date(`${day}T00:00:00${ARGENTINA_UTC_OFFSET}`);
