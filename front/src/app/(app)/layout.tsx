'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, type ReactNode } from 'react';

import { TabBar } from '@/components/tab-bar';
import { TopNavBar } from '@/components/top-nav-bar';
import { useAuth } from '@/context/auth-context';
import { useCurrentUser } from '@/hooks/use-current-user';
import { UnreadCountProvider } from '@/context/unread-count-context';
import { LoadingScreen } from '@/components/loading-screen';
import { MapsProvider } from '@/components/map/maps-provider';
import { QueryProvider } from '@/components/query-provider';
import { SplashScreen } from '@/components/splash-screen';
import { isPublicMatchPath, LOGIN_HREF } from '@/lib/auth-redirect';
import { ONBOARDING_HREF } from '@/lib/nav-items';
import { isOnboardingDismissed } from '@/lib/onboarding';
import { clearSplashPending, isSplashPending, SPLASH_SOUND_SRC } from '@/lib/splash';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const publicPage = isPublicMatchPath(pathname);
  const { user: profile } = useCurrentUser();
  const needsOnboarding =
    profile?.onboardedAt === null && pathname !== ONBOARDING_HREF && !isOnboardingDismissed();
  const [splashVisible, setSplashVisible] = useState(isSplashPending);

  useEffect(() => {
    clearSplashPending();
  }, []);

  useEffect(() => {
    if (!loading && !user && !publicPage) {
      router.replace(LOGIN_HREF);
    }
  }, [loading, user, router, publicPage]);

  useEffect(() => {
    if (needsOnboarding) {
      router.replace(ONBOARDING_HREF);
    }
  }, [needsOnboarding, router]);

  const hideSplash = useCallback(() => setSplashVisible(false), []);

  if (!loading && !user && publicPage) {
    return (
      <QueryProvider>
        <div className="min-h-dvh bg-base text-white">{children}</div>
      </QueryProvider>
    );
  }

  if (loading || !user || needsOnboarding) {
    return <LoadingScreen />;
  }

  return (
    <MapsProvider>
      <QueryProvider>
        <UnreadCountProvider>
          <div className="min-h-dvh bg-base pb-28 text-white lg:pb-0 lg:pt-20">
            <TopNavBar />
            {children}
            <TabBar />
            {splashVisible ? (
              <SplashScreen onDone={hideSplash} soundSrc={SPLASH_SOUND_SRC} />
            ) : null}
          </div>
        </UnreadCountProvider>
      </QueryProvider>
    </MapsProvider>
  );
}
