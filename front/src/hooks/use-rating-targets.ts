'use client';

import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/context/auth-context';
import { ApiError } from '@/lib/api';
import { fetchRatingTargets } from '@/lib/ratings';
import type { PublicUser } from '@/types/partido';

const FORBIDDEN = 403;

type RatingTargetsState = {
  targets: PublicUser[];
  loading: boolean;
  allowed: boolean;
};

const INITIAL_STATE: RatingTargetsState = {
  targets: [],
  loading: true,
  allowed: true,
};

export function useRatingTargets(matchId: string, played: boolean) {
  const { user: firebaseUser, loading: sessionLoading } = useAuth();
  const [state, setState] = useState<RatingTargetsState>(INITIAL_STATE);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    if (!played || sessionLoading || !firebaseUser) return;

    let active = true;

    fetchRatingTargets(matchId)
      .then(({ targets }) => {
        if (active) setState({ targets, loading: false, allowed: true });
      })
      .catch((error: unknown) => {
        if (!active) return;

        const forbidden = error instanceof ApiError && error.status === FORBIDDEN;

        setState({ targets: [], loading: false, allowed: !forbidden });
      });

    return () => {
      active = false;
    };
  }, [firebaseUser, matchId, played, reloadToken, sessionLoading]);

  return {
    targets: state.targets,
    loading: played && (sessionLoading || state.loading),
    allowed: state.allowed,
    reload,
  };
}
