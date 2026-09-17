'use client';

import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/context/auth-context';
import { fetchJoinRequests, type JoinRequest } from '@/lib/join-requests';

type JoinRequestsState = {
  joinRequests: JoinRequest[];
  loading: boolean;
  error: string | null;
};

const ERROR_MESSAGE = 'No pudimos cargar las solicitudes. Probá de nuevo en un momento.';
const POLL_INTERVAL_MS = 2_000;

const INITIAL_STATE: JoinRequestsState = {
  joinRequests: [],
  loading: true,
  error: null,
};

export function useJoinRequests(partidoId: string, isOrganizer: boolean) {
  const { user: firebaseUser, loading: sessionLoading } = useAuth();
  const [state, setState] = useState<JoinRequestsState>(INITIAL_STATE);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    if (!isOrganizer || sessionLoading || !firebaseUser) return;

    let active = true;
    let requestInFlight = false;

    async function load(showError: boolean): Promise<void> {
      if (requestInFlight) return;

      requestInFlight = true;

      try {
        const joinRequests = await fetchJoinRequests(partidoId);

        if (active) setState({ joinRequests, loading: false, error: null });
      } catch {
        if (active && showError) {
          setState({ joinRequests: [], loading: false, error: ERROR_MESSAGE });
        }
      } finally {
        requestInFlight = false;
      }
    }

    void load(true);

    const interval = window.setInterval(() => {
      void load(false);
    }, POLL_INTERVAL_MS);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [firebaseUser, isOrganizer, partidoId, reloadToken, sessionLoading]);

  return {
    joinRequests: isOrganizer ? state.joinRequests : [],
    loading: isOrganizer && (sessionLoading || state.loading),
    error: isOrganizer ? state.error : null,
    reload,
  };
}
