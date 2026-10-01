import { MS_PER_HOUR } from '../time/milliseconds';

const HOURS = 2;

export const LATE_WITHDRAWAL_MS = HOURS * MS_PER_HOUR;

export const isLateWithdrawal = (
  matchDate: Date,
  at: number = Date.now(),
): boolean => matchDate.getTime() - at < LATE_WITHDRAWAL_MS;
