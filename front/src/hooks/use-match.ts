'use client';

import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/context/auth-context';
import { ApiError } from '@/lib/api';
import { fetchMatch } from '@/lib/matches';
import type { MatchDetail } from '@/types/match';

type MatchState = {
  match: MatchDetail | null;
  loading: boolean;
  notFound: boolean;
  error: string | null;
};

const ERROR_MESSAGE = 'No pudimos cargar el partido. Probá de nuevo en un momento.';

const INITIAL_STATE: MatchState = {
  match: null,
  loading: true,
  notFound: false,
  error: null,
};

const NOT_FOUND = 404;

export function useMatch(matchId: string) {
  const { user: firebaseUser, loading: sessionLoading } = useAuth();
  const [state, setState] = useState<MatchState>(INITIAL_STATE);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    if (sessionLoading || !firebaseUser) return;

    let active = true;

    fetchMatch(matchId)
      .then((match) => {
        if (active) setState({ match, loading: false, notFound: false, error: null });
      })
      .catch((error: unknown) => {
        if (!active) return;

        setState({
          match: null,
          loading: false,
          notFound: error instanceof ApiError && error.status === NOT_FOUND,
          error: ERROR_MESSAGE,
        });
      });

    return () => {
      active = false;
    };
  }, [sessionLoading, firebaseUser, matchId, reloadToken]);

  return { ...state, loading: sessionLoading || state.loading, reload };
}
