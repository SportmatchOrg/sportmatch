import type { PrismaClient } from '../../src/generated/prisma/client';

export const promoteToAdmin = async (
  prisma: PrismaClient,
  email: string,
): Promise<boolean> => {
  const { count } = await prisma.user.updateMany({
    where: { email },
    data: { role: 'ADMIN' },
  });

  return count > 0;
};
