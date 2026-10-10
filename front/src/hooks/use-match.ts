'use client';

import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useAuth } from '@/context/auth-context';
import { ApiError } from '@/lib/api';
import { fetchMatch } from '@/lib/matches';
import { matchKeys } from '@/lib/query-keys';

const ERROR_MESSAGE = 'No pudimos cargar el partido. Probá de nuevo en un momento.';

const NOT_FOUND = 404;

export function useMatch(matchId: string) {
  const { user: firebaseUser, loading: sessionLoading } = useAuth();

  const { data, error, isPending, isLoadingError, refetch } = useQuery({
    queryKey: matchKeys.detail(matchId),
    queryFn: () => fetchMatch(matchId),
    enabled: !sessionLoading && !!firebaseUser,
  });

  const reload = useCallback(() => void refetch(), [refetch]);

  return {
    match: data ?? null,
    loading: sessionLoading || isPending,
    notFound: isLoadingError && error instanceof ApiError && error.status === NOT_FOUND,
    error: isLoadingError ? ERROR_MESSAGE : null,
    reload,
  };
}
