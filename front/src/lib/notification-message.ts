import { SPORT_LABEL } from '@/types/match';
import type { AppNotification, NotificationType } from '@/types/notification';

export type NotificationMessage = {
  actor: string | null;
  text: string;
};

type MessageTemplate = {
  withActor: boolean;
  text: (sport: string, payload: AppNotification['payload']) => string;
};

// The actor's account can be deleted after the fact, which nulls the relation.
const UNKNOWN_ACTOR = 'Alguien';

const DAY_FORMAT = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long' });

function readPayload(payload: AppNotification['payload'], key: string): string {
  const value = payload?.[key];
  return typeof value === 'string' ? value : '';
}

function formatDay(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : DAY_FORMAT.format(date);
}

const TEMPLATES: Record<NotificationType, MessageTemplate> = {
  JOIN_REQUEST_RECEIVED: {
    withActor: true,
    text: (sport) => `quiere sumarse a tu partido de ${sport}`,
  },
  JOIN_REQUEST_ACCEPTED: {
    withActor: true,
    text: (sport) => `te aceptó en el partido de ${sport}`,
  },
  JOIN_REQUEST_REJECTED: {
    withActor: false,
    text: (sport) => `Tu solicitud para ${sport} no fue aceptada`,
  },
  MATCH_CANCELED: {
    withActor: false,
    text: (sport, payload) =>
      `Se canceló el partido de ${sport} · Motivo: ${readPayload(payload, 'reason')}`,
  },
  PARTICIPANT_LEFT: {
    withActor: true,
    text: (sport) => `se bajó de tu partido de ${sport}`,
  },
  MATCH_UPDATED: {
    withActor: false,
    text: (sport) => `Cambió la fecha o el lugar del partido de ${sport}`,
  },
  NO_SHOW_CONFIRMED: {
    withActor: false,
    text: (sport) => `Te marcaron una falta en el partido de ${sport}`,
  },
  USER_SUSPENDED: {
    withActor: false,
    text: (_sport, payload) =>
      `Estás suspendido hasta el ${formatDay(readPayload(payload, 'until'))} por faltas`,
  },
};

export function notificationMessage(notification: AppNotification): NotificationMessage {
  const template = TEMPLATES[notification.type];
  const sport = notification.match ? SPORT_LABEL[notification.match.sport.name] : '';

  return {
    actor: template.withActor ? (notification.actor?.name ?? UNKNOWN_ACTOR) : null,
    text: template.text(sport, notification.payload),
  };
}
