import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AccountBlock } from '../utils/blocks/account-block';

const BLOCK_STATUS = {
  id: true,
  blockedAt: true,
  blockedUntil: true,
} as const;

export type ReportReview = {
  reportId: string;
  reviewedById: string;
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

  block(userId: string, block: AccountBlock, review?: ReportReview) {
    return this.prisma.$transaction(async (tx) => {
      if (review) {
        const { count } = await tx.report.updateMany({
          where: { id: review.reportId, status: 'OPEN' },
          data: {
            status: 'REVIEWED',
            reviewedById: review.reviewedById,
            reviewedAt: block.blockedAt,
          },
        });

        if (count === 0) {
          return null;
        }
      }

      return tx.user.update({
        where: { id: userId },
        data: block,
        select: BLOCK_STATUS,
      });
    });
  }

  unblock(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { blockedAt: null, blockedUntil: null },
      select: BLOCK_STATUS,
    });
  }
}
