import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { NotificationType } from '../generated/prisma/client';
import {
  PushSubscriptionsService,
  type PushMessage,
} from '../push-subscriptions/push-subscriptions.service';
import { UsersService } from '../users/users.service';
import { NotificationsRepository } from './notifications.repository';
import type { CreateNotificationInput } from './notifications.repository';

const PUSH_COPY: Record<NotificationType, { title: string; body: string }> = {
  JOIN_REQUEST_RECEIVED: {
    title: 'Nueva solicitud',
    body: 'Un jugador quiere sumarse a tu partido.',
  },
  JOIN_REQUEST_ACCEPTED: {
    title: 'Solicitud aceptada',
    body: 'Te aceptaron en un partido.',
  },
  JOIN_REQUEST_REJECTED: {
    title: 'Solicitud rechazada',
    body: 'Tu solicitud para un partido no fue aceptada.',
  },
  MATCH_CANCELED: {
    title: 'Partido cancelado',
    body: 'Se canceló el partido.',
  },
  PARTICIPANT_LEFT: {
    title: 'Un jugador se bajó',
    body: 'Un jugador se bajó de tu partido.',
  },
  MATCH_UPDATED: {
    title: 'Partido editado',
    body: 'Cambió la fecha, hora o lugar de un partido.',
  },
  NO_SHOW_CONFIRMED: {
    title: 'Te marcaron una falta',
    body: 'Se confirmó una falta en uno de tus partidos.',
  },
  USER_SUSPENDED: {
    title: 'Quedaste suspendido',
    body: 'Estás suspendido por faltas.',
  },
  INVITATION_RECEIVED: {
    title: 'Te invitaron a un partido',
    body: 'El organizador te invitó a sumarte a su partido.',
  },
  INVITATION_ACCEPTED: {
    title: 'Invitación aceptada',
    body: 'Un jugador aceptó tu invitación.',
  },
  INVITATION_REJECTED: {
    title: 'Invitación rechazada',
    body: 'Un jugador no aceptó tu invitación.',
  },
};

function toPushMessage(input: CreateNotificationInput): PushMessage {
  const copy = PUSH_COPY[input.type];
  let body = copy.body;

  if (input.type === 'MATCH_CANCELED') {
    const payload = input.payload;
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      const reason: unknown = (payload as Record<string, unknown>).reason;
      if (typeof reason === 'string') body += ` Motivo: ${reason}`;
    }
  }

  return {
    userId: input.userId,
    title: copy.title,
    body,
    url: input.matchId
      ? `/partidos/${encodeURIComponent(input.matchId)}`
      : '/notificaciones',
  };
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly usersService: UsersService,
    private readonly pushSubscriptionsService: PushSubscriptionsService,
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
      return;
    }

    try {
      await this.pushSubscriptionsService.sendMany(
        recipients.map(toPushMessage),
      );
    } catch {
      this.logger.warn('Could not dispatch push notifications');
    }
  }

  private async getUserId(firebaseUid: string) {
    return (await this.usersService.findByFirebaseUid(firebaseUid)).id;
  }
}
