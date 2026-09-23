import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

  findByMatch(matchId: string) {
    return this.prisma.joinRequest.findMany({
      where: { matchId },
      orderBy: { createdAt: 'asc' },
      include: { user: PUBLIC_USER },
    });
  }

  findByIdAndMatch(id: string, matchId: string) {
    return this.prisma.joinRequest.findFirst({
      where: { id, matchId },
    });
  }

  create(matchId: string, userId: string) {
    return this.prisma.joinRequest.create({
      data: { matchId, userId },
    });
  }

  resetToPending(id: string) {
    return this.prisma.joinRequest.update({
      where: { id },
      data: { status: 'PENDING' },
    });
  }

  reject(id: string) {
    return this.prisma.joinRequest.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
  }

  accept(joinRequestId: string, matchId: string, userId: string) {
    return this.prisma.$transaction([
      this.prisma.joinRequest.update({
        where: { id: joinRequestId },
        data: { status: 'ACCEPTED' },
      }),
      this.prisma.participant.create({
        data: { matchId, userId },
      }),
    ]);
  }

  deletePending(matchId: string, userId: string) {
    return this.prisma.joinRequest.deleteMany({
      where: { matchId, userId, status: 'PENDING' },
    });
  }
}
