'use client';

import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useAuth } from '@/context/auth-context';
import { fetchMyMatches } from '@/lib/matches';
import { matchKeys } from '@/lib/query-keys';
import type { MyMatches } from '@/types/match';

type UseMyMatchesOptions = {
  pollIntervalMs?: number;
};

const ERROR_MESSAGE = 'No pudimos cargar tus partidos. Probá de nuevo en un momento.';

const NO_MATCHES: MyMatches = { organizing: [], playing: [], played: [], requested: [] };

export function useMyMatches({ pollIntervalMs }: UseMyMatchesOptions = {}) {
  const { user: firebaseUser, loading: sessionLoading } = useAuth();

  const { data, isPending, isLoadingError, refetch } = useQuery({
    queryKey: matchKeys.mine(),
    queryFn: fetchMyMatches,
    enabled: !sessionLoading && !!firebaseUser,
    refetchInterval: pollIntervalMs ?? false,
  });

  const reload = useCallback(() => void refetch(), [refetch]);
  const matches = data ?? NO_MATCHES;

  return {
    organizing: matches.organizing,
    playing: matches.playing,
    played: matches.played,
    requested: matches.requested,
    loading: sessionLoading || isPending,
    error: isLoadingError ? ERROR_MESSAGE : null,
    reload,
  };
}
