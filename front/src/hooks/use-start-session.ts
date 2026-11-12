'use client';

import type { User as FirebaseUser } from 'firebase/auth';
import { useCallback } from 'react';

import { useAuth } from '@/context/auth-context';
import { useSplash } from '@/context/splash-context';

export function useStartSession() {
  const { startSession } = useAuth();
  const { showSplash, releaseSplash, hideSplash } = useSplash();

  return useCallback(
    async (firebaseUser: FirebaseUser) => {
      showSplash({ holding: true });

      try {
        await startSession(firebaseUser);
      } catch (caught) {
        hideSplash();
        throw caught;
      }

      releaseSplash();
    },
    [startSession, showSplash, releaseSplash, hideSplash]
  );
}
