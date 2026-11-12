'use client';

import { GoogleAuthProvider, signInWithPopup, type User as FirebaseUser } from 'firebase/auth';
import { useCallback } from 'react';

import { useSplash } from '@/context/splash-context';
import { useStartSession } from '@/hooks/use-start-session';
import { watchAuthPopupResult } from '@/lib/auth-popup';
import { auth } from '@/lib/firebase';

export function useGoogleSignIn() {
  const startSession = useStartSession();
  const { showSplash, hideSplash } = useSplash();

  return useCallback(async () => {
    const stopWatching = watchAuthPopupResult(() => showSplash({ holding: true }));
    let firebaseUser: FirebaseUser;

    try {
      ({ user: firebaseUser } = await signInWithPopup(auth, new GoogleAuthProvider()));
    } catch (caught) {
      hideSplash();
      throw caught;
    } finally {
      stopWatching();
    }

    await startSession(firebaseUser);
  }, [startSession, showSplash, hideSplash]);
}
