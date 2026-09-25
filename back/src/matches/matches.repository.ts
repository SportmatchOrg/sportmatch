import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchDto } from './dto/create-match.dto';
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
    joinRequests: { where: { status: 'PENDING' } },
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
  }) as const;

@Injectable()
export class MatchesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUpcoming(userId: string) {
    return this.prisma.match.findMany({
      where: {
        date: { gte: new Date() },
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

  findDetailById(id: string, userId: string) {
    return this.prisma.match.findUnique({
      where: { id },
      include: {
        organizer: PUBLIC_ORGANIZER,
        sport: PUBLIC_SPORT,
        _count: PARTICIPANT_COUNT,
        participants: PUBLIC_PARTICIPANTS,
        joinRequests: {
          where: { userId },
          select: { status: true },
        },
        ratings: {
          where: { raterId: userId },
          select: { id: true },
          take: 1,
        },
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
      where: {
        date: { lt: new Date() },
        status: 'ACTIVE',
        OR: [
          { organizerId: playerId },
          { participants: { some: { userId: playerId } } },
        ],
      },
      orderBy: { date: 'desc' },
      include: matchInclude(viewerId),
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

  removeParticipant(matchId: string, userId: string) {
    return this.prisma.$transaction([
      this.prisma.participant.delete({
        where: { matchId_userId: { matchId, userId } },
      }),
      this.prisma.joinRequest.deleteMany({ where: { matchId, userId } }),
    ]);
  }
}
