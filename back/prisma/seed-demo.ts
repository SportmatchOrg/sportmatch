import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type Prisma } from '../src/generated/prisma/client';
import {
  DEMO_DOMAIN,
  DEMO_ID_PREFIX,
  DEMO_USERS,
  FALLBACK_HOST,
  HOST,
  SPORT_NAMES,
  type DemoUserKey,
  type PlayerKey,
  type SportName,
} from './demo/catalog';
import { buildDemoRows, type DemoRows } from './demo/rows';
import {
  changedTables,
  clearDemoChildren,
  countScope,
  type ScopeCounts,
} from './demo/scope';

const TRANSACTION_TIMEOUT_MS = 120_000;
const TRANSACTION_MAX_WAIT_MS = 20_000;

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const placeholderIds = <K extends string>(
  keys: readonly K[],
): Record<K, string> => {
  const ids = {} as Record<K, string>;

  for (const key of keys) {
    ids[key] = key;
  }

  return ids;
};

const plannedCounts = (now: Date): ScopeCounts => {
  const rows = buildDemoRows({
    userIds: placeholderIds<PlayerKey>([
      ...DEMO_USERS.map(({ key }) => key),
      HOST,
    ]),
    sportIds: placeholderIds(SPORT_NAMES),
    now,
  });

  return {
    users: DEMO_USERS.length,
    user_sports: rows.userSports.length,
    matches: rows.matches.length,
    participants: rows.participants.length,
    join_requests: rows.joinRequests.length,
    ratings: rows.ratings.length,
    no_show_reports: rows.noShowReports.length,
    late_withdrawals: rows.lateWithdrawals.length,
    notifications: rows.notifications.length,
    reports: 0,
  };
};

const findPresenter = async () => {
  const email = process.env.SEED_DEMO_EMAIL;

  if (!email || email.endsWith(`@${DEMO_DOMAIN}`)) {
    return null;
  }

  return prisma.user.findUnique({ where: { email }, select: { id: true } });
};

const upsertSports = async (tx: Prisma.TransactionClient) => {
  const ids = {} as Record<SportName, string>;

  for (const name of SPORT_NAMES) {
    const sport = await tx.sport.upsert({
      where: { name },
      update: {},
      create: { name },
    });

    ids[name] = sport.id;
  }

  return ids;
};

const upsertDemoUsers = async (tx: Prisma.TransactionClient) => {
  const ids = {} as Record<DemoUserKey, string>;

  for (const { key, emailName, name, city, level } of DEMO_USERS) {
    const profile = { name, city, level, photoUrl: null };
    const user = await tx.user.upsert({
      where: { email: `${emailName}@${DEMO_DOMAIN}` },
      update: profile,
      create: {
        id: `${DEMO_ID_PREFIX}user-${key}`,
        firebaseUid: `${DEMO_ID_PREFIX}uid-${key}`,
        email: `${emailName}@${DEMO_DOMAIN}`,
        ...profile,
      },
    });

    ids[key] = user.id;
  }

  return ids;
};

const writeRows = async (tx: Prisma.TransactionClient, rows: DemoRows) => {
  for (const { id, ...match } of rows.matches) {
    await tx.match.upsert({
      where: { id },
      create: { id, ...match },
      update: match,
    });
  }

  await tx.userSport.createMany({ data: rows.userSports });
  await tx.participant.createMany({ data: rows.participants });
  await tx.joinRequest.createMany({ data: rows.joinRequests });
  await tx.rating.createMany({ data: rows.ratings });
  await tx.noShowReport.createMany({ data: rows.noShowReports });
  await tx.lateWithdrawal.createMany({ data: rows.lateWithdrawals });
  await tx.notification.createMany({ data: rows.notifications });
};

const toTable = (columns: Record<string, ScopeCounts>) =>
  Object.fromEntries(
    Object.keys(Object.values(columns)[0]).map((table) => [
      table,
      Object.fromEntries(
        Object.entries(columns).map(([column, counts]) => [
          column,
          counts[table],
        ]),
      ),
    ]),
  );

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const now = new Date();
  const presenter = await findPresenter();

  console.log(
    presenter
      ? 'Anfitrión de la demo: la cuenta de SEED_DEMO_EMAIL.'
      : `SEED_DEMO_EMAIL no está o esa cuenta todavía no entró a la app: el anfitrión es el usuario demo "${FALLBACK_HOST}".`,
  );
  console.log('Filas que el seed va a reemplazar o escribir:');
  console.table(
    toTable({
      'demo actuales': await countScope(prisma, 'inside'),
      'demo a escribir': plannedCounts(now),
    }),
  );

  const outside = await prisma.$transaction(
    async (tx) => {
      const before = await countScope(tx, 'outside');
      const sportIds = await upsertSports(tx);
      const userIds = await upsertDemoUsers(tx);
      const rows = buildDemoRows({
        userIds: {
          ...userIds,
          [HOST]: presenter?.id ?? userIds[FALLBACK_HOST],
        },
        sportIds,
        now,
      });

      await clearDemoChildren(tx);
      await writeRows(tx, rows);

      const after = await countScope(tx, 'outside');
      const changed = changedTables(before, after);

      if (changed.length > 0) {
        throw new Error(
          `Rows outside the demo scope changed (${changed.join(', ')}); nothing was saved`,
        );
      }

      return { before, after };
    },
    { timeout: TRANSACTION_TIMEOUT_MS, maxWait: TRANSACTION_MAX_WAIT_MS },
  );

  console.log('Filas fuera de la demo (tienen que quedar iguales):');
  console.table(toTable({ antes: outside.before, después: outside.after }));
}

void main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
