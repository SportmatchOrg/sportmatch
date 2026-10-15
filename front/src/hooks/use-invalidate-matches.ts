'use client';

import { useQueryClient, type InvalidateOptions } from '@tanstack/react-query';
import { useCallback } from 'react';

import { matchKeys } from '@/lib/query-keys';

export function useInvalidateMatches(): (options?: InvalidateOptions) => Promise<void> {
  const queryClient = useQueryClient();

  return useCallback((options?: InvalidateOptions) => {
    return queryClient.invalidateQueries({ queryKey: matchKeys.all }, options);
  }, [queryClient]);
}
