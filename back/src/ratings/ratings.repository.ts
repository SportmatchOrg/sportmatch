import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { RatingItemDto } from './dto/create-ratings.dto';

const PUBLIC_USER = {
  select: { id: true, nombre: true, fotoUrl: true },
} as const;

@Injectable()
export class RatingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMatchWithPlayers(matchId: string) {
    return this.prisma.partido.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        fecha: true,
        organizador: PUBLIC_USER,
        participantes: { select: { usuario: PUBLIC_USER } },
      },
    });
  }

  countGivenBy(matchId: string, raterId: string) {
    return this.prisma.rating.count({ where: { matchId, raterId } });
  }

  createMany(matchId: string, raterId: string, items: RatingItemDto[]) {
    return this.prisma.rating.createMany({
      data: items.map(({ ratedUserId, score, comment }) => ({
        matchId,
        raterId,
        ratedUserId,
        score,
        comment,
      })),
    });
  }
}
