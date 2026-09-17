'use client';

import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/context/auth-context';
import { fetchPartidosMios } from '@/lib/partidos';
import type { PartidosMios } from '@/types/partido';

type PartidosMiosState = {
  partidos: PartidosMios;
  loading: boolean;
  error: string | null;
};

type UsePartidosMiosOptions = {
  pollIntervalMs?: number;
};

const ERROR_MESSAGE = 'No pudimos cargar tus partidos. Probá de nuevo en un momento.';

const NO_PARTIDOS: PartidosMios = { organizo: [], juego: [], jugados: [], requested: [] };

const INITIAL_STATE: PartidosMiosState = {
  partidos: NO_PARTIDOS,
  loading: true,
  error: null,
};

export function usePartidosMios({ pollIntervalMs }: UsePartidosMiosOptions = {}) {
  const { user: firebaseUser, loading: sessionLoading } = useAuth();
  const [state, setState] = useState<PartidosMiosState>(INITIAL_STATE);
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
        const partidos = await fetchPartidosMios();

        if (active) setState({ partidos, loading: false, error: null });
      } catch {
        if (active && showError) {
          setState({ partidos: NO_PARTIDOS, loading: false, error: ERROR_MESSAGE });
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
    organizo: state.partidos.organizo,
    juego: state.partidos.juego,
    jugados: state.partidos.jugados,
    requested: state.partidos.requested,
    loading: sessionLoading || state.loading,
    error: state.error,
    reload,
  };
}
