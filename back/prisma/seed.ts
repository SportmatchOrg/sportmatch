import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { inDays } from '../src/utils/time/in-days';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SPORT_NAMES = ['FUTBOL', 'BASQUET', 'TENIS', 'PADEL', 'RUNNING'];

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

  const [ana, luis, marta, pablo, sofia] = await Promise.all([
    seedUser('seed-uid-1', 'ana@sportmatch.dev', 'Ana Gómez'),
    seedUser('seed-uid-2', 'luis@sportmatch.dev', 'Luis Pérez'),
    seedUser('seed-uid-3', 'marta@sportmatch.dev', 'Marta Ruiz'),
    seedUser('seed-uid-4', 'pablo@sportmatch.dev', 'Pablo Díaz'),
    seedUser('seed-uid-5', 'sofia@sportmatch.dev', 'Sofía Torres'),
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

  const demoEmail = process.env.SEED_DEMO_EMAIL;

  if (!demoEmail) {
    return;
  }

  const demoUser = await prisma.user.findUnique({ where: { email: demoEmail } });

  if (!demoUser) {
    return;
  }

  const playedMatches = await prisma.match.findMany({
    where: { date: { lt: new Date() }, organizerId: { not: demoUser.id } },
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
    ],
  });
}

void main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
