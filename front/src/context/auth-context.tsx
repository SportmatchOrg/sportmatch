'use client';

import type { User as FirebaseUser } from 'firebase/auth';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { apiFetch } from '@/lib/api';
import { closeSession, openSession } from '@/lib/session';
import { onSessionEnded } from '@/lib/session-events';
import type { SessionUser } from '@/types/session';
import type { CurrentUser } from '@/types/user';

type AuthContextValue = {
  user: SessionUser | null;
  loading: boolean;
  startSession: (firebaseUser: FirebaseUser) => Promise<void>;
  endSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchSessionUser(): Promise<SessionUser> {
  const { firebaseUid, email, signInProvider } = await apiFetch<CurrentUser>('/users/me');

  return { uid: firebaseUid, email, signInProvider };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetchSessionUser()
      .catch(() => null)
      .then((sessionUser) => {
        if (!active) return;
        setUser(sessionUser);
        setLoading(false);
      });

    const unsubscribe = onSessionEnded(() => setUser(null));

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const startSession = useCallback(async (firebaseUser: FirebaseUser) => {
    await openSession(firebaseUser);
    setUser(await fetchSessionUser());
  }, []);

  const endSession = useCallback(async () => {
    await closeSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, startSession, endSession }),
    [user, loading, startSession, endSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }

  return context;
}
