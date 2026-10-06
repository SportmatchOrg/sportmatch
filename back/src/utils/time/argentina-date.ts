const ARGENTINA_TIME_ZONE = 'America/Argentina/Buenos_Aires';

const argentinaDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: ARGENTINA_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const toArgentinaDate = (date: Date): string =>
  argentinaDate.format(date);
