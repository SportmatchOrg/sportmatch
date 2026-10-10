'use client';

import { useQuery } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';

import { useAuth } from '@/context/auth-context';
import { fetchUnreadCount } from '@/lib/notifications';
import { notificationKeys } from '@/lib/query-keys';

type UnreadCountContextValue = {
  count: number;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

const POLL_INTERVAL_MS = 30_000;

const ERROR_MESSAGE = 'No pudimos cargar tus notificaciones. Probá de nuevo en un momento.';

const UnreadCountContext = createContext<UnreadCountContextValue | undefined>(undefined);

export function UnreadCountProvider({ children }: { children: ReactNode }) {
  const { user: firebaseUser, loading: sessionLoading } = useAuth();

  const { data, isPending, isLoadingError, refetch } = useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: fetchUnreadCount,
    enabled: !sessionLoading && !!firebaseUser,
    refetchInterval: POLL_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });

  const reload = useCallback(() => void refetch(), [refetch]);

  const value = useMemo(
    () => ({
      count: data ?? 0,
      loading: sessionLoading || isPending,
      error: isLoadingError ? ERROR_MESSAGE : null,
      reload,
    }),
    [data, sessionLoading, isPending, isLoadingError, reload]
  );

  return <UnreadCountContext.Provider value={value}>{children}</UnreadCountContext.Provider>;
}

export function useUnreadCount(): UnreadCountContextValue {
  const context = useContext(UnreadCountContext);

  if (context === undefined) {
    throw new Error('useUnreadCount must be used within an <UnreadCountProvider>');
  }

  return context;
}
