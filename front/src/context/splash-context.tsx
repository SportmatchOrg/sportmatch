'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { SplashScreen } from '@/components/splash-screen';
import { SPLASH_SOUND_SRC } from '@/lib/splash';

type SplashState = { visible: boolean; holding: boolean };

type SplashContextValue = {
  showSplash: (options?: { holding?: boolean }) => void;
  releaseSplash: () => void;
  hideSplash: () => void;
};

const HIDDEN: SplashState = { visible: false, holding: false };

const SplashContext = createContext<SplashContextValue | undefined>(undefined);

export function SplashProvider({ children }: { children: ReactNode }) {
  const [splash, setSplash] = useState<SplashState>(HIDDEN);

  const showSplash = useCallback((options?: { holding?: boolean }) => {
    setSplash((current) =>
      current.visible ? current : { visible: true, holding: options?.holding ?? false }
    );
  }, []);

  const releaseSplash = useCallback(() => {
    setSplash((current) => (current.holding ? { ...current, holding: false } : current));
  }, []);

  const hideSplash = useCallback(() => setSplash(HIDDEN), []);

  const value = useMemo(
    () => ({ showSplash, releaseSplash, hideSplash }),
    [showSplash, releaseSplash, hideSplash]
  );

  return (
    <SplashContext.Provider value={value}>
      {children}
      {splash.visible ? (
        <SplashScreen holding={splash.holding} onDone={hideSplash} soundSrc={SPLASH_SOUND_SRC} />
      ) : null}
    </SplashContext.Provider>
  );
}

export function useSplash(): SplashContextValue {
  const context = useContext(SplashContext);

  if (context === undefined) {
    throw new Error('useSplash must be used within a <SplashProvider>');
  }

  return context;
}
