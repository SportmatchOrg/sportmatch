import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const inDays = (days: number, hour: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
};

async function main() {
  const ana = await prisma.user.upsert({
    where: { firebaseUid: 'seed-uid-1' },
    update: {},
    create: {
      firebaseUid: 'seed-uid-1',
      email: 'ana@sportmatch.dev',
      nombre: 'Ana Gómez',
    },
  });

  const luis = await prisma.user.upsert({
    where: { firebaseUid: 'seed-uid-2' },
    update: {},
    create: {
      firebaseUid: 'seed-uid-2',
      email: 'luis@sportmatch.dev',
      nombre: 'Luis Pérez',
    },
  });

  await prisma.partido.deleteMany();

  await prisma.partido.createMany({
    data: [
      {
        deporte: 'FUTBOL',
        nivel: 'INTERMEDIO',
        fecha: inDays(2, 19),
        ubicacion: 'Parque Sur',
        cupo: 10,
        descripcion: 'Faltan dos para completar los equipos',
        organizadorId: ana.id,
      },
      {
        deporte: 'PADEL',
        nivel: 'PRINCIPIANTE',
        fecha: inDays(3, 20),
        ubicacion: 'Club Norte · Cancha 3',
        cupo: 4,
        organizadorId: luis.id,
      },
      {
        deporte: 'BASQUET',
        nivel: 'AVANZADO',
        fecha: inDays(5, 21),
        ubicacion: 'Polideportivo Municipal',
        cupo: 10,
        organizadorId: ana.id,
      },
      {
        deporte: 'TENIS',
        nivel: 'INTERMEDIO',
        fecha: inDays(7, 18),
        ubicacion: 'River Courts · Cancha 2',
        cupo: 2,
        descripcion: 'Singles, traer pelotas',
        organizadorId: luis.id,
      },
      {
        deporte: 'RUNNING',
        nivel: 'PRINCIPIANTE',
        fecha: inDays(9, 8),
        ubicacion: 'Costanera, kilómetro 0',
        cupo: 15,
        descripcion: 'Ritmo suave, 5 km',
        organizadorId: ana.id,
      },
      {
        deporte: 'FUTBOL',
        nivel: 'AVANZADO',
        fecha: inDays(12, 22),
        ubicacion: 'Complejo Del Este',
        cupo: 14,
        organizadorId: luis.id,
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
