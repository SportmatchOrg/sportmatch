import type { Prisma, PrismaClient } from '../../src/generated/prisma/client';
import { DEMO_DOMAIN, DEMO_ID_PREFIX } from './catalog';

type Client = PrismaClient | Prisma.TransactionClient;

type Side = 'inside' | 'outside';

export type ScopeCounts = Record<string, number>;

const DEMO_EMAIL = { endsWith: `@${DEMO_DOMAIN}` };
const DEMO_ID = { startsWith: DEMO_ID_PREFIX };

const DEMO_USER: Prisma.UserWhereInput = { email: DEMO_EMAIL };
const DEMO_USER_SPORT: Prisma.UserSportWhereInput = { user: DEMO_USER };
const DEMO_MATCH: Prisma.MatchWhereInput = { id: DEMO_ID };
const IN_DEMO_MATCH = { matchId: DEMO_ID };
const DEMO_NOTIFICATION: Prisma.NotificationWhereInput = {
  OR: [{ id: DEMO_ID }, { user: DEMO_USER }],
};

const scoped = <T>(side: Side, filter: T): T | { NOT: T } =>
  side === 'inside' ? filter : { NOT: filter };

const COUNTERS: Record<
  string,
  (client: Client, side: Side) => Promise<number>
> = {
  users: (client, side) =>
    client.user.count({ where: scoped(side, DEMO_USER) }),
  user_sports: (client, side) =>
    client.userSport.count({ where: scoped(side, DEMO_USER_SPORT) }),
  matches: (client, side) =>
    client.match.count({ where: scoped(side, DEMO_MATCH) }),
  participants: (client, side) =>
    client.participant.count({ where: scoped(side, IN_DEMO_MATCH) }),
  join_requests: (client, side) =>
    client.joinRequest.count({ where: scoped(side, IN_DEMO_MATCH) }),
  ratings: (client, side) =>
    client.rating.count({ where: scoped(side, IN_DEMO_MATCH) }),
  no_show_reports: (client, side) =>
    client.noShowReport.count({ where: scoped(side, IN_DEMO_MATCH) }),
  late_withdrawals: (client, side) =>
    client.lateWithdrawal.count({ where: scoped(side, IN_DEMO_MATCH) }),
  notifications: (client, side) =>
    client.notification.count({ where: scoped(side, DEMO_NOTIFICATION) }),
  reports: (client, side) =>
    side === 'inside' ? Promise.resolve(0) : client.report.count(),
};

export const countScope = async (
  client: Client,
  side: Side,
): Promise<ScopeCounts> => {
  const counts: ScopeCounts = {};

  for (const [table, count] of Object.entries(COUNTERS)) {
    counts[table] = await count(client, side);
  }

  return counts;
};

export const changedTables = (
  before: ScopeCounts,
  after: ScopeCounts,
): string[] =>
  Object.keys(before).filter((table) => before[table] !== after[table]);

export const clearDemoChildren = async (tx: Prisma.TransactionClient) => {
  await tx.userSport.deleteMany({ where: DEMO_USER_SPORT });
  await tx.participant.deleteMany({ where: IN_DEMO_MATCH });
  await tx.joinRequest.deleteMany({ where: IN_DEMO_MATCH });
  await tx.rating.deleteMany({ where: IN_DEMO_MATCH });
  await tx.noShowReport.deleteMany({ where: IN_DEMO_MATCH });
  await tx.lateWithdrawal.deleteMany({ where: IN_DEMO_MATCH });
  await tx.notification.deleteMany({ where: DEMO_NOTIFICATION });
};
