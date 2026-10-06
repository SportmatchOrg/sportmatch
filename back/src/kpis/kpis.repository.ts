import { Injectable } from '@nestjs/common';
import type { KpiResultStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const KPI_MATCH = {
  id: true,
  status: true,
  date: true,
  createdAt: true,
  filledAt: true,
  capacity: true,
  organizerId: true,
  participants: { select: { userId: true } },
  lateWithdrawals: { select: { userId: true } },
  noShowReports: {
    select: { reporterId: true, reportedUserId: true, createdAt: true },
  },
} as const;

export type KpiResultRow = {
  kpiId: string;
  value: number | null;
  status: KpiResultStatus;
  numerator: number | null;
  denominator: number | null;
  errorCode: string | null;
};

@Injectable()
export class KpisRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMatchesBetween(from: Date, to: Date) {
    return this.prisma.match.findMany({
      where: { date: { gte: from, lt: to } },
      select: KPI_MATCH,
    });
  }

  findUsersCreatedBefore(date: Date) {
    return this.prisma.user.findMany({
      where: { createdAt: { lt: date } },
      select: { id: true, createdAt: true },
    });
  }

  findActivityBetween(firstDay: Date, lastDay: Date) {
    return this.prisma.userActivityDay.findMany({
      where: { activityDate: { gte: firstDay, lte: lastDay } },
      select: { userId: true, activityDate: true },
    });
  }

  async findFirstActivityDay() {
    const { _min } = await this.prisma.userActivityDay.aggregate({
      _min: { activityDate: true },
    });

    return _min.activityDate;
  }

  createRun(measurementDate: Date, results: KpiResultRow[]) {
    return this.prisma.kpiRun.create({
      data: { measurementDate, results: { create: results } },
      select: { id: true },
    });
  }
}
