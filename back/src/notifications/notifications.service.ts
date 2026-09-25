import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { NotificationsRepository } from './notifications.repository';
import type { CreateNotificationInput } from './notifications.repository';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly usersService: UsersService,
  ) {}

  async findMine(firebaseUid: string, limit: number) {
    const userId = await this.getUserId(firebaseUid);

    return this.notificationsRepository.findMine(userId, limit);
  }

  async unreadCount(firebaseUid: string) {
    const userId = await this.getUserId(firebaseUid);
    const count = await this.notificationsRepository.countUnread(userId);

    return { count };
  }

  async read(firebaseUid: string, id: string) {
    const userId = await this.getUserId(firebaseUid);
    const notification = await this.notificationsRepository.findByIdForUser(
      id,
      userId,
    );

    if (!notification) {
      throw new NotFoundException('Notification was not found');
    }

    if (notification.readAt !== null) {
      return notification;
    }

    return this.notificationsRepository.markAsRead(id);
  }

  async readAll(firebaseUid: string) {
    const userId = await this.getUserId(firebaseUid);
    const { count } = await this.notificationsRepository.markAllAsRead(userId);

    return { count };
  }

  notify(input: CreateNotificationInput) {
    return this.notifyMany([input]);
  }

  // Never throws: the user's action is already saved when this runs, so a
  // failed notification must not turn it into an error response.
  async notifyMany(inputs: CreateNotificationInput[]) {
    const recipients = inputs.filter(
      ({ userId, actorId }) => userId !== actorId,
    );

    if (recipients.length === 0) {
      return;
    }

    try {
      await this.notificationsRepository.createMany(recipients);
    } catch (error) {
      this.logger.warn(
        `Could not create ${recipients.length} notification(s): ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private async getUserId(firebaseUid: string) {
    return (await this.usersService.findByFirebaseUid(firebaseUid)).id;
  }
}
