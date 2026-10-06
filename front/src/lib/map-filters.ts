import type { Level, MatchesQuery } from '@/types/match';

export type DayFilter = 'TODAY' | 'TONIGHT' | 'TOMORROW' | 'WEEKEND';

export type NearbyOrigin = { latitude: number; longitude: number };

export type MapFilters = {
  day: DayFilter | null;
  levels: Level[];
  nearby: NearbyOrigin | null;
};

export const DAY_FILTERS: DayFilter[] = ['TODAY', 'TONIGHT', 'TOMORROW', 'WEEKEND'];

export const DAY_FILTER_LABEL: Record<DayFilter, string> = {
  TODAY: 'Hoy',
  TONIGHT: 'Esta noche',
  TOMORROW: 'Mañana',
  WEEKEND: 'Fin de semana',
};

export const EMPTY_MAP_FILTERS: MapFilters = { day: null, levels: [], nearby: null };

export const NEARBY_RADIUS_KM = 5;

const ARGENTINA_TIME_ZONE = 'America/Argentina/Buenos_Aires';

// Argentina has no daylight saving time, so its offset never changes.
const ARGENTINA_UTC_OFFSET = '-03:00';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const NIGHT_START = '19:00:00';
const DAY_START = '00:00:00';
const DAY_END = '23:59:59';

const SATURDAY = 6;
const SUNDAY = 0;

const argentinaDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: ARGENTINA_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

type Range = { from: Date; to: Date };

function argentinaToday(now: Date): Date {
  return new Date(`${argentinaDate.format(now)}T00:00:00Z`);
}

function addDays(day: Date, days: number): Date {
  return new Date(day.getTime() + days * MS_PER_DAY);
}

function at(day: Date, time: string): Date {
  return new Date(`${day.toISOString().slice(0, 10)}T${time}${ARGENTINA_UTC_OFFSET}`);
}

function wholeDays(first: Date, last: Date): Range {
  return { from: at(first, DAY_START), to: at(last, DAY_END) };
}

function dayRange(day: DayFilter, now: Date): Range {
  const today = argentinaToday(now);

  switch (day) {
    case 'TODAY':
      return { from: now, to: at(today, DAY_END) };
    case 'TONIGHT': {
      const nightStart = at(today, NIGHT_START);
      return { from: nightStart > now ? nightStart : now, to: at(today, DAY_END) };
    }
    case 'TOMORROW': {
      const tomorrow = addDays(today, 1);
      return wholeDays(tomorrow, tomorrow);
    }
    case 'WEEKEND': {
      const weekday = today.getUTCDay();
      const saturday = addDays(today, weekday === SUNDAY ? -1 : SATURDAY - weekday);
      return wholeDays(saturday, addDays(saturday, 1));
    }
  }
}

export function hasActiveFilters(filters: MapFilters): boolean {
  return filters.day !== null || filters.levels.length > 0 || filters.nearby !== null;
}

export function toMatchesQuery(filters: MapFilters, now = new Date()): MatchesQuery {
  const query: MatchesQuery = {};

  if (filters.day) {
    const { from, to } = dayRange(filters.day, now);
    query.from = from.toISOString();
    query.to = to.toISOString();
  }

  if (filters.levels.length > 0) query.level = filters.levels;

  if (filters.nearby) {
    query.lat = filters.nearby.latitude;
    query.lng = filters.nearby.longitude;
    query.radiusKm = NEARBY_RADIUS_KM;
  }

  return query;
}
