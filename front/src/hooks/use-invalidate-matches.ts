'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { matchKeys } from '@/lib/query-keys';

export function useInvalidateMatches(): () => void {
  const queryClient = useQueryClient();

  return useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: matchKeys.all });
  }, [queryClient]);
}
