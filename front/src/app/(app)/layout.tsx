'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, type ReactNode } from 'react';

import { TabBar } from '@/components/tab-bar';
import { TopNavBar } from '@/components/top-nav-bar';
import { useAuth } from '@/context/auth-context';
import { LoadingScreen } from '@/components/loading-screen';
import { SplashScreen } from '@/components/splash-screen';
import { clearSplashPending, isSplashPending, SPLASH_SOUND_SRC } from '@/lib/splash';

const LOGIN_ROUTE = '/login';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [splashVisible, setSplashVisible] = useState(isSplashPending);

  useEffect(() => {
    clearSplashPending();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(LOGIN_ROUTE);
    }
  }, [loading, user, router]);

  const hideSplash = useCallback(() => setSplashVisible(false), []);

  if (loading || !user) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-dvh bg-base pb-28 text-white lg:pb-0 lg:pt-20">
      <TopNavBar />
      {children}
      <TabBar />
      {splashVisible ? (
        <SplashScreen onDone={hideSplash} soundSrc={SPLASH_SOUND_SRC} />
      ) : null}
    </div>
  );
}
