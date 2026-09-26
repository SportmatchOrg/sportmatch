import { apiFetch } from '@/lib/api';
import type { AppNotification, NotificationCount } from '@/types/notification';

export async function fetchNotifications(): Promise<AppNotification[]> {
  return apiFetch<AppNotification[]>('/notifications');
}

export async function fetchUnreadCount(): Promise<number> {
  const { count } = await apiFetch<NotificationCount>('/notifications/unread-count');
  return count;
}

export async function markAsRead(notificationId: string): Promise<AppNotification> {
  return apiFetch<AppNotification>(`/notifications/${notificationId}/read`, { method: 'PATCH' });
}

export async function markAllAsRead(): Promise<number> {
  const { count } = await apiFetch<NotificationCount>('/notifications/read-all', {
    method: 'PATCH',
  });
  return count;
}

export function withUnreadLabel(label: string, unreadCount: number): string {
  return unreadCount > 0 ? `${label}, ${unreadCount} sin leer` : label;
}
