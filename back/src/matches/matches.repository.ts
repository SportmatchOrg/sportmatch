import { Injectable } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { isFull, playerCount } from '../utils/matches/player-count';
import { CreateMatchDto } from './dto/create-match.dto';
import type { FindMatchesQueryDto } from './dto/find-matches-query.dto';
import { UpdateMatchDto } from './dto/update-match.dto';

const PUBLIC_ORGANIZER = {
  select: { id: true, name: true, photoUrl: true },
} as const;

const PUBLIC_SPORT = {
  select: { id: true, name: true },
} as const;

const PARTICIPANT_COUNT = {
  select: {
    participants: true,
    joinRequests: { where: { status: 'PENDING', origin: 'REQUEST' } },
  },
} as const;

const PUBLIC_PARTICIPANTS = {
  select: {
    user: { select: { id: true, name: true, photoUrl: true } },
    createdAt: true,
  },
  orderBy: { createdAt: 'asc' },
} as const;

const matchInclude = (userId: string) =>
  ({
    organizer: PUBLIC_ORGANIZER,
    sport: PUBLIC_SPORT,
    _count: PARTICIPANT_COUNT,
    participants: { where: { userId }, select: { id: true } },
    joinRequests: {
      where: { userId },
      select: { status: true },
    },
    ratings: { where: { raterId: userId }, select: { id: true }, take: 1 },
    noShowReports: {
      where: { reporterId: userId },
      select: { id: true },
      take: 1,
    },
  }) as const;

const playedBy = (playerId: string): Prisma.MatchWhereInput => ({
  date: { lt: new Date() },
  status: 'ACTIVE',
  OR: [
    { organizerId: playerId },
    { participants: { some: { userId: playerId } } },
  ],
});

@Injectable()
export class MatchesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUpcoming(userId: string, query: FindMatchesQueryDto) {
    const now = new Date();

    return this.prisma.match.findMany({
      where: {
        date: {
          gte: query.from && query.from > now ? query.from : now,
          ...(query.to && { lte: query.to }),
        },
        ...(query.sportId && { sportId: { in: query.sportId } }),
        ...(query.level && { level: { in: query.level } }),
        status: 'ACTIVE',
        organizerId: { not: userId },
        participants: { none: { userId } },
        joinRequests: {
          none: { userId, status: 'PENDING' },
        },
      },
      orderBy: { date: 'asc' },
      include: matchInclude(userId),
    });
  }

  findById(id: string, userId: string) {
    return this.prisma.match.findUnique({
      where: { id },
      include: matchInclude(userId),
    });
  }

  findPublicById(id: string) {
    return this.prisma.match.findUnique({
      where: { id },
      select: {
        id: true,
        date: true,
        location: true,
        latitude: true,
        longitude: true,
        level: true,
        capacity: true,
        status: true,
        sport: PUBLIC_SPORT,
        organizer: { select: { name: true, photoUrl: true } },
        _count: { select: { participants: true } },
      },
    });
  }

  findDetailById(id: string, userId: string) {
    return this.prisma.match.findUnique({
      where: { id },
      include: {
        ...matchInclude(userId),
        participants: PUBLIC_PARTICIPANTS,
      },
    });
  }

  findOrganizedBy(userId: string) {
    return this.prisma.match.findMany({
      where: { organizerId: userId, date: { gte: new Date() } },
      orderBy: { date: 'asc' },
      include: matchInclude(userId),
    });
  }

  findJoinedBy(userId: string) {
    return this.prisma.match.findMany({
      where: {
        date: { gte: new Date() },
        participants: { some: { userId } },
      },
      orderBy: { date: 'asc' },
      include: matchInclude(userId),
    });
  }

  findRequestedBy(userId: string) {
    return this.prisma.match.findMany({
      where: {
        date: { gte: new Date() },
        status: 'ACTIVE',
        joinRequests: { some: { userId, status: 'PENDING' } },
      },
      orderBy: { date: 'asc' },
      include: matchInclude(userId),
    });
  }

  findPlayedBy(playerId: string, viewerId: string = playerId) {
    return this.prisma.match.findMany({
      where: playedBy(playerId),
      orderBy: { date: 'desc' },
      include: matchInclude(viewerId),
    });
  }

  findPlayedLevelsByFrequency(playerId: string) {
    return this.prisma.match.groupBy({
      by: ['level'],
      where: playedBy(playerId),
      _count: { level: true },
      orderBy: [{ _count: { level: 'desc' } }, { level: 'asc' }],
    });
  }

  create(organizerId: string, data: CreateMatchDto) {
    return this.prisma.match.create({
      data: { ...data, organizerId },
      include: matchInclude(organizerId),
    });
  }

  update(id: string, userId: string, data: UpdateMatchDto) {
    return this.prisma.match.update({
      where: { id },
      data,
      include: matchInclude(userId),
    });
  }

  updateWithCapacity(
    id: string,
    userId: string,
    data: UpdateMatchDto,
    capacity: number,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM matches WHERE id = ${id} FOR UPDATE`;

      const participants = await tx.participant.count({
        where: { matchId: id },
      });

      if (capacity < playerCount(participants)) {
        return { match: null, participants };
      }

      const current = await tx.match.findUniqueOrThrow({
        where: { id },
        select: { filledAt: true },
      });

      const fillsMatch =
        isFull(participants, capacity) && current.filledAt === null;

      const match = await tx.match.update({
        where: { id },
        data: { ...data, ...(fillsMatch && { filledAt: new Date() }) },
        include: matchInclude(userId),
      });

      return { match, participants };
    });
  }

  cancel(id: string, userId: string, reason: string) {
    return this.prisma.match.update({
      where: { id },
      data: {
        status: 'CANCELED',
        cancelReason: reason,
        canceledAt: new Date(),
      },
      include: matchInclude(userId),
    });
  }

  remove(id: string) {
    return this.prisma.match.delete({ where: { id } });
  }

  async findPlayersAndPendingIds(matchId: string) {
    const [participants, pendingRequests] = await Promise.all([
      this.prisma.participant.findMany({
        where: { matchId },
        select: { userId: true },
      }),
      this.prisma.joinRequest.findMany({
        where: { matchId, status: 'PENDING' },
        select: { userId: true },
      }),
    ]);

    return [
      ...new Set(
        [...participants, ...pendingRequests].map(({ userId }) => userId),
      ),
    ];
  }

  removeParticipant(matchId: string, userId: string, wasLate: boolean) {
    const operations = [
      this.prisma.participant.delete({
        where: { matchId_userId: { matchId, userId } },
      }),
      this.prisma.joinRequest.deleteMany({ where: { matchId, userId } }),
    ];

    if (wasLate) {
      operations.push(
        this.prisma.lateWithdrawal.create({ data: { matchId, userId } }),
      );
    }

    return this.prisma.$transaction(operations);
  }
}
