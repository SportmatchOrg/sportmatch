'use client';

import { useEffect, useState } from 'react';

import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/lib/api';
import type { User } from '@/types/user';

type CurrentUserState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

const ERROR_MESSAGE = 'No pudimos cargar tu perfil. Probá de nuevo en un momento.';

const INITIAL_STATE: CurrentUserState = { user: null, loading: true, error: null };

export function useCurrentUser(): CurrentUserState {
  const { user: firebaseUser, loading: sessionLoading } = useAuth();
  const [state, setState] = useState<CurrentUserState>(INITIAL_STATE);

  useEffect(() => {
    if (sessionLoading || !firebaseUser) return;

    let active = true;

    apiFetch<User>('/users/me')
      .then((user) => {
        if (active) setState({ user, loading: false, error: null });
      })
      .catch(() => {
        if (active) setState({ user: null, loading: false, error: ERROR_MESSAGE });
      });

    return () => {
      active = false;
    };
  }, [sessionLoading, firebaseUser]);

  return { ...state, loading: sessionLoading || state.loading };
}
