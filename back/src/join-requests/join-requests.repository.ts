import { Injectable } from '@nestjs/common';
import type { JoinRequestOrigin } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { isFull } from '../utils/matches/player-count';

const PUBLIC_USER = {
  select: { id: true, name: true, photoUrl: true },
} as const;

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

  reject(id: string) {
    return this.prisma.joinRequest.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
  }

  accept(joinRequestId: string, matchId: string, userId: string) {
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
        return null;
      }

      const request = await tx.joinRequest.update({
        where: { id: joinRequestId },
        data: { status: 'ACCEPTED' },
      });

      await tx.participant.create({ data: { matchId, userId } });

      if (isFull(joined + 1, match.capacity) && match.filledAt === null) {
        await tx.match.update({
          where: { id: matchId },
          data: { filledAt: new Date() },
        });
      }

      return request;
    });
  }

  deletePendingRequest(matchId: string, userId: string) {
    return this.prisma.joinRequest.deleteMany({
      where: { matchId, userId, status: 'PENDING', origin: 'REQUEST' },
    });
  }
}
