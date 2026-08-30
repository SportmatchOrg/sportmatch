'use client';

import { useEffect, useState } from 'react';

import { useAuth } from '@/context/auth-context';
import { fetchPartidos } from '@/lib/partidos';
import type { Partido } from '@/types/partido';

type PartidosState = {
  partidos: Partido[];
  loading: boolean;
  error: string | null;
};

const ERROR_MESSAGE = 'No pudimos cargar los partidos. Probá de nuevo en un momento.';

const INITIAL_STATE: PartidosState = { partidos: [], loading: true, error: null };

export function usePartidos(): PartidosState {
  const { user: firebaseUser, loading: sessionLoading } = useAuth();
  const [state, setState] = useState<PartidosState>(INITIAL_STATE);

  useEffect(() => {
    if (sessionLoading || !firebaseUser) return;

    let active = true;

    fetchPartidos()
      .then((partidos) => {
        if (active) setState({ partidos, loading: false, error: null });
      })
      .catch(() => {
        if (active) setState({ partidos: [], loading: false, error: ERROR_MESSAGE });
      });

    return () => {
      active = false;
    };
  }, [sessionLoading, firebaseUser]);

  return { ...state, loading: sessionLoading || state.loading };
}
