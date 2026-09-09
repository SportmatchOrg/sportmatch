import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JoinRequestsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMatchById(matchId: string, userId: string) {
    return this.prisma.partido.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        organizadorId: true,
        fecha: true,
        cupo: true,
        _count: { select: { participantes: true } },
        participantes: {
          where: { usuarioId: userId },
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

  deletePending(matchId: string, userId: string) {
    return this.prisma.joinRequest.deleteMany({
      where: { matchId, userId, status: 'PENDING' },
    });
  }
}
