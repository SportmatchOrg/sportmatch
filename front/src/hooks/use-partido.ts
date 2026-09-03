'use client';

import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/context/auth-context';
import { ApiError } from '@/lib/api';
import { fetchPartido } from '@/lib/partidos';
import type { PartidoDetalle } from '@/types/partido';

type PartidoState = {
  partido: PartidoDetalle | null;
  loading: boolean;
  notFound: boolean;
  error: string | null;
};

const ERROR_MESSAGE = 'No pudimos cargar el partido. Probá de nuevo en un momento.';

const INITIAL_STATE: PartidoState = {
  partido: null,
  loading: true,
  notFound: false,
  error: null,
};

const NOT_FOUND = 404;

export function usePartido(partidoId: string) {
  const { user: firebaseUser, loading: sessionLoading } = useAuth();
  const [state, setState] = useState<PartidoState>(INITIAL_STATE);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    if (sessionLoading || !firebaseUser) return;

    let active = true;

    fetchPartido(partidoId)
      .then((partido) => {
        if (active) setState({ partido, loading: false, notFound: false, error: null });
      })
      .catch((error: unknown) => {
        if (!active) return;

        setState({
          partido: null,
          loading: false,
          notFound: error instanceof ApiError && error.status === NOT_FOUND,
          error: ERROR_MESSAGE,
        });
      });

    return () => {
      active = false;
    };
  }, [sessionLoading, firebaseUser, partidoId, reloadToken]);

  return { ...state, loading: sessionLoading || state.loading, reload };
}
