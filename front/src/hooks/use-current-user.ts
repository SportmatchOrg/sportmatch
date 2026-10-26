'use client';

import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/lib/api';
import { userKeys } from '@/lib/query-keys';
import type { User } from '@/types/user';

const ERROR_MESSAGE = 'No pudimos cargar tu perfil. Probá de nuevo en un momento.';

export function useCurrentUser() {
  const { user: firebaseUser, loading: sessionLoading } = useAuth();
  const hasSession = !sessionLoading && !!firebaseUser;
  const { data, isPending, isLoadingError } = useQuery({
    queryKey: userKeys.current(firebaseUser?.uid ?? ''),
    queryFn: ({ signal }) => apiFetch<User>('/users/me', { signal }),
    enabled: hasSession,
  });

  return {
    user: hasSession ? data ?? null : null,
    loading: sessionLoading || (hasSession && isPending),
    error: isLoadingError ? ERROR_MESSAGE : null,
  };
}
