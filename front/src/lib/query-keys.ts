export const matchKeys = {
  all: ['matches'] as const,
  mine: () => [...matchKeys.all, 'mine'] as const,
  detail: (matchId: string) => [...matchKeys.all, 'detail', matchId] as const,
  joinRequests: (matchId: string) => [...matchKeys.all, 'join-requests', matchId] as const,
};

export const notificationKeys = {
  unreadCount: ['notifications', 'unread-count'] as const,
};
