import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { hoursAgo } from '../src/utils/time/hours-ago';
import { inDays } from '../src/utils/time/in-days';
import { MS_PER_HOUR } from '../src/utils/time/milliseconds';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SPORT_NAMES = ['FUTBOL', 'BASQUET', 'TENIS', 'PADEL', 'RUNNING'];

const SEED_GUIDE = [
  {
    user: 'Pablo Díaz',
    scenario:
      'Tiene 2 faltas confirmadas. Si Ana lo marca como ausente en el partido de tenis de hace 3 h, suma la 3ª y queda suspendido 7 días',
  },
  {
    user: 'Sofía Torres',
    scenario: 'Se bajó tarde de un partido: puntaje penalizado por baja tarde',
  },
  {
    user: 'Luis Pérez',
    scenario: 'Canceló tarde un partido como organizador: puntaje penalizado',
  },
  {
    user: 'Tomás Herrera',
    scenario:
      'Suspendido ahora: 3 faltas en los últimos días (noShowCount90d = 3)',
  },
  {
    user: 'SEED_DEMO_EMAIL',
    scenario: 'Tiene los 8 tipos de notificación en /notificaciones',
  },
];

const hoursBefore = (date: Date, hours: number): Date =>
  new Date(date.getTime() - hours * MS_PER_HOUR);

const hoursAfter = (date: Date, hours: number): Date =>
  hoursBefore(date, -hours);

