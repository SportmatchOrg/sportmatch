import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { promoteToAdmin } from './admin/promote-admin';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const email = process.argv[2]?.trim();

  if (!email) {
    throw new Error('Usage: npm run admin:promote -- <email>');
  }

  if (!(await promoteToAdmin(prisma, email))) {
    throw new Error('There is no user with that email: sign in once first');
  }

  console.log('User promoted to ADMIN');
}

void main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
