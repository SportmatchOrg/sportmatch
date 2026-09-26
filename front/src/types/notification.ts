import type { MatchStatus, PublicUser, Sport } from '@/types/match';

export type NotificationType =
  | 'JOIN_REQUEST_RECEIVED'
  | 'JOIN_REQUEST_ACCEPTED'
  | 'JOIN_REQUEST_REJECTED'
  | 'MATCH_CANCELED'
  | 'PARTICIPANT_LEFT'
  | 'MATCH_UPDATED'
  | 'NO_SHOW_CONFIRMED'
  | 'USER_SUSPENDED';

export type NotificationMatch = {
  id: string;
  date: string;
  location: string;
  status: MatchStatus;
  sport: Sport;
};

export type AppNotification = {
  id: string;
  type: NotificationType;
  readAt: string | null;
  createdAt: string;
  payload: Record<string, unknown> | null;
  actor: PublicUser | null;
  match: NotificationMatch | null;
};

export type NotificationCount = {
  count: number;
};
