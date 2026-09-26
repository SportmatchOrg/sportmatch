'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { useAuth } from '@/context/auth-context';
import { fetchUnreadCount } from '@/lib/notifications';

type UnreadCountState = {
  count: number;
  loading: boolean;
  error: string | null;
};

type UnreadCountContextValue = UnreadCountState & {
  reload: () => void;
};

// Polling is a stopgap until BUG-9 decides on TanStack Query.
const POLL_INTERVAL_MS = 30_000;

const ERROR_MESSAGE = 'No pudimos cargar tus notificaciones. Probá de nuevo en un momento.';

const INITIAL_STATE: UnreadCountState = {
  count: 0,
  loading: true,
  error: null,
};

const UnreadCountContext = createContext<UnreadCountContextValue | undefined>(undefined);

export function UnreadCountProvider({ children }: { children: ReactNode }) {
  const { user: firebaseUser, loading: sessionLoading } = useAuth();
  const [state, setState] = useState<UnreadCountState>(INITIAL_STATE);
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
        const count = await fetchUnreadCount();

        if (active) setState({ count, loading: false, error: null });
      } catch {
        if (active && showError) {
          setState({ count: 0, loading: false, error: ERROR_MESSAGE });
        }
      } finally {
        requestInFlight = false;
      }
    }

    function refreshIfVisible() {
      if (document.visibilityState === 'visible') void load(false);
    }

    void load(true);

    const interval = window.setInterval(refreshIfVisible, POLL_INTERVAL_MS);
    document.addEventListener('visibilitychange', refreshIfVisible);

    return () => {
      active = false;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', refreshIfVisible);
    };
  }, [sessionLoading, firebaseUser, reloadToken]);

  return (
    <UnreadCountContext.Provider
      value={{ ...state, loading: sessionLoading || state.loading, reload }}
    >
      {children}
    </UnreadCountContext.Provider>
  );
}

export function useUnreadCount(): UnreadCountContextValue {
  const context = useContext(UnreadCountContext);

  if (context === undefined) {
    throw new Error('useUnreadCount must be used within an <UnreadCountProvider>');
  }

  return context;
}
