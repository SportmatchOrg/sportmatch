import type { Prisma } from '../../src/generated/prisma/client';
import { isFull } from '../../src/utils/matches/player-count';
import { inDays } from '../../src/utils/time/in-days';
import { MS_PER_DAY, MS_PER_HOUR } from '../../src/utils/time/milliseconds';
import {
  DEMO_ID_PREFIX,
  DEMO_LATE_WITHDRAWALS,
  DEMO_MATCHES,
  DEMO_NO_SHOWS,
  DEMO_NOTIFICATIONS,
  DEMO_RATINGS,
  DEMO_USERS,
  type DemoMatch,
  type PlayerKey,
  type SportName,
} from './catalog';

const UPCOMING_CREATED_DAYS_AGO = 3;
const PLAYED_CREATED_DAYS_BEFORE = 7;
const EVENT_HOURS_AFTER_MATCH = 2;
const NO_SHOW_HOURS_AFTER_MATCH = 1;
const LATE_WITHDRAWAL_HOURS_BEFORE_MATCH = 1;

export type DemoRows = {
  userSports: Prisma.UserSportCreateManyInput[];
  matches: Prisma.MatchCreateManyInput[];
  participants: Prisma.ParticipantCreateManyInput[];
  joinRequests: Prisma.JoinRequestCreateManyInput[];
  ratings: Prisma.RatingCreateManyInput[];
  noShowReports: Prisma.NoShowReportCreateManyInput[];
  lateWithdrawals: Prisma.LateWithdrawalCreateManyInput[];
  notifications: Prisma.NotificationCreateManyInput[];
};

type RowsInput = {
  userIds: Record<PlayerKey, string>;
  sportIds: Record<SportName, string>;
  now: Date;
};

const demoId = (...parts: string[]): string =>
  `${DEMO_ID_PREFIX}${parts.join('-')}`;

const shiftHours = (date: Date, hours: number): Date =>
  new Date(date.getTime() + hours * MS_PER_HOUR);

const matchDate = (match: DemoMatch): Date =>
  inDays(match.daysFromToday, match.hour);

const matchCreatedAt = (match: DemoMatch, now: Date): Date =>
  match.daysFromToday < 0
    ? new Date(
        matchDate(match).getTime() - PLAYED_CREATED_DAYS_BEFORE * MS_PER_DAY,
      )
    : new Date(now.getTime() - UPCOMING_CREATED_DAYS_AGO * MS_PER_DAY);

const joinedAt = (match: DemoMatch, now: Date, position: number): Date =>
  shiftHours(matchCreatedAt(match, now), position + 1);

const findMatch = (key: string): DemoMatch => {
  const match = DEMO_MATCHES.find((candidate) => candidate.key === key);

  if (!match) {
    throw new Error(`Demo match ${key} is not in the catalog`);
  }

  return match;
};

export const demoMatchId = (key: string): string => demoId('match', key);

export const buildDemoRows = ({
  userIds,
  sportIds,
  now,
}: RowsInput): DemoRows => ({
  userSports: DEMO_USERS.flatMap(({ key, sports }) =>
    sports.map((sport) => ({
      id: demoId('user-sport', key, sport.toLowerCase()),
      userId: userIds[key],
      sportId: sportIds[sport],
    })),
  ),

  matches: DEMO_MATCHES.map((match) => ({
    id: demoMatchId(match.key),
    sportId: sportIds[match.sport],
    level: match.level,
    date: matchDate(match),
    ...match.place,
    capacity: match.capacity,
    description: match.description ?? null,
    status: 'ACTIVE',
    cancelReason: null,
    canceledAt: null,
    filledAt: isFull(match.participants.length, match.capacity)
      ? joinedAt(match, now, match.participants.length - 1)
      : null,
    organizerId: userIds[match.organizer],
    createdAt: matchCreatedAt(match, now),
  })),

  participants: DEMO_MATCHES.flatMap((match) =>
    match.participants.map((player, position) => ({
      id: demoId('participant', match.key, player),
      matchId: demoMatchId(match.key),
      userId: userIds[player],
      createdAt: joinedAt(match, now, position),
    })),
  ),

  joinRequests: DEMO_MATCHES.flatMap((match) =>
    (match.pendingRequests ?? []).map((player) => ({
      id: demoId('request', match.key, player),
      matchId: demoMatchId(match.key),
      userId: userIds[player],
      status: 'PENDING',
      origin: 'REQUEST',
    })),
  ),

  ratings: DEMO_RATINGS.map(({ match, rater, rated, score }) => ({
    id: demoId('rating', match, rater, rated),
    matchId: demoMatchId(match),
    raterId: userIds[rater],
    ratedUserId: userIds[rated],
    score,
    createdAt: shiftHours(matchDate(findMatch(match)), EVENT_HOURS_AFTER_MATCH),
  })),

  noShowReports: DEMO_NO_SHOWS.map(({ match, player }) => {
    const { organizer } = findMatch(match);

    return {
      id: demoId('no-show', match, player),
      matchId: demoMatchId(match),
      reporterId: userIds[organizer],
      reportedUserId: userIds[player],
      createdAt: shiftHours(
        matchDate(findMatch(match)),
        NO_SHOW_HOURS_AFTER_MATCH,
      ),
    };
  }),

  lateWithdrawals: DEMO_LATE_WITHDRAWALS.map(({ match, player }) => ({
    id: demoId('late-withdrawal', match, player),
    matchId: demoMatchId(match),
    userId: userIds[player],
    createdAt: shiftHours(
      matchDate(findMatch(match)),
      -LATE_WITHDRAWAL_HOURS_BEFORE_MATCH,
    ),
  })),

  notifications: DEMO_NOTIFICATIONS.map((notification) => {
    const createdAt = shiftHours(now, -notification.hoursAgo);

    return {
      id: demoId('notification', notification.key),
      userId: userIds.host,
      actorId: userIds[notification.actor],
      type: notification.type,
      matchId: demoMatchId(notification.match),
      payload: notification.payload,
      readAt: notification.read ? createdAt : null,
      createdAt,
    };
  }),
});
