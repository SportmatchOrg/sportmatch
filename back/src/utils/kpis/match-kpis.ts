import { confirmedNoShows } from '../ratings/confirmed-no-shows';
import { MS_PER_HOUR } from '../time/milliseconds';
import { median, percentage, ratio, type KpiValue } from './kpi-value';

export type KpiMatch = {
  id: string;
  status: 'ACTIVE' | 'CANCELED';
  date: Date;
  createdAt: Date;
  filledAt: Date | null;
  capacity: number;
  organizerId: string;
  participants: { userId: string }[];
  lateWithdrawals: { userId: string }[];
  noShowReports: {
    reporterId: string;
    reportedUserId: string;
    createdAt: Date;
  }[];
};

const isActive = (match: KpiMatch): boolean => match.status === 'ACTIVE';

const roster = (match: KpiMatch): string[] => [
  match.organizerId,
  ...match.participants.map(({ userId }) => userId),
];

const attendees = (match: KpiMatch): string[] => {
  const noShows = confirmedNoShows(match.noShowReports, match.organizerId);

  return roster(match).filter((userId) => !noShows.has(userId));
};

const sum = (values: number[]): number =>
  values.reduce((total, value) => total + value, 0);

export const teamCompletionRate = (cohort: KpiMatch[]): KpiValue => {
  const active = cohort.filter(isActive);
  const full = active.filter((match) => roster(match).length >= match.capacity);

  return percentage(full.length, active.length);
};

export const timeToFull = (cohort: KpiMatch[]): KpiValue =>
  median(
    cohort
      .filter(isActive)
      .flatMap(({ filledAt, createdAt }) =>
        filledAt
          ? [(filledAt.getTime() - createdAt.getTime()) / MS_PER_HOUR]
          : [],
      ),
  );

export const noShowRate = (closedMatches: KpiMatch[]): KpiValue => {
  const active = closedMatches.filter(isActive);
  const players = sum(active.map((match) => roster(match).length));
  const present = sum(active.map((match) => attendees(match).length));

  return percentage(players - present, players);
};

export const matchesPerActiveUser = (
  cohort: KpiMatch[],
  now: Date,
): KpiValue => {
  const attendances = cohort
    .filter((match) => isActive(match) && match.date <= now)
    .flatMap(attendees);

  return ratio(attendances.length, new Set(attendances).size);
};

export const matchCancellationRate = (cohort: KpiMatch[]): KpiValue =>
  percentage(cohort.filter((match) => !isActive(match)).length, cohort.length);

export const lateWithdrawalRate = (cohort: KpiMatch[]): KpiValue => {
  const active = cohort.filter(isActive);
  const pair = (matchId: string, userId: string) => `${matchId}:${userId}`;

  const withdrawn = new Set(
    active.flatMap((match) =>
      match.lateWithdrawals.map(({ userId }) => pair(match.id, userId)),
    ),
  );
  const everyone = new Set([
    ...withdrawn,
    ...active.flatMap((match) =>
      match.participants.map(({ userId }) => pair(match.id, userId)),
    ),
  ]);

  return percentage(withdrawn.size, everyone.size);
};
