import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.user.createMany({
    data: [
      { firebaseUid: 'seed-uid-1', email: 'ana@sportmatch.dev', nombre: 'Ana Gómez' },
      { firebaseUid: 'seed-uid-2', email: 'luis@sportmatch.dev', nombre: 'Luis Pérez' },
    ],
    skipDuplicates: true,
  });
}

main().finally(() => prisma.$disconnect());
