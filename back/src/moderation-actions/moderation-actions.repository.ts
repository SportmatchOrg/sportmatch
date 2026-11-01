import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const MODERATION_ACTION = {
  id: true,
  type: true,
  reportId: true,
  detail: true,
  createdAt: true,
  admin: { select: { id: true, name: true, photoUrl: true } },
} as const;

@Injectable()
export class ModerationActionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
  }

  findAllByTargetUser(targetUserId: string) {
    return this.prisma.moderationAction.findMany({
      where: { targetUserId },
      orderBy: { createdAt: 'desc' },
      select: MODERATION_ACTION,
    });
  }
}
