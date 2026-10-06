'use client';

import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/context/auth-context';
import { ApiError } from '@/lib/api';
import { fetchRatingTargets, ratingWindowClosed } from '@/lib/ratings';
import type { PublicUser } from '@/types/match';

const FORBIDDEN = 403;

type RatingTargetsState = {
  targets: PublicUser[];
  players: PublicUser[];
  loading: boolean;
  allowed: boolean;
  error: string | null;
};

const INITIAL_STATE: RatingTargetsState = {
  targets: [],
  players: [],
  loading: true,
  allowed: true,
  error: null,
};

export function useRatingTargets(matchId: string, played: boolean) {
  const { user: firebaseUser, loading: sessionLoading } = useAuth();
  const [state, setState] = useState<RatingTargetsState>(INITIAL_STATE);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setState((previous) => ({ ...previous, loading: true, error: null }));
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    if (!played || sessionLoading || !firebaseUser) return;

    let active = true;

    fetchRatingTargets(matchId)
      .then(({ targets, players }) => {
        if (active) setState({ targets, players, loading: false, allowed: true, error: null });
      })
      .catch((error: unknown) => {
        if (!active) return;

        const unavailable =
          (error instanceof ApiError && error.status === FORBIDDEN) || ratingWindowClosed(error);
        setState({
          targets: [],
          players: [],
          loading: false,
          allowed: !unavailable,
          error: unavailable ? null : 'No pudimos cargar la calificación. Probá de nuevo.',
        });
      });

    return () => {
      active = false;
    };
  }, [firebaseUser, matchId, played, reloadToken, sessionLoading]);

  return {
    targets: state.targets,
    players: state.players,
    loading: played && (sessionLoading || state.loading),
    allowed: state.allowed,
    error: state.error,
    reload,
  };
}
