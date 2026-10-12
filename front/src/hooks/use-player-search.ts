'use client';

import { useCallback, useEffect, useState } from 'react';

import { searchUsers, USER_SEARCH_MIN_LENGTH } from '@/lib/users';
import type { PublicUser } from '@/types/match';

const SEARCH_DELAY_MS = 300;
const ERROR_MESSAGE = 'No pudimos buscar jugadores. Probá de nuevo.';

type SearchState = {
  query: string;
  users: PublicUser[];
  loading: boolean;
  error: string | null;
};

export function usePlayerSearch(query: string) {
  const term = query.trim();
  const [state, setState] = useState<SearchState>({
    query: '', users: [], loading: false, error: null,
  });
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setState({ query: term, users: [], loading: true, error: null });
    setReloadToken((token) => token + 1);
  }, [term]);

  useEffect(() => {
    if (term.length < USER_SEARCH_MIN_LENGTH) return;

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setState({ query: term, users: [], loading: true, error: null });
      searchUsers(term, controller.signal)
        .then((users) => {
          if (!controller.signal.aborted) {
            setState({ query: term, users, loading: false, error: null });
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setState({ query: term, users: [], loading: false, error: ERROR_MESSAGE });
          }
        });
    }, SEARCH_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [term, reloadToken]);

  const ready = term.length >= USER_SEARCH_MIN_LENGTH;
  return {
    ready,
    users: state.query === term ? state.users : [],
    loading: ready && (state.query !== term || state.loading),
    error: state.query === term ? state.error : null,
    reload,
  };
}
