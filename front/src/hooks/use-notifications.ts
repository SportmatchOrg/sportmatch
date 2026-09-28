'use client';

import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/context/auth-context';
import { fetchNotifications } from '@/lib/notifications';
import type { AppNotification } from '@/types/notification';

type NotificationsState = {
  notifications: AppNotification[];
  loading: boolean;
  error: string | null;
};

const ERROR_MESSAGE = 'No pudimos cargar tus notificaciones. Probá de nuevo en un momento.';

const INITIAL_STATE: NotificationsState = {
  notifications: [],
  loading: true,
  error: null,
};

export function useNotifications() {
  const { user: firebaseUser, loading: sessionLoading } = useAuth();
  const [state, setState] = useState<NotificationsState>(INITIAL_STATE);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setState((current) => (current.error ? { ...current, loading: true, error: null } : current));
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    if (sessionLoading || !firebaseUser) return;

    let active = true;

    fetchNotifications()
      .then((notifications) => {
        if (active) setState({ notifications, loading: false, error: null });
      })
      .catch(() => {
        if (active) setState({ notifications: [], loading: false, error: ERROR_MESSAGE });
      });

    return () => {
      active = false;
    };
  }, [sessionLoading, firebaseUser, reloadToken]);

  return { ...state, loading: sessionLoading || state.loading, reload };
}
