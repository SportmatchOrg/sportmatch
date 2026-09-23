'use client';

import { useEffect, useState } from 'react';

import { useAuth } from '@/context/auth-context';
import { fetchMatches } from '@/lib/matches';
import type { Match } from '@/types/match';

type MatchesState = {
  matches: Match[];
  loading: boolean;
  error: string | null;
};

const ERROR_MESSAGE = 'No pudimos cargar los partidos. Probá de nuevo en un momento.';

const INITIAL_STATE: MatchesState = { matches: [], loading: true, error: null };

export function useMatches(): MatchesState {
  const { user: firebaseUser, loading: sessionLoading } = useAuth();
  const [state, setState] = useState<MatchesState>(INITIAL_STATE);

  useEffect(() => {
    if (sessionLoading || !firebaseUser) return;

    let active = true;

    fetchMatches()
      .then((matches) => {
        if (active) setState({ matches, loading: false, error: null });
      })
      .catch(() => {
        if (active) setState({ matches: [], loading: false, error: ERROR_MESSAGE });
      });

    return () => {
      active = false;
    };
  }, [sessionLoading, firebaseUser]);

  return { ...state, loading: sessionLoading || state.loading };
}
