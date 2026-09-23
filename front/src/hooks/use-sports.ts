'use client';

import { useEffect, useState } from 'react';

import { useAuth } from '@/context/auth-context';
import { fetchSports } from '@/lib/sports';
import type { Sport } from '@/types/match';

type SportsState = {
  sports: Sport[];
  loading: boolean;
  error: string | null;
};

const ERROR_MESSAGE = 'No pudimos cargar los deportes. Probá de nuevo en un momento.';

const INITIAL_STATE: SportsState = { sports: [], loading: true, error: null };

export function useSports(): SportsState {
  const { user: firebaseUser, loading: sessionLoading } = useAuth();
  const [state, setState] = useState<SportsState>(INITIAL_STATE);

  useEffect(() => {
    if (sessionLoading || !firebaseUser) return;

    let active = true;

    fetchSports()
      .then((sports) => {
        if (active) setState({ sports, loading: false, error: null });
      })
      .catch(() => {
        if (active) setState({ sports: [], loading: false, error: ERROR_MESSAGE });
      });

    return () => {
      active = false;
    };
  }, [sessionLoading, firebaseUser]);

  return { ...state, loading: sessionLoading || state.loading };
}
