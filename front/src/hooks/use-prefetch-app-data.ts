'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { myMatchesQueryOptions } from '@/hooks/use-my-matches';
import { sportsQueryOptions } from '@/hooks/use-sports';

export function usePrefetchAppData(enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    void queryClient.prefetchQuery(sportsQueryOptions());
    void queryClient.prefetchQuery(myMatchesQueryOptions());
  }, [enabled, queryClient]);
}
