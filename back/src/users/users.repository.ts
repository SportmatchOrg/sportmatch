import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { confirmedNoShowIds } from '../utils/ratings/confirmed-no-shows';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FirebaseUser } from '../auth/types';

const PUBLIC_USER = {
  id: true,
  name: true,
  photoUrl: true,
} as const;

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({ select: PUBLIC_USER });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: PUBLIC_USER,
    });
  }

  findByFirebaseUid(firebaseUid: string) {
    return this.prisma.user.findUnique({ where: { firebaseUid } });
  }

  aggregateReceivedRatings(userId: string) {
    return this.prisma.rating.aggregate({
      where: { ratedUserId: userId },
      _avg: { score: true },
      _count: true,
    });
  }

  async findEffectiveReceivedScores(userId: string): Promise<number[]> {
    const ratings = await this.prisma.rating.findMany({
      where: { ratedUserId: userId },
      select: { score: true, matchId: true, raterId: true },
    });

    if (ratings.length === 0) {
      return [];
    }

    const matchIds = [...new Set(ratings.map(({ matchId }) => matchId))];
    const matches = await this.prisma.match.findMany({
      where: { id: { in: matchIds } },
      select: {
        id: true,
        organizerId: true,
        noShowReports: {
          select: { reporterId: true, reportedUserId: true },
        },
      },
    });

    const confirmedByMatch = new Map(
      matches.map((match) => [
        match.id,
        new Set(confirmedNoShowIds(match.noShowReports, match.organizerId)),
      ]),
    );

    return ratings
      .filter(({ matchId, raterId }) => {
        const confirmed = confirmedByMatch.get(matchId);

        return !confirmed?.has(userId) && !confirmed?.has(raterId);
      })
      .map(({ score }) => score);
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

  create(data: CreateUserDto) {
    return this.prisma.user.create({ data });
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

  upsertByFirebaseUid(user: FirebaseUser) {
    return this.prisma.user.upsert({
      where: { firebaseUid: user.uid },
      update: {
        email: user.email,
        name: user.name,
        photoUrl: user.photoUrl,
      },
      create: {
        firebaseUid: user.uid,
        email: user.email,
        name: user.name,
        photoUrl: user.photoUrl,
      },
    });
  }

  update(id: string, data: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
