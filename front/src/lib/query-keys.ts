import type { ReportStatus } from '@/types/report';

export const matchKeys = {
  all: ['matches'] as const,
  mine: () => [...matchKeys.all, 'mine'] as const,
  myActions: () => [...matchKeys.all, 'my-actions'] as const,
  detail: (matchId: string) => [...matchKeys.all, 'detail', matchId] as const,
  publicDetail: (matchId: string) => [...matchKeys.all, 'public', matchId] as const,
  playedBy: (userId: string) => [...matchKeys.all, 'played-by', userId] as const,
  joinRequests: (matchId: string) => [...matchKeys.all, 'join-requests', matchId] as const,
  invitationResponse: (matchId: string) => [...matchKeys.all, 'invitation-response', matchId] as const,
  participation: (matchId: string) => [...matchKeys.all, 'participation', matchId] as const,
};

export const notificationKeys = {
  unreadCount: ['notifications', 'unread-count'] as const,
};

export const userKeys = {
  all: ['users'] as const,
  current: (firebaseUid: string) => [...userKeys.all, 'me', firebaseUid] as const,
  publicProfile: (userId: string) => [...userKeys.all, 'profile', userId] as const,
  photo: (userId: string) => [...userKeys.all, 'photo', userId] as const,
};

export const adminReportKeys = {
  all: ['admin-reports'] as const,
  list: (status: ReportStatus) => [...adminReportKeys.all, 'list', status] as const,
};
