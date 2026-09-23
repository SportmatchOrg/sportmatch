import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { NotificationsRepository } from './notifications.repository';
import type { CreateNotificationInput } from './notifications.repository';

@Injectable()
export class NotificationsService {
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
    return this.notificationsRepository.create(input);
  }

  private async getUserId(firebaseUid: string) {
    return (await this.usersService.findByFirebaseUid(firebaseUid)).id;
  }
}
