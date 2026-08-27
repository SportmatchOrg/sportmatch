'use client';

import { useEffect, useState } from 'react';

import { fetchDeportes } from '@/lib/deportes';
import type { Deporte } from '@/types/partido';

type DeportesState = {
  deportes: Deporte[];
  loading: boolean;
  error: string | null;
};

const ERROR_MESSAGE = 'No pudimos cargar los deportes. Probá de nuevo en un momento.';

const INITIAL_STATE: DeportesState = { deportes: [], loading: true, error: null };

export function useDeportes(): DeportesState {
  const [state, setState] = useState<DeportesState>(INITIAL_STATE);

  useEffect(() => {
    let active = true;

    fetchDeportes()
      .then((deportes) => {
        if (active) setState({ deportes, loading: false, error: null });
      })
      .catch(() => {
        if (active) setState({ deportes: [], loading: false, error: ERROR_MESSAGE });
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}
