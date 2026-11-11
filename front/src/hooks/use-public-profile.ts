'use client';

import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { ApiError } from '@/lib/api';
import { matchKeys, userKeys } from '@/lib/query-keys';
import { fetchPlayedBy, fetchPublicProfile } from '@/lib/users';

const ERROR_MESSAGE = 'No pudimos cargar este perfil. Probá de nuevo en un momento.';

export function usePublicProfile(userId: string) {
  const { user: firebaseUser, loading: sessionLoading } = useAuth();
  const hasSession = !sessionLoading && !!firebaseUser;
  const profile = useQuery({
    queryKey: userKeys.publicProfile(userId),
    queryFn: ({ signal }) => fetchPublicProfile(userId, signal),
    enabled: hasSession,
  });
  const matches = useQuery({
    queryKey: matchKeys.playedBy(userId),
    queryFn: ({ signal }) => fetchPlayedBy(userId, signal),
    enabled: hasSession,
  });
  const error = profile.error ?? matches.error;
  const notFound = error instanceof ApiError && error.status === 404;

  return {
    profile: hasSession ? profile.data ?? null : null,
    matches: hasSession ? matches.data ?? [] : [],
    loading: sessionLoading || (hasSession && (profile.isPending || matches.isPending)),
    notFound,
    error: (profile.isLoadingError || matches.isLoadingError) && !notFound ? ERROR_MESSAGE : null,
  };
}
