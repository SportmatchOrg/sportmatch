import { MS_PER_DAY } from '../time/milliseconds';

export const BLOCK_DURATIONS = ['DAYS_7', 'DAYS_30', 'PERMANENT'] as const;

export type BlockDuration = (typeof BLOCK_DURATIONS)[number];

export type AccountBlock = {
  blockedAt: Date | null;
  blockedUntil: Date | null;
};

const BLOCK_DAYS: Record<Exclude<BlockDuration, 'PERMANENT'>, number> = {
  DAYS_7: 7,
  DAYS_30: 30,
};

export const blockFor = (
  duration: BlockDuration,
  now = new Date(),
): AccountBlock => ({
  blockedAt: now,
  blockedUntil:
    duration === 'PERMANENT'
      ? null
      : new Date(now.getTime() + BLOCK_DAYS[duration] * MS_PER_DAY),
});

export const isBlocked = (
  { blockedAt, blockedUntil }: AccountBlock,
  now = new Date(),
): boolean =>
  blockedAt !== null && (blockedUntil === null || blockedUntil > now);
