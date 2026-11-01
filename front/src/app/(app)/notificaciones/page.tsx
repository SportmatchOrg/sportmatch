'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Bell, TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  NotificationList,
  NotificationListSkeleton,
} from '@/components/notifications/notification-list';
import { PushNotificationsControl } from '@/components/notifications/push-notifications-control';
import { EmptyState } from '@/components/ui/empty-state';
import { RetryButton } from '@/components/ui/retry-button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { TOAST_DURATION, Toast } from '@/components/ui/toast';
import { useUnreadCount } from '@/context/unread-count-context';
import { useNotifications } from '@/hooks/use-notifications';
import { markAllAsRead, markAsRead, notificationHref } from '@/lib/notifications';
import { notificationKeys } from '@/lib/query-keys';
import type { AppNotification } from '@/types/notification';

const PAGE = 'flex w-full flex-col gap-6 px-5 py-6 lg:px-6 lg:py-10 xl:px-8';

const MARK_ALL =
  'text-caption font-semibold text-brand transition-colors hover:text-brand-bright disabled:cursor-not-allowed disabled:text-ink-32';

const MARK_ALL_ERROR = 'No pudimos marcarlas como leídas. Probá de nuevo.';

export default function NotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { notifications, loading, error, reload } = useNotifications();
  const { count: unreadCount } = useUnreadCount();
  const [markingAll, setMarkingAll] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function refreshNotifications() {
    return queryClient.invalidateQueries({ queryKey: notificationKeys.all });
  }

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [toast]);

  function open(notification: AppNotification) {
    if (notification.readAt === null) {
      void markAsRead(notification.id)
        .then(refreshNotifications)
        .catch(() => undefined);
    }

    router.push(notificationHref(notification));
  }

  async function markAll() {
    setMarkingAll(true);

    try {
      await markAllAsRead();
      await refreshNotifications();
    } catch {
      setToast(MARK_ALL_ERROR);
    } finally {
      setMarkingAll(false);
    }
  }

  function renderContent() {
    if (loading) return <NotificationListSkeleton />;

    if (error) {
      return (
        <div className="py-16">
          <EmptyState
            icon={TriangleAlert}
            title="No pudimos cargar tus notificaciones"
            text={error}
            action={<RetryButton onRetry={reload} />}
          />
        </div>
      );
    }

    if (notifications.length === 0) {
      return (
        <div className="py-16">
          <EmptyState
            icon={Bell}
            title="No tenés notificaciones"
            text="Acá vas a ver las novedades de tus partidos y solicitudes."
          />
        </div>
      );
    }

    return <NotificationList notifications={notifications} onSelect={open} />;
  }

  return (
    <main className={PAGE}>
      <ScreenHeader
        overline="Actividad"
        title="Notificaciones"
        action={
          <div className="flex items-center justify-between gap-4">
            <span className="text-caption text-ink-46">{unreadCount} sin leer</span>
            <button
              type="button"
              onClick={markAll}
              disabled={unreadCount === 0 || markingAll}
              className={MARK_ALL}
            >
              Marcar todas como leídas
            </button>
          </div>
        }
      />

      <PushNotificationsControl />

      {renderContent()}

      {toast && (
        <div className="fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 lg:bottom-8">
          <Toast message={toast} tone="danger" />
        </div>
      )}
    </main>
  );
}
