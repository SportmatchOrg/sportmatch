import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type StoredPushSubscription = {
  id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

export type SubscriptionData = Omit<StoredPushSubscription, 'id' | 'userId'>;

@Injectable()
export class PushSubscriptionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  upsert(userId: string, subscription: SubscriptionData) {
    return this.prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      create: { userId, ...subscription },
      update: { userId, p256dh: subscription.p256dh, auth: subscription.auth },
      select: { id: true, endpoint: true, createdAt: true },
    });
  }

  deleteOwn(userId: string, endpoint: string) {
    return this.prisma.pushSubscription.deleteMany({
      where: { userId, endpoint },
    });
  }

  findForUsers(userIds: string[]): Promise<StoredPushSubscription[]> {
    return this.prisma.pushSubscription.findMany({
      where: { userId: { in: userIds } },
      select: {
        id: true,
        userId: true,
        endpoint: true,
        p256dh: true,
        auth: true,
      },
    });
  }

  deleteById(id: string) {
    return this.prisma.pushSubscription.deleteMany({ where: { id } });
  }
}
