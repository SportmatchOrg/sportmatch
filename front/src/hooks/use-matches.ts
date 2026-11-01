'use client';

import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useAuth } from '@/context/auth-context';
import { fetchMatches } from '@/lib/matches';
import { matchKeys } from '@/lib/query-keys';
import type { Match, MatchesQuery } from '@/types/match';

const ERROR_MESSAGE = 'No pudimos cargar los partidos. Probá de nuevo en un momento.';

const STALE_TIME_MS = 5_000;

const NO_FILTERS: MatchesQuery = {};

const NO_MATCHES: Match[] = [];

export const matchesQueryOptions = (query: MatchesQuery) =>
  queryOptions({
    queryKey: matchKeys.list(query),
    queryFn: () => fetchMatches(query),
    staleTime: STALE_TIME_MS,
  });

export function useMatches(query: MatchesQuery = NO_FILTERS) {
  const { user: firebaseUser, loading: sessionLoading } = useAuth();

  const { data, isPending, isLoadingError, refetch } = useQuery({
    ...matchesQueryOptions(query),
    enabled: !sessionLoading && !!firebaseUser,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const reload = useCallback(() => void refetch(), [refetch]);

  return {
    matches: data ?? NO_MATCHES,
    loading: sessionLoading || isPending,
    error: isLoadingError ? ERROR_MESSAGE : null,
    reload,
  };
}
