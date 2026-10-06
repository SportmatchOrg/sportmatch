'use client';

import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/context/auth-context';
import { fetchMatches } from '@/lib/matches';
import type { Match, MatchesQuery } from '@/types/match';

type MatchesState = {
  matches: Match[];
  loading: boolean;
  error: string | null;
};

const ERROR_MESSAGE = 'No pudimos cargar los partidos. Probá de nuevo en un momento.';

const INITIAL_STATE: MatchesState = { matches: [], loading: true, error: null };

export function useMatches(query?: MatchesQuery) {
  const { user: firebaseUser, loading: sessionLoading } = useAuth();
  const [state, setState] = useState<MatchesState>(INITIAL_STATE);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setState((current) => (current.error ? { ...current, loading: true, error: null } : current));
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    if (sessionLoading || !firebaseUser) return;

    let active = true;

    fetchMatches(query)
      .then((matches) => {
        if (active) setState({ matches, loading: false, error: null });
      })
      .catch(() => {
        if (active) setState({ matches: [], loading: false, error: ERROR_MESSAGE });
      });

    return () => {
      active = false;
    };
  }, [sessionLoading, firebaseUser, query, reloadToken]);

  return { ...state, loading: sessionLoading || state.loading, reload };
}
