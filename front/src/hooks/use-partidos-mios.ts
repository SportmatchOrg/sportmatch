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

const ERROR_MESSAGE = 'No pudimos cargar tus partidos. Probá de nuevo en un momento.';

const NO_PARTIDOS: PartidosMios = { organizo: [], juego: [], jugados: [] };

const INITIAL_STATE: PartidosMiosState = {
  partidos: NO_PARTIDOS,
  loading: true,
  error: null,
};

export function usePartidosMios() {
  const { user: firebaseUser, loading: sessionLoading } = useAuth();
  const [state, setState] = useState<PartidosMiosState>(INITIAL_STATE);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    if (sessionLoading || !firebaseUser) return;

    let active = true;

    fetchPartidosMios()
      .then((partidos) => {
        if (active) setState({ partidos, loading: false, error: null });
      })
      .catch(() => {
        if (active) setState({ partidos: NO_PARTIDOS, loading: false, error: ERROR_MESSAGE });
      });

    return () => {
      active = false;
    };
  }, [sessionLoading, firebaseUser, reloadToken]);

  return {
    organizo: state.partidos.organizo,
    juego: state.partidos.juego,
    jugados: state.partidos.jugados,
    loading: sessionLoading || state.loading,
    error: state.error,
    reload,
  };
}
