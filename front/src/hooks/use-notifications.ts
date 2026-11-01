'use client';

import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useAuth } from '@/context/auth-context';
import { fetchNotifications } from '@/lib/notifications';
import { notificationKeys } from '@/lib/query-keys';
import type { AppNotification } from '@/types/notification';

const ERROR_MESSAGE = 'No pudimos cargar tus notificaciones. Probá de nuevo en un momento.';

const NO_NOTIFICATIONS: AppNotification[] = [];

export function useNotifications() {
  const { user: firebaseUser, loading: sessionLoading } = useAuth();

  const { data, isPending, isLoadingError, refetch } = useQuery({
    queryKey: notificationKeys.list,
    queryFn: fetchNotifications,
    enabled: !sessionLoading && !!firebaseUser,
  });

  const reload = useCallback(() => void refetch(), [refetch]);

  return {
    notifications: data ?? NO_NOTIFICATIONS,
    loading: sessionLoading || isPending,
    error: isLoadingError ? ERROR_MESSAGE : null,
    reload,
  };
}
