'use client';

import { queryOptions, useQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { sportKeys } from '@/lib/query-keys';
import { fetchSports } from '@/lib/sports';
import type { Sport } from '@/types/match';

const ERROR_MESSAGE = 'No pudimos cargar los deportes. Probá de nuevo en un momento.';

const NO_SPORTS: Sport[] = [];

export const sportsQueryOptions = () =>
  queryOptions({
    queryKey: sportKeys.all,
    queryFn: fetchSports,
    staleTime: Infinity,
  });

export function useSports() {
  const { user: firebaseUser, loading: sessionLoading } = useAuth();

  const { data, isPending, isLoadingError } = useQuery({
    ...sportsQueryOptions(),
    enabled: !sessionLoading && !!firebaseUser,
  });

  return {
    sports: data ?? NO_SPORTS,
    loading: sessionLoading || isPending,
    error: isLoadingError ? ERROR_MESSAGE : null,
  };
}
