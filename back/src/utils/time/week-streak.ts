const ARGENTINA_UTC_OFFSET_MS = 3 * 60 * 60 * 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const EPOCH_TO_MONDAY_OFFSET_DAYS = 3;

const toWeekIndex = (date: Date): number => {
  const argentinaTime = date.getTime() - ARGENTINA_UTC_OFFSET_MS;
  const daysSinceEpoch = Math.floor(argentinaTime / MS_PER_DAY);

  return Math.floor((daysSinceEpoch + EPOCH_TO_MONDAY_OFFSET_DAYS) / 7);
};

export const weekStreak = (playedDates: Date[], now = new Date()): number => {
  const playedWeeks = new Set(playedDates.map(toWeekIndex));

  if (playedWeeks.size === 0) {
    return 0;
  }

  const currentWeek = toWeekIndex(now);
  let week = playedWeeks.has(currentWeek) ? currentWeek : currentWeek - 1;
  let streak = 0;

  while (playedWeeks.has(week)) {
    streak++;
    week--;
  }

  return streak;
};
