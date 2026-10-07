import { ApiError } from '@/lib/api';

const FORBIDDEN = 403;
const SUSPENSION_PREFIX = 'You are suspended until ';
const DAY_MONTH = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  timeZone: 'America/Argentina/Buenos_Aires',
});

export function suspensionMessage(until: string | null | undefined): string | null {
  if (!until || new Date(until).getTime() <= Date.now()) return null;
  return formatSuspension(until);
}

function formatSuspension(until: string): string | null {
  const date = new Date(until);
  if (Number.isNaN(date.getTime())) return null;
  const dayMonth = DAY_MONTH.formatToParts(date)
    .filter(({ type }) => type === 'day' || type === 'month')
    .map(({ value }) => value.padStart(2, '0'))
    .join('/');
  return `Estás suspendido hasta el ${dayMonth} por faltas`;
}

export function suspensionErrorMessage(error: unknown): string | null {
  if (!(error instanceof ApiError) || error.status !== FORBIDDEN) return null;
  return error.message.startsWith(SUSPENSION_PREFIX)
    ? formatSuspension(error.message.slice(SUSPENSION_PREFIX.length))
    : null;
}