async function main() {
  const sports = await Promise.all(
    SPORT_NAMES.map((name) =>
      prisma.sport.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  const sportId = (name: string): string => {
    const sport = sports.find((candidate) => candidate.name === name);

    if (!sport) {
      throw new Error(`Sport ${name} was not seeded`);
    }

    return sport.id;
  };

  const seedUser = (firebaseUid: string, email: string, name: string) =>
    prisma.user.upsert({
      where: { firebaseUid },
      update: {},
      create: { firebaseUid, email, name },
    });

  const [ana, luis, marta, pablo, sofia, tomas] = await Promise.all([
    seedUser('seed-uid-1', 'ana@sportmatch.dev', 'Ana Gómez'),
    seedUser('seed-uid-2', 'luis@sportmatch.dev', 'Luis Pérez'),
    seedUser('seed-uid-3', 'marta@sportmatch.dev', 'Marta Ruiz'),
    seedUser('seed-uid-4', 'pablo@sportmatch.dev', 'Pablo Díaz'),
    seedUser('seed-uid-5', 'sofia@sportmatch.dev', 'Sofía Torres'),
    seedUser('seed-uid-6', 'tomas@sportmatch.dev', 'Tomás Herrera'),
  ]);

  await prisma.match.deleteMany();

  await prisma.match.createMany({
    data: [
      {
        sportId: sportId('FUTBOL'),
        level: 'INTERMEDIATE',
        date: inDays(2, 19),
        location: 'Parque Sur',
        latitude: -34.60655,
        longitude: -58.43556,
        capacity: 10,
        description: 'Faltan dos para completar los equipos',
        organizerId: ana.id,
      },
      {
        sportId: sportId('PADEL'),
        level: 'BEGINNER',
        date: inDays(3, 20),
        location: 'Club Norte · Cancha 3',
        latitude: -34.46472,
        longitude: -58.91042,
        capacity: 4,
        organizerId: luis.id,
      },
      {
        sportId: sportId('BASQUET'),
        level: 'ADVANCED',
        date: inDays(5, 21),
        location: 'Polideportivo Municipal',
        latitude: -34.46775,
        longitude: -58.9204,
        capacity: 10,
        organizerId: ana.id,
      },
      {
        sportId: sportId('TENIS'),
        level: 'INTERMEDIATE',
        date: inDays(7, 18),
        location: 'River Courts · Cancha 2',
        latitude: -34.55818,
        longitude: -58.49974,
        capacity: 2,
        description: 'Singles, traer pelotas',
        organizerId: luis.id,
      },
      {
        sportId: sportId('RUNNING'),
        level: 'BEGINNER',
        date: inDays(9, 8),
        location: 'Costanera, kilómetro 0',
        latitude: -34.60841,
        longitude: -58.35904,
        capacity: 15,
        description: 'Ritmo suave, 5 km',
        organizerId: ana.id,
      },
      {
        sportId: sportId('FUTBOL'),
        level: 'ADVANCED',
        date: inDays(12, 22),
        location: 'Complejo Del Este',
        latitude: -34.46896,
        longitude: -58.91957,
        capacity: 14,
        organizerId: luis.id,
      },
      {
        sportId: sportId('FUTBOL'),
        level: 'INTERMEDIATE',
        date: inDays(-3, 20),
        location: 'Parque Sur',
        latitude: -34.60655,
        longitude: -58.43556,
        capacity: 10,
        description: 'Partido ya jugado',
        organizerId: ana.id,
      },
      {
        sportId: sportId('PADEL'),
        level: 'BEGINNER',
        date: inDays(-10, 19),
        location: 'Club Norte · Cancha 1',
        latitude: -34.46472,
        longitude: -58.91042,
        capacity: 4,
        organizerId: luis.id,
      },
    ],
  });

  const createdMatches = await prisma.match.findMany({
    orderBy: { date: 'asc' },
  });

  const now = new Date();
  const played = createdMatches.filter((match) => match.date < now);
  const upcoming = createdMatches.filter((match) => match.date >= now);

  await prisma.participant.createMany({
    data: [...played, ...upcoming.slice(0, 3)].map((match) => ({
      matchId: match.id,
      userId: match.organizerId === ana.id ? luis.id : ana.id,
    })),
  });

  await prisma.match.create({
    data: {
      sportId: sportId('FUTBOL'),
      level: 'INTERMEDIATE',
      date: inDays(-2, 19),
      location: 'Cancha Central',
      latitude: -34.46896,
      longitude: -58.91957,
      capacity: 10,
      description: 'Partido jugado con cinco jugadores',
      organizerId: ana.id,
      participants: {
        create: [luis, marta, pablo, sofia].map(({ id }) => ({
          userId: id,
        })),
      },
    },
  });

  await prisma.match.create({
    data: {
      sportId: sportId('TENIS'),
      level: 'INTERMEDIATE',
      date: hoursAgo(3),
      location: 'Club del Oeste · Cancha 3',
      latitude: -34.4663,
      longitude: -58.9183,
      capacity: 4,
      description: 'Partido jugado hace un rato: todavia se puede calificar',
      organizerId: ana.id,
      participants: {
        create: [luis, marta, pablo].map(({ id }) => ({ userId: id })),
      },
    },
  });

  const noShowMatches = await Promise.all(
    [
      { organizer: ana, date: inDays(-4, 20), location: 'Cancha Central' },
      { organizer: luis, date: inDays(-6, 21), location: 'Parque Sur' },
    ].map(({ organizer, date, location }) =>
      prisma.match.create({
        data: {
          sportId: sportId('FUTBOL'),
          level: 'INTERMEDIATE',
          date,
          location,
          latitude: -34.46896,
          longitude: -58.91957,
          capacity: 10,
          description: 'Partido jugado con una falta confirmada',
          organizerId: organizer.id,
          participants: {
            create: [pablo, marta].map(({ id }) => ({ userId: id })),
          },
        },
      }),
    ),
  );

  await prisma.noShowReport.createMany({
    data: noShowMatches.map((match) => ({
      matchId: match.id,
      reporterId: match.organizerId,
      reportedUserId: pablo.id,
    })),
  });

  await prisma.rating.createMany({
    data: noShowMatches.map((match) => ({
      matchId: match.id,
      raterId: pablo.id,
      ratedUserId: marta.id,
      score: 5,
    })),
  });

  const lateWithdrawalMatch = played[played.length - 1];

  await prisma.lateWithdrawal.create({
    data: {
      matchId: lateWithdrawalMatch.id,
      userId: sofia.id,
      createdAt: hoursBefore(lateWithdrawalMatch.date, 1),
    },
  });

  const lateCancelDate = inDays(-5, 20);

  const lateCanceledMatch = await prisma.match.create({
    data: {
      sportId: sportId('BASQUET'),
      level: 'INTERMEDIATE',
      date: lateCancelDate,
      location: 'Club Norte · Cancha 2',
      latitude: -34.46472,
      longitude: -58.91042,
      capacity: 10,
      description: 'Cancelado a último momento',
      organizerId: luis.id,
      status: 'CANCELED',
      canceledAt: hoursBefore(lateCancelDate, 1),
      cancelReason: 'No conseguimos cancha',
    },
  });

  const suspensionMatches = await Promise.all(
    [inDays(-20, 20), inDays(-12, 20), inDays(-3, 21)].map((date) =>
      prisma.match.create({
        data: {
          sportId: sportId('FUTBOL'),
          level: 'BEGINNER',
          date,
          location: 'Parque Sur',
          latitude: -34.60655,
          longitude: -58.43556,
          capacity: 10,
          description: 'Partido jugado con una falta confirmada',
          organizerId: marta.id,
          participants: {
            create: [tomas, sofia].map(({ id }) => ({ userId: id })),
          },
        },
      }),
    ),
  );

  await prisma.noShowReport.createMany({
    data: suspensionMatches.map((match) => ({
      matchId: match.id,
      reporterId: match.organizerId,
      reportedUserId: tomas.id,
      createdAt: hoursAfter(match.date, 1),
    })),
  });

  const demoEmail = process.env.SEED_DEMO_EMAIL;

  if (!demoEmail) {
    return;
  }

  const demoUser = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  if (!demoUser) {
    return;
  }

  const playedMatches = await prisma.match.findMany({
    where: {
      date: { lt: new Date() },
      organizerId: { not: demoUser.id },
      id: {
        notIn: [...noShowMatches, ...suspensionMatches, lateCanceledMatch].map(
          ({ id }) => id,
        ),
      },
    },
    orderBy: { date: 'asc' },
    select: { id: true, organizerId: true },
  });

  await prisma.participant.createMany({
    data: playedMatches.map(({ id }) => ({
      matchId: id,
      userId: demoUser.id,
    })),
    skipDuplicates: true,
  });

  await prisma.match.create({
    data: {
      sportId: sportId('BASQUET'),
      level: 'INTERMEDIATE',
      date: inDays(-1, 20),
      location: 'Polideportivo Municipal',
      latitude: -34.46775,
      longitude: -58.9204,
      capacity: 4,
      description: 'Partido jugado sin calificar',
      organizerId: marta.id,
      participants: {
        create: [demoUser, pablo, sofia].map(({ id }) => ({ userId: id })),
      },
    },
  });

  const [ratedMatch, secondPlayedMatch, thirdPlayedMatch] = playedMatches;

  if (!ratedMatch || !secondPlayedMatch || !thirdPlayedMatch) {
    return;
  }

  await prisma.rating.create({
    data: {
      matchId: ratedMatch.id,
      raterId: demoUser.id,
      ratedUserId: ratedMatch.organizerId,
      score: 5,
    },
  });

  await prisma.notification.deleteMany({ where: { userId: demoUser.id } });

  await prisma.notification.createMany({
    data: [
      {
        userId: demoUser.id,
        actorId: ana.id,
        matchId: ratedMatch.id,
        type: 'JOIN_REQUEST_ACCEPTED',
        readAt: new Date(),
      },
      {
        userId: demoUser.id,
        actorId: luis.id,
        matchId: secondPlayedMatch.id,
        type: 'JOIN_REQUEST_REJECTED',
      },
      {
        userId: demoUser.id,
        actorId: marta.id,
        matchId: thirdPlayedMatch.id,
        type: 'MATCH_CANCELED',
        payload: { reason: 'Canceled because of rain' },
      },
      {
        userId: demoUser.id,
        actorId: sofia.id,
        matchId: ratedMatch.id,
        type: 'JOIN_REQUEST_RECEIVED',
        readAt: new Date(),
      },
      {
        userId: demoUser.id,
        actorId: pablo.id,
        matchId: secondPlayedMatch.id,
        type: 'PARTICIPANT_LEFT',
      },
      {
        userId: demoUser.id,
        actorId: ana.id,
        matchId: thirdPlayedMatch.id,
        type: 'MATCH_UPDATED',
        payload: { changed: ['date', 'location'] },
      },
      {
        userId: demoUser.id,
        matchId: secondPlayedMatch.id,
        type: 'NO_SHOW_CONFIRMED',
      },
      {
        userId: demoUser.id,
        type: 'USER_SUSPENDED',
        payload: { until: inDays(5, 21).toISOString() },
      },
    ],
  });
}

void main()
  .then(() => console.table(SEED_GUIDE))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
