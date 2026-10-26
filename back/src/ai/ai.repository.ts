import { Injectable } from '@nestjs/common';
import type { AiProvider, AiUsageKind } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiRepository {
  constructor(private readonly prisma: PrismaService) {}

  countUsagesSince(userId: string, kind: AiUsageKind, since: Date) {
    return this.prisma.aiUsage.count({
      where: { userId, kind, createdAt: { gte: since } },
    });
  }

  recordUsage(userId: string, kind: AiUsageKind, provider: AiProvider) {
    return this.prisma.aiUsage.create({
      data: { userId, kind, provider },
      select: { id: true },
    });
  }
}
