'use client';

import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useAuth } from '@/context/auth-context';
import { fetchMatches, MATCHES_ERROR_MESSAGE } from '@/lib/matches';
import { matchKeys } from '@/lib/query-keys';
import type { Match, MatchesQuery } from '@/types/match';

const STALE_TIME_MS = 5_000;

const NO_FILTERS: MatchesQuery = {};

const NO_MATCHES: Match[] = [];

export const matchesQueryOptions = (query: MatchesQuery) =>
  queryOptions({
    queryKey: matchKeys.list(query),
    queryFn: () => fetchMatches(query),
    staleTime: STALE_TIME_MS,
  });

export function useMatches(query: MatchesQuery = NO_FILTERS, enabled = true) {
  const { user: firebaseUser, loading: sessionLoading } = useAuth();

  const { data, isPending, isLoadingError, refetch } = useQuery({
    ...matchesQueryOptions(query),
    enabled: enabled && !sessionLoading && !!firebaseUser,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const reload = useCallback(() => void refetch(), [refetch]);

  return {
    matches: data ?? NO_MATCHES,
    loading: sessionLoading || isPending,
    error: isLoadingError ? MATCHES_ERROR_MESSAGE : null,
    reload,
  };
}
