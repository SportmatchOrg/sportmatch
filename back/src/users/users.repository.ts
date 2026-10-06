import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FirebaseUser } from '../auth/types';
import type { NoShowReportsFilter } from './types';

const PUBLIC_USER = {
  id: true,
  name: true,
  photoUrl: true,
} as const;

const USER_PROFILE = {
  ...PUBLIC_USER,
  city: true,
} as const;

const SEARCH_LIMIT = 10;

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({ select: PUBLIC_USER });
  }

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

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: USER_PROFILE,
    });
  }

  findByFirebaseUid(firebaseUid: string) {
    return this.prisma.user.findUnique({ where: { firebaseUid } });
  }

  countLateWithdrawalsBy(userIds: string[]) {
    return this.prisma.lateWithdrawal.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds } },
      _count: { _all: true },
    });
  }

  findCanceledMatchDates(userIds: string[]) {
    return this.prisma.match.findMany({
      where: {
        organizerId: { in: userIds },
        status: 'CANCELED',
        canceledAt: { not: null },
      },
      select: { organizerId: true, date: true, canceledAt: true },
    });
  }

  findReceivedRatings(userIds: string[]) {
    return this.prisma.rating.findMany({
      where: { ratedUserId: { in: userIds } },
      select: { score: true, matchId: true, raterId: true, ratedUserId: true },
    });
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

  recordActivityDay(userId: string, activityDate: Date) {
    return this.prisma.userActivityDay.createMany({
      data: [{ userId, activityDate }],
      skipDuplicates: true,
    });
  }

  upsertByFirebaseUid(user: FirebaseUser) {
    return this.prisma.user.upsert({
      where: { firebaseUid: user.uid },
      update: { email: user.email },
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
