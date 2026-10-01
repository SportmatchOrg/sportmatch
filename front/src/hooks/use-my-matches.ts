'use client';

import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/context/auth-context';
import { fetchMyMatches } from '@/lib/matches';
import type { MyMatches } from '@/types/match';

type MyMatchesState = {
  matches: MyMatches;
  loading: boolean;
  error: string | null;
};

type UseMyMatchesOptions = {
  pollIntervalMs?: number;
};

const ERROR_MESSAGE = 'No pudimos cargar tus partidos. Probá de nuevo en un momento.';

const NO_MATCHES: MyMatches = { organizing: [], playing: [], played: [], requested: [] };

const INITIAL_STATE: MyMatchesState = {
  matches: NO_MATCHES,
  loading: true,
  error: null,
};

export function useMyMatches({ pollIntervalMs }: UseMyMatchesOptions = {}) {
  const { user: firebaseUser, loading: sessionLoading } = useAuth();
  const [state, setState] = useState<MyMatchesState>(INITIAL_STATE);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    if (sessionLoading || !firebaseUser) return;

    let active = true;
    let requestInFlight = false;

    async function load(showError: boolean): Promise<void> {
      if (requestInFlight) return;

      requestInFlight = true;

      try {
        const matches = await fetchMyMatches();

        if (active) setState({ matches, loading: false, error: null });
      } catch {
        if (active && showError) {
          setState({ matches: NO_MATCHES, loading: false, error: ERROR_MESSAGE });
        }
      } finally {
        requestInFlight = false;
      }
    }

    void load(true);

    const interval = pollIntervalMs
      ? window.setInterval(() => {
          void load(false);
        }, pollIntervalMs)
      : null;

    return () => {
      active = false;
      if (interval !== null) window.clearInterval(interval);
    };
  }, [sessionLoading, firebaseUser, pollIntervalMs, reloadToken]);

  return {
    organizing: state.matches.organizing,
    playing: state.matches.playing,
    played: state.matches.played,
    requested: state.matches.requested,
    loading: sessionLoading || state.loading,
    error: state.error,
    reload,
  };
}
