import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { RatingItemDto } from './dto/create-ratings.dto';

const PUBLIC_USER = {
  select: { id: true, name: true, photoUrl: true },
} as const;

@Injectable()
export class RatingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMatchWithPlayers(matchId: string) {
    return this.prisma.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        date: true,
        status: true,
        organizer: PUBLIC_USER,
        participants: { select: { user: PUBLIC_USER } },
      },
    });
  }

  async countSubmittedBy(matchId: string, userId: string) {
    const [ratings, noShowReports] = await Promise.all([
      this.prisma.rating.count({ where: { matchId, raterId: userId } }),
      this.prisma.noShowReport.count({
        where: { matchId, reporterId: userId },
      }),
    ]);

    return ratings + noShowReports;
  }

  async createSubmission(
    matchId: string,
    userId: string,
    ratings: RatingItemDto[],
    noShowUserIds: string[],
  ) {
    const [createdRatings, createdNoShowReports] =
      await this.prisma.$transaction([
        this.prisma.rating.createMany({
          data: ratings.map(({ ratedUserId, score, comment }) => ({
            matchId,
            raterId: userId,
            ratedUserId,
            score,
            comment,
          })),
        }),
        this.prisma.noShowReport.createMany({
          data: noShowUserIds.map((reportedUserId) => ({
            matchId,
            reporterId: userId,
            reportedUserId,
          })),
        }),
      ]);

    return {
      count: createdRatings.count,
      noShowCount: createdNoShowReports.count,
    };
  }
}
