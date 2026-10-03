import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webPush from 'web-push';
import { UsersService } from '../users/users.service';
import { CreatePushSubscriptionDto } from './dto/create-push-subscription.dto';
import {
  PushSubscriptionsRepository,
  type StoredPushSubscription,
} from './push-subscriptions.repository';

export type PushMessage = {
  userId: string;
  title: string;
  body: string;
  url: string;
};

@Injectable()
export class PushSubscriptionsService {
  private readonly logger = new Logger(PushSubscriptionsService.name);

  constructor(
    private readonly repository: PushSubscriptionsRepository,
    private readonly usersService: UsersService,
    config: ConfigService,
  ) {
    webPush.setVapidDetails(
      config.getOrThrow<string>('VAPID_SUBJECT'),
      config.getOrThrow<string>('VAPID_PUBLIC_KEY'),
      config.getOrThrow<string>('VAPID_PRIVATE_KEY'),
    );
  }

  async subscribe(
    firebaseUid: string,
    subscription: CreatePushSubscriptionDto,
  ) {
    const userId = (await this.usersService.findByFirebaseUid(firebaseUid)).id;

    return this.repository.upsert(userId, {
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    });
  }

  async unsubscribe(firebaseUid: string, endpoint: string) {
    const userId = (await this.usersService.findByFirebaseUid(firebaseUid)).id;
    await this.repository.deleteOwn(userId, endpoint);
  }

  async sendMany(messages: PushMessage[]) {
    if (messages.length === 0) return;

    const userIds = [...new Set(messages.map(({ userId }) => userId))];
    const subscriptions = await this.repository.findForUsers(userIds);
    const byUser = new Map<string, StoredPushSubscription[]>();

    for (const subscription of subscriptions) {
      const userSubscriptions = byUser.get(subscription.userId) ?? [];
      userSubscriptions.push(subscription);
      byUser.set(subscription.userId, userSubscriptions);
    }

    await Promise.all(
      messages.flatMap((message) =>
        (byUser.get(message.userId) ?? []).map((subscription) =>
          this.sendOne(subscription, message),
        ),
      ),
    );
  }

  private async sendOne(
    subscription: StoredPushSubscription,
    message: PushMessage,
  ) {
    try {
      await webPush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        },
        JSON.stringify({
          title: message.title,
          body: message.body,
          url: message.url,
        }),
      );
    } catch (error) {
      const status =
        error instanceof webPush.WebPushError ? error.statusCode : null;

      if (status === 404 || status === 410) {
        try {
          await this.repository.deleteById(subscription.id);
        } catch {
          this.logger.warn('Could not delete an expired push subscription');
        }
        return;
      }

      this.logger.warn(
        `Could not send a push notification (${status ?? 'unknown error'})`,
      );
    }
  }
}
