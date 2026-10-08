import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';

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
}
