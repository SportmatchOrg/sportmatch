import { Injectable } from '@nestjs/common';
import type { ReportStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import type { ReportResolution } from './dto/resolve-report.dto';

const PUBLIC_USER = {
  select: { id: true, name: true, photoUrl: true },
} as const;

const REPORT_DETAILS = {
  reporter: PUBLIC_USER,
  reportedUser: {
    select: {
      id: true,
      name: true,
      photoUrl: true,
      _count: { select: { reportsReceived: true } },
    },
  },
  reviewedBy: PUBLIC_USER,
  match: {
    select: {
      id: true,
      date: true,
      location: true,
      sport: { select: { id: true, name: true } },
    },
  },
} as const;

type ReportedUserWithCount = {
  _count: { reportsReceived: number };
};

const withReportCount = <T extends { reportedUser: ReportedUserWithCount }>({
  reportedUser: { _count, ...reportedUser },
  ...report
}: T) => ({
  ...report,
  reportedUser: { ...reportedUser, reportCount: _count.reportsReceived },
});

@Injectable()
export class ReportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
  }

  findMatchPlayers(matchId: string, userIds: string[]) {
    return this.prisma.match.findUnique({
      where: { id: matchId },
      select: {
        organizerId: true,
        participants: {
          where: { userId: { in: userIds } },
          select: { userId: true },
        },
      },
    });
  }

  findOpen(reporterId: string, reportedUserId: string, matchId: string | null) {
    return this.prisma.report.findFirst({
      where: { reporterId, reportedUserId, matchId, status: 'OPEN' },
      select: { id: true },
    });
  }

  create(reporterId: string, data: CreateReportDto) {
    return this.prisma.report.create({
      data: { ...data, reporterId },
    });
  }

  findById(id: string) {
    return this.prisma.report.findUnique({
      where: { id },
      select: { id: true },
    });
  }

  async findAllByStatus(status: ReportStatus) {
    const reports = await this.prisma.report.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      include: REPORT_DETAILS,
    });

    return reports.map(withReportCount);
  }

  async findWithDetailsById(id: string) {
    return withReportCount(
      await this.prisma.report.findUniqueOrThrow({
        where: { id },
        include: REPORT_DETAILS,
      }),
    );
  }

  async resolveOpen(
    id: string,
    status: ReportResolution,
    reviewedById: string,
  ): Promise<boolean> {
    const { count } = await this.prisma.report.updateMany({
      where: { id, status: 'OPEN' },
      data: { status, reviewedById, reviewedAt: new Date() },
    });

    return count > 0;
  }
}
