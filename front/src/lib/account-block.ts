export type BlockDuration = 'DAYS_7' | 'DAYS_30' | 'PERMANENT';

const BLOCK_DAYS: Record<BlockDuration, number | null> = {
  DAYS_7: 7,
  DAYS_30: 30,
  PERMANENT: null,
};

export const BLOCK_DURATIONS = Object.keys(BLOCK_DAYS) as BlockDuration[];

export const BLOCK_DURATION_LABEL: Record<BlockDuration, string> = {
  DAYS_7: '7 días',
  DAYS_30: '30 días',
  PERMANENT: 'Permanente',
};

const MS_PER_DAY = 86_400_000;

const BLOCKED_MESSAGE = 'Tu cuenta está bloqueada';

const NOTICE_KEY = 'account-blocked-notice';

function formatDayMonth(date: Date): string {
  return [date.getDate(), date.getMonth() + 1]
    .map((part) => String(part).padStart(2, '0'))
    .join('/');
}

export function blockEndDate(duration: BlockDuration): Date | null {
  const days = BLOCK_DAYS[duration];

  return days === null ? null : new Date(Date.now() + days * MS_PER_DAY);
}

export function formatBlockEnd(until: Date): string {
  return `hasta el ${formatDayMonth(until)}`;
}

export function accountBlockedMessage(until: string | null): string {
  return until ? `${BLOCKED_MESSAGE} ${formatBlockEnd(new Date(until))}` : BLOCKED_MESSAGE;
}

export function saveAccountBlockedNotice(message: string): void {
  try {
    window.sessionStorage.setItem(NOTICE_KEY, message);
  } catch {
    return;
  }
}

export function readAccountBlockedNotice(): string | null {
  try {
    return window.sessionStorage.getItem(NOTICE_KEY);
  } catch {
    return null;
  }
}

export function clearAccountBlockedNotice(): void {
  try {
    window.sessionStorage.removeItem(NOTICE_KEY);
  } catch {
    return;
  }
}
