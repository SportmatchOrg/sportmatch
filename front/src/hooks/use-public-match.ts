'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchPublicMatch } from '@/lib/public-matches';
import { matchKeys } from '@/lib/query-keys';

const ERROR_MESSAGE = 'No pudimos cargar el partido. Probá de nuevo en un momento.';

export function usePublicMatch(matchId: string) {
  const { data, isPending, isError } = useQuery({
    queryKey: matchKeys.publicDetail(matchId),
    queryFn: () => fetchPublicMatch(matchId),
  });

  return {
    match: data ?? null,
    loading: isPending,
    notFound: data === null,
    error: isError ? ERROR_MESSAGE : null,
  };
}
