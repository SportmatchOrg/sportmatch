import { Injectable } from '@nestjs/common';
import type { NotificationType, Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const PUBLIC_USER = {
  id: true,
  name: true,
  photoUrl: true,
} as const;

const NOTIFICATION_SELECT = {
  id: true,
  type: true,
  readAt: true,
  createdAt: true,
  payload: true,
  actor: { select: PUBLIC_USER },
  match: {
    select: {
      id: true,
      date: true,
      location: true,
      sport: { select: { id: true, name: true } },
    },
  },
} as const;

export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  actorId?: string;
  matchId?: string;
  payload?: Prisma.InputJsonValue;
};

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMine(userId: string, limit: number) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: NOTIFICATION_SELECT,
    });
  }

  countUnread(userId: string) {
    return this.prisma.notification.count({ where: { userId, readAt: null } });
  }

  findByIdForUser(id: string, userId: string) {
    return this.prisma.notification.findFirst({
      where: { id, userId },
      select: NOTIFICATION_SELECT,
    });
  }

  markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
      select: NOTIFICATION_SELECT,
    });
  }

  markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  create(input: CreateNotificationInput) {
    return this.prisma.notification.create({ data: input });
  }
}
