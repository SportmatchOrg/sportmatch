'use client';

import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useAuth } from '@/context/auth-context';
import { fetchJoinRequests, type JoinRequest } from '@/lib/join-requests';
import { matchKeys } from '@/lib/query-keys';

const ERROR_MESSAGE = 'No pudimos cargar las solicitudes. Probá de nuevo en un momento.';
const POLL_INTERVAL_MS = 15_000;

const NO_JOIN_REQUESTS: JoinRequest[] = [];

export function useJoinRequests(matchId: string, isOrganizer: boolean) {
  const { user: firebaseUser, loading: sessionLoading } = useAuth();

  const { data, isPending, isLoadingError, refetch } = useQuery({
    queryKey: matchKeys.joinRequests(matchId),
    queryFn: () => fetchJoinRequests(matchId),
    enabled: isOrganizer && !sessionLoading && !!firebaseUser,
    refetchInterval: POLL_INTERVAL_MS,
  });

  const reload = useCallback(() => void refetch(), [refetch]);

  return {
    joinRequests: isOrganizer ? (data ?? NO_JOIN_REQUESTS) : NO_JOIN_REQUESTS,
    loading: isOrganizer && (sessionLoading || isPending),
    error: isOrganizer && isLoadingError ? ERROR_MESSAGE : null,
    reload,
  };
}
