'use client';

import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { fetchModerationHistory } from '@/lib/admin-reports';
import { adminUserKeys } from '@/lib/query-keys';
import type { ModerationAction } from '@/types/report';

const ERROR_MESSAGE = 'No pudimos cargar el historial. Probá de nuevo en un momento.';

const NO_ACTIONS: ModerationAction[] = [];

export function useModerationHistory(userId: string) {
  const { data, isPending, isLoadingError, refetch } = useQuery({
    queryKey: adminUserKeys.moderation(userId),
    queryFn: () => fetchModerationHistory(userId),
  });

  const reload = useCallback(() => void refetch(), [refetch]);

  return {
    actions: data ?? NO_ACTIONS,
    loading: isPending,
    error: isLoadingError ? ERROR_MESSAGE : null,
    reload,
  };
}
