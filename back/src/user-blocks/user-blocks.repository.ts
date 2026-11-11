import { Injectable } from '@nestjs/common';
import { ModerationActionType } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type {
  AccountBlock,
  BlockDuration,
} from '../utils/blocks/account-block';

const BLOCK_STATUS = {
  id: true,
  blockedAt: true,
  blockedUntil: true,
} as const;

export type BlockAction = {
  adminId: string;
  duration: BlockDuration;
  reportId?: string;
};

@Injectable()
export class UserBlocksRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });
  }

  findReportById(id: string) {
    return this.prisma.report.findUnique({
      where: { id },
      select: { reportedUserId: true },
    });
  }

  block(
    userId: string,
    block: AccountBlock,
    { adminId, duration, reportId }: BlockAction,
  ) {
    return this.prisma.$transaction(async (tx) => {
      if (reportId) {
        const { count } = await tx.report.updateMany({
          where: { id: reportId, status: 'OPEN' },
          data: {
            status: 'REVIEWED',
            reviewedById: adminId,
            reviewedAt: block.blockedAt,
          },
        });

        if (count === 0) {
          return null;
        }
      }

      await tx.moderationAction.create({
        data: {
          type: ModerationActionType.USER_BLOCKED,
          adminId,
          targetUserId: userId,
          reportId,
          detail: { duration },
        },
      });

      return tx.user.update({
        where: { id: userId },
        data: block,
        select: BLOCK_STATUS,
      });
    });
  }

  unblock(userId: string, adminId: string) {
    return this.prisma.$transaction(async (tx) => {
      const { count } = await tx.user.updateMany({
        where: { id: userId, blockedAt: { not: null } },
        data: { blockedAt: null, blockedUntil: null },
      });

      if (count === 0) {
        return;
      }

      await tx.moderationAction.create({
        data: {
          type: ModerationActionType.USER_UNBLOCKED,
          adminId,
          targetUserId: userId,
        },
      });
    });
  }
}
