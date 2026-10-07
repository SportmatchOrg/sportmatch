import { apiFetch } from '@/lib/api';
import { PROFILE_HREF } from '@/lib/nav-items';
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

export async function savePushSubscription(subscription: PushSubscription): Promise<void> {
  const { endpoint, keys } = subscription.toJSON();

  if (!endpoint || !keys?.p256dh || !keys.auth) {
    throw new Error('Invalid push subscription');
  }

  await apiFetch('/push-subscriptions', {
    method: 'POST',
    body: JSON.stringify({
      endpoint,
      keys: { p256dh: keys.p256dh, auth: keys.auth },
    }),
  });
}

export function withUnreadLabel(label: string, unreadCount: number): string {
  return unreadCount > 0 ? `${label}, ${unreadCount} sin leer` : label;
}

export function notificationHref(notification: AppNotification): string {
  return notification.match ? `/partidos/${notification.match.id}` : PROFILE_HREF;
}
