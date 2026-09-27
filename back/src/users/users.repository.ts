import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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

  findMatchesReportedIn(userId: string) {
    return this.prisma.match.findMany({
      where: { noShowReports: { some: { reportedUserId: userId } } },
      select: {
        organizerId: true,
        noShowReports: {
          select: { reporterId: true, reportedUserId: true },
        },
      },
    });
  }

  countLateWithdrawals(userId: string) {
    return this.prisma.lateWithdrawal.count({ where: { userId } });
  }

  findCanceledMatchDates(userId: string) {
    return this.prisma.match.findMany({
      where: {
        organizerId: userId,
        status: 'CANCELED',
        canceledAt: { not: null },
      },
      select: { date: true, canceledAt: true },
    });
  }

  findReceivedRatings(userId: string) {
    return this.prisma.rating.findMany({
      where: { ratedUserId: userId },
      select: { score: true, matchId: true, raterId: true },
    });
  }

  findNoShowReportsByMatch(matchIds: string[]) {
    return this.prisma.match.findMany({
      where: { id: { in: matchIds } },
      select: {
        id: true,
        organizerId: true,
        noShowReports: {
          select: { reporterId: true, reportedUserId: true },
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
