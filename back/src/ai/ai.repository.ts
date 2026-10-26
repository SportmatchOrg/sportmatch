import { Injectable } from '@nestjs/common';
import type { AiProvider, AiUsageKind } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiRepository {
  constructor(private readonly prisma: PrismaService) {}

  reserveUsage(
    userId: string,
    kind: AiUsageKind,
    since: Date,
    limit: number,
  ): Promise<string | null> {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;

      const used = await tx.aiUsage.count({
        where: { userId, kind, createdAt: { gte: since } },
      });

      if (used >= limit) {
        return null;
      }

      const { id } = await tx.aiUsage.create({
        data: { userId, kind },
        select: { id: true },
      });

      return id;
    });
  }

  confirmUsage(id: string, provider: AiProvider) {
    return this.prisma.aiUsage.update({
      where: { id },
      data: { provider },
      select: { id: true },
    });
  }

  releaseUsage(id: string) {
    return this.prisma.aiUsage.deleteMany({ where: { id } });
  }
}
