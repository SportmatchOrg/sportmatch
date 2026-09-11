import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { inDays } from '../src/utils/time/in-days';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const NOMBRES_DEPORTES = ['FUTBOL', 'BASQUET', 'TENIS', 'PADEL', 'RUNNING'];

async function main() {
  const deportes = await Promise.all(
    NOMBRES_DEPORTES.map((nombre) =>
      prisma.deporte.upsert({
        where: { nombre },
        update: {},
        create: { nombre },
      }),
    ),
  );

  const deporteId = (nombre: string): string => {
    const deporte = deportes.find((candidato) => candidato.nombre === nombre);

    if (!deporte) {
      throw new Error(`Deporte ${nombre} was not seeded`);
    }

    return deporte.id;
  };

  const seedUser = (firebaseUid: string, email: string, nombre: string) =>
    prisma.user.upsert({
      where: { firebaseUid },
      update: {},
      create: { firebaseUid, email, nombre },
    });

  const [ana, luis, marta, pablo, sofia] = await Promise.all([
    seedUser('seed-uid-1', 'ana@sportmatch.dev', 'Ana Gómez'),
    seedUser('seed-uid-2', 'luis@sportmatch.dev', 'Luis Pérez'),
    seedUser('seed-uid-3', 'marta@sportmatch.dev', 'Marta Ruiz'),
    seedUser('seed-uid-4', 'pablo@sportmatch.dev', 'Pablo Díaz'),
    seedUser('seed-uid-5', 'sofia@sportmatch.dev', 'Sofía Torres'),
  ]);

  await prisma.partido.deleteMany();

  await prisma.partido.createMany({
    data: [
      {
        deporteId: deporteId('FUTBOL'),
        nivel: 'INTERMEDIO',
        fecha: inDays(2, 19),
        ubicacion: 'Parque Sur',
        cupo: 10,
        descripcion: 'Faltan dos para completar los equipos',
        organizadorId: ana.id,
      },
      {
        deporteId: deporteId('PADEL'),
        nivel: 'PRINCIPIANTE',
        fecha: inDays(3, 20),
        ubicacion: 'Club Norte · Cancha 3',
        cupo: 4,
        organizadorId: luis.id,
      },
      {
        deporteId: deporteId('BASQUET'),
        nivel: 'AVANZADO',
        fecha: inDays(5, 21),
        ubicacion: 'Polideportivo Municipal',
        cupo: 10,
        organizadorId: ana.id,
      },
      {
        deporteId: deporteId('TENIS'),
        nivel: 'INTERMEDIO',
        fecha: inDays(7, 18),
        ubicacion: 'River Courts · Cancha 2',
        cupo: 2,
        descripcion: 'Singles, traer pelotas',
        organizadorId: luis.id,
      },
      {
        deporteId: deporteId('RUNNING'),
        nivel: 'PRINCIPIANTE',
        fecha: inDays(9, 8),
        ubicacion: 'Costanera, kilómetro 0',
        cupo: 15,
        descripcion: 'Ritmo suave, 5 km',
        organizadorId: ana.id,
      },
      {
        deporteId: deporteId('FUTBOL'),
        nivel: 'AVANZADO',
        fecha: inDays(12, 22),
        ubicacion: 'Complejo Del Este',
        cupo: 14,
        organizadorId: luis.id,
      },
      {
        deporteId: deporteId('FUTBOL'),
        nivel: 'INTERMEDIO',
        fecha: inDays(-3, 20),
        ubicacion: 'Parque Sur',
        cupo: 10,
        descripcion: 'Partido ya jugado',
        organizadorId: ana.id,
      },
      {
        deporteId: deporteId('PADEL'),
        nivel: 'PRINCIPIANTE',
        fecha: inDays(-10, 19),
        ubicacion: 'Club Norte · Cancha 1',
        cupo: 4,
        organizadorId: luis.id,
      },
    ],
  });

  const createdPartidos = await prisma.partido.findMany({
    orderBy: { fecha: 'asc' },
  });

  const now = new Date();
  const played = createdPartidos.filter((partido) => partido.fecha < now);
  const upcoming = createdPartidos.filter((partido) => partido.fecha >= now);

  await prisma.participante.createMany({
    data: [...played, ...upcoming.slice(0, 3)].map((partido) => ({
      partidoId: partido.id,
      usuarioId: partido.organizadorId === ana.id ? luis.id : ana.id,
    })),
  });

  await prisma.partido.create({
    data: {
      deporteId: deporteId('FUTBOL'),
      nivel: 'INTERMEDIO',
      fecha: inDays(-2, 19),
      ubicacion: 'Cancha Central',
      cupo: 10,
      descripcion: 'Partido jugado con cinco jugadores',
      organizadorId: ana.id,
      participantes: {
        create: [luis, marta, pablo, sofia].map(({ id }) => ({
          usuarioId: id,
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

  const playedMatches = await prisma.partido.findMany({
    where: { fecha: { lt: new Date() }, organizadorId: { not: demoUser.id } },
    select: { id: true },
  });

  await prisma.participante.createMany({
    data: playedMatches.map(({ id }) => ({
      partidoId: id,
      usuarioId: demoUser.id,
    })),
    skipDuplicates: true,
  });
}

void main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
