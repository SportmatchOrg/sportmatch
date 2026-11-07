import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FirebaseUser } from '../auth/types';
import type { Prisma } from '../generated/prisma/client';
import type { NoShowReportsFilter, SportSummary } from './types';

const PUBLIC_USER = {
  id: true,
  name: true,
  photoUrl: true,
} as const;

const USER_SPORTS = {
  sports: {
    select: { sport: { select: { id: true, name: true } } },
    orderBy: { sport: { name: 'asc' } },
  },
} as const;

const USER_PROFILE = {
  ...PUBLIC_USER,
  city: true,
  level: true,
  ...USER_SPORTS,
} as const;

const withSportList = <T extends { sports: { sport: SportSummary }[] }>({
  sports,
  ...user
}: T) => ({
  ...user,
  sports: sports.map(({ sport }) => sport),
});

const SEARCH_LIMIT = 10;

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  searchByName(query: string, excludedUserId: string) {
    return this.prisma.user.findMany({
      where: {
        id: { not: excludedUserId },
        name: { contains: query, mode: 'insensitive' },
      },
      select: PUBLIC_USER,
      orderBy: { name: 'asc' },
      take: SEARCH_LIMIT,
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_PROFILE,
    });

    return user && withSportList(user);
  }

  async findExistingSportIds(sportIds: string[]) {
    const sports = await this.prisma.sport.findMany({
      where: { id: { in: sportIds } },
      select: { id: true },
    });

    return sports.map(({ id }) => id);
  }

  async findSportIdsByUserId(userId: string) {
    const sports = await this.prisma.userSport.findMany({
      where: { userId },
      select: { sportId: true },
    });

    return sports.map(({ sportId }) => sportId);
  }

  findByFirebaseUid(firebaseUid: string) {
    return this.prisma.user.findUnique({ where: { firebaseUid } });
  }

  findScoreTotals(userIds: string[]) {
    // Keep the confirmed rule in sync with confirmedNoShows in utils/ratings.
    return this.prisma.$queryRaw<
      {
        userId: string;
        starsSum: number;
        starsCount: number;
        noShows: number;
        lates: number;
      }[]
    >`
      WITH requested AS (
        SELECT DISTINCT unnest(${userIds}::text[]) AS "userId"
      ), confirmed AS (
        SELECT report."matchId", report."reportedUserId" AS "userId"
        FROM no_show_reports report
        JOIN matches match ON match.id = report."matchId"
        GROUP BY report."matchId", report."reportedUserId"
        HAVING bool_or(report."reporterId" = match."organizerId")
            OR count(*) >= 2
      ), stars AS (
        SELECT rating."ratedUserId" AS "userId",
               sum(rating.score)::int AS "starsSum",
               count(*)::int AS "starsCount"
        FROM ratings rating
        WHERE rating."ratedUserId" = ANY(${userIds}::text[])
          AND NOT EXISTS (
            SELECT 1 FROM confirmed
            WHERE "matchId" = rating."matchId" AND "userId" = rating."ratedUserId"
          )
          AND NOT EXISTS (
            SELECT 1 FROM confirmed
            WHERE "matchId" = rating."matchId" AND "userId" = rating."raterId"
          )
        GROUP BY rating."ratedUserId"
      ), no_shows AS (
        SELECT "userId", count(*)::int AS "noShows"
        FROM confirmed
        GROUP BY "userId"
      ), withdrawals AS (
        SELECT "userId", count(*)::int AS total
        FROM late_withdrawals
        WHERE "userId" = ANY(${userIds}::text[])
        GROUP BY "userId"
      ), cancellations AS (
        SELECT "organizerId" AS "userId", count(*)::int AS total
        FROM matches
        WHERE "organizerId" = ANY(${userIds}::text[])
          AND status = 'CANCELED'
          AND date - "canceledAt" < interval '2 hours'
        GROUP BY "organizerId"
      )
      SELECT requested."userId",
             coalesce(stars."starsSum", 0) AS "starsSum",
             coalesce(stars."starsCount", 0) AS "starsCount",
             coalesce(no_shows."noShows", 0) AS "noShows",
             coalesce(withdrawals.total, 0) + coalesce(cancellations.total, 0) AS lates
      FROM requested
      LEFT JOIN stars USING ("userId")
      LEFT JOIN no_shows USING ("userId")
      LEFT JOIN withdrawals USING ("userId")
      LEFT JOIN cancellations USING ("userId")
    `;
  }

  findNoShowReportsByMatch(filter: NoShowReportsFilter) {
    return this.prisma.match.findMany({
      where:
        'matchIds' in filter
          ? { id: { in: filter.matchIds } }
          : {
              noShowReports: {
                some: { reportedUserId: { in: filter.reportedUserIds } },
              },
            },
      select: {
        id: true,
        organizerId: true,
        noShowReports: {
          select: { reporterId: true, reportedUserId: true, createdAt: true },
        },
      },
    });
  }

  findPlayedDates(userId: string) {
    return this.prisma.match.findMany({
      where: {
        date: { lt: new Date() },
        status: 'ACTIVE',
        OR: [{ organizerId: userId }, { participants: { some: { userId } } }],
      },
      select: { date: true },
    });
  }

  ensureExists(user: FirebaseUser) {
    return this.prisma.user.upsert({
      where: { firebaseUid: user.uid },
      update: {},
      create: {
        firebaseUid: user.uid,
        email: user.email,
        name: user.name,
        photoUrl: user.photoUrl,
      },
    });
  }

  recordActivityDay(userId: string, activityDate: Date) {
    return this.prisma.userActivityDay.createMany({
      data: [{ userId, activityDate }],
      skipDuplicates: true,
    });
  }

  async upsertByFirebaseUid(user: FirebaseUser) {
    const saved = await this.prisma.user.upsert({
      where: { firebaseUid: user.uid },
      update: { email: user.email },
      create: {
        firebaseUid: user.uid,
        email: user.email,
        name: user.name,
        photoUrl: user.photoUrl,
      },
      include: USER_SPORTS,
    });

    return withSportList(saved);
  }

  completeOnboarding(
    id: string,
    { sportIds, level, city }: CompleteOnboardingDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const { count } = await tx.user.updateMany({
        where: { id, onboardedAt: null },
        data: { level, city, onboardedAt: new Date() },
      });

      if (count === 0) {
        return null;
      }

      await this.replaceSports(tx, id, sportIds);

      return withSportList(
        await tx.user.findUniqueOrThrow({
          where: { id },
          include: USER_SPORTS,
        }),
      );
    });
  }

  update(id: string, { sportIds, ...data }: UpdateUserDto) {
    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id }, data });

      if (sportIds) {
        await this.replaceSports(tx, id, sportIds);
      }

      return withSportList(
        await tx.user.findUniqueOrThrow({
          where: { id },
          include: USER_SPORTS,
        }),
      );
    });
  }

  replacePhotoUrl(
    id: string,
    previousPhotoUrl: string | null,
    photoUrl: string,
  ) {
    return this.prisma.user.updateMany({
      where: { id, photoUrl: previousPhotoUrl },
      data: { photoUrl },
    });
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  private async replaceSports(
    tx: Prisma.TransactionClient,
    userId: string,
    sportIds: string[],
  ) {
    await tx.userSport.deleteMany({
      where: { userId, sportId: { notIn: sportIds } },
    });
    await tx.userSport.createMany({
      data: sportIds.map((sportId) => ({ userId, sportId })),
      skipDuplicates: true,
    });
  }
}
