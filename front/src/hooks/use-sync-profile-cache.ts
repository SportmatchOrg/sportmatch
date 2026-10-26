'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useInvalidateMatches } from '@/hooks/use-invalidate-matches';
import { userKeys } from '@/lib/query-keys';
import type { PublicProfile, User } from '@/types/user';

type ProfileFields = Partial<Pick<PublicProfile, 'name' | 'city' | 'level' | 'sports' | 'photoUrl'>>;

export function useSyncProfileCache() {
  const queryClient = useQueryClient();
  const invalidateMatches = useInvalidateMatches();

  return useCallback(async (userId: string, firebaseUid: string, fields: ProfileFields) => {
    const currentKey = userKeys.current(firebaseUid);
    const publicKey = userKeys.publicProfile(userId);

    await Promise.all([
      queryClient.cancelQueries({ queryKey: currentKey, exact: true }),
      queryClient.cancelQueries({ queryKey: publicKey, exact: true }),
    ]);
    queryClient.setQueryData<User>(currentKey, (current) => current ? { ...current, ...fields } : undefined);
    queryClient.setQueryData<PublicProfile>(publicKey, (current) => current ? { ...current, ...fields } : undefined);

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: currentKey, exact: true }),
      queryClient.invalidateQueries({ queryKey: publicKey, exact: true }),
      invalidateMatches(),
    ]);
  }, [queryClient, invalidateMatches]);
}
