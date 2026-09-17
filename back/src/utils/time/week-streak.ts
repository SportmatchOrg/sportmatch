const ARGENTINA_TIME_ZONE = 'America/Argentina/Buenos_Aires';
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const EPOCH_TO_MONDAY_OFFSET_DAYS = 3;

const argentinaDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: ARGENTINA_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const toWeekIndex = (date: Date): number => {
  const [year, month, day] = argentinaDate.format(date).split('-').map(Number);
  const daysSinceEpoch = Date.UTC(year, month - 1, day) / MS_PER_DAY;

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
