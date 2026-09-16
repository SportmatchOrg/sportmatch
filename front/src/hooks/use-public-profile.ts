'use client';

import { useEffect, useState } from 'react';

import { useAuth } from '@/context/auth-context';
import { ApiError } from '@/lib/api';
import { fetchPlayedBy, fetchPublicProfile } from '@/lib/users';
import type { Partido } from '@/types/partido';
import type { PublicProfile } from '@/types/user';

type PublicProfileResult = {
  profile: PublicProfile | null;
  matches: Partido[];
  loading: boolean;
  notFound: boolean;
  error: string | null;
};

type PublicProfileState = PublicProfileResult & {
  loadedUserId: string | null;
};

const NOT_FOUND = 404;
const ERROR_MESSAGE = 'No pudimos cargar este perfil. Probá de nuevo en un momento.';

const INITIAL_STATE: PublicProfileState = {
  loadedUserId: null,
  profile: null,
  matches: [],
  loading: true,
  notFound: false,
  error: null,
};

export function usePublicProfile(userId: string): PublicProfileResult {
  const { user: firebaseUser, loading: sessionLoading } = useAuth();
  const [state, setState] = useState<PublicProfileState>(INITIAL_STATE);

  useEffect(() => {
    if (sessionLoading || !firebaseUser) return;

    let active = true;

    Promise.all([fetchPublicProfile(userId), fetchPlayedBy(userId)])
      .then(([profile, matches]) => {
        if (active) {
          setState({
            loadedUserId: userId,
            profile,
            matches,
            loading: false,
            notFound: false,
            error: null,
          });
        }
      })
      .catch((error: unknown) => {
        if (!active) return;

        const notFound = error instanceof ApiError && error.status === NOT_FOUND;
        setState({
          loadedUserId: userId,
          profile: null,
          matches: [],
          loading: false,
          notFound,
          error: notFound ? null : ERROR_MESSAGE,
        });
      });

    return () => {
      active = false;
    };
  }, [sessionLoading, firebaseUser, userId]);

  const { loadedUserId, ...result } = state;

  return {
    ...result,
    loading: sessionLoading || state.loading || loadedUserId !== userId,
  };
}
