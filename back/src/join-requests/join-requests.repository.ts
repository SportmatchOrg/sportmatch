import { Injectable } from '@nestjs/common';
import type {
  JoinRequest,
  JoinRequestOrigin,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { isFull } from '../utils/matches/player-count';

const PUBLIC_USER = {
  select: { id: true, name: true, photoUrl: true },
} as const;

export type AcceptOutcome =
  | { outcome: 'accepted'; request: JoinRequest }
  | { outcome: 'full' }
  | { outcome: 'not-pending' };

@Injectable()
export class JoinRequestsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMatchById(matchId: string, userId: string) {
    return this.prisma.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        organizerId: true,
        date: true,
        status: true,
        capacity: true,
        _count: { select: { participants: true } },
        participants: {
          where: { userId },
          select: { id: true },
        },
      },
    });
  }

  findByMatchAndUser(matchId: string, userId: string) {
    return this.prisma.joinRequest.findUnique({
      where: { matchId_userId: { matchId, userId } },
    });
  }

  findByMatch(matchId: string, origin: JoinRequestOrigin) {
    return this.prisma.joinRequest.findMany({
      where: { matchId, origin },
      orderBy: { createdAt: 'asc' },
      include: { user: PUBLIC_USER },
    });
  }

  findRequestByIdAndMatch(id: string, matchId: string) {
    return this.prisma.joinRequest.findFirst({
      where: { id, matchId, origin: 'REQUEST' },
    });
  }

  create(matchId: string, userId: string, origin: JoinRequestOrigin) {
    return this.prisma.joinRequest.create({
      data: { matchId, userId, origin },
    });
  }

  resetToPending(id: string, origin: JoinRequestOrigin) {
    return this.prisma.joinRequest.update({
      where: { id },
      data: { status: 'PENDING', origin },
    });
  }

  rejectIfPending(id: string): Promise<JoinRequest | null> {
    return this.prisma.$transaction(async (tx) => {
      const { count } = await tx.joinRequest.updateMany({
        where: { id, status: 'PENDING' },
        data: { status: 'REJECTED' },
      });

      return count === 0
        ? null
        : tx.joinRequest.findUniqueOrThrow({ where: { id } });
    });
  }

  acceptIfPending(
    joinRequestId: string,
    matchId: string,
    userId: string,
  ): Promise<AcceptOutcome> {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM matches WHERE id = ${matchId} FOR UPDATE`;

      const [joined, match] = await Promise.all([
        tx.participant.count({ where: { matchId } }),
        tx.match.findUniqueOrThrow({
          where: { id: matchId },
          select: { capacity: true, filledAt: true },
        }),
      ]);

      if (isFull(joined, match.capacity)) {
        return { outcome: 'full' };
      }

      const { count } = await tx.joinRequest.updateMany({
        where: { id: joinRequestId, status: 'PENDING' },
        data: { status: 'ACCEPTED' },
      });

      if (count === 0) {
        return { outcome: 'not-pending' };
      }

      await tx.participant.create({ data: { matchId, userId } });

      if (isFull(joined + 1, match.capacity) && match.filledAt === null) {
        await tx.match.update({
          where: { id: matchId },
          data: { filledAt: new Date() },
        });
      }

      const request = await tx.joinRequest.findUniqueOrThrow({
        where: { id: joinRequestId },
      });

      return { outcome: 'accepted', request };
    });
  }

  deletePendingRequest(matchId: string, userId: string) {
    return this.prisma.joinRequest.deleteMany({
      where: { matchId, userId, status: 'PENDING', origin: 'REQUEST' },
    });
  }
}
