'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { TabBar } from '@/components/tab-bar';
import { TopNavBar } from '@/components/top-nav-bar';
import { useAuth } from '@/context/auth-context';
import { useCurrentUser } from '@/hooks/use-current-user';
import { usePrefetchAppData } from '@/hooks/use-prefetch-app-data';
import { UnreadCountProvider } from '@/context/unread-count-context';
import { LoadingScreen } from '@/components/loading-screen';
import { MapsProvider } from '@/components/map/maps-provider';
import { QueryProvider } from '@/components/query-provider';
import { isPublicMatchPath, LOGIN_HREF } from '@/lib/auth-redirect';
import { ONBOARDING_HREF } from '@/lib/nav-items';
import { isOnboardingDismissed } from '@/lib/onboarding';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <QueryProvider key={user?.uid ?? 'anonymous'}>
      <AppContent>{children}</AppContent>
    </QueryProvider>
  );
}

function AppContent({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const publicPage = isPublicMatchPath(pathname);
  const { user: profile } = useCurrentUser();
  usePrefetchAppData(!!user && !publicPage);
  const needsOnboarding =
    profile?.onboardedAt === null && pathname !== ONBOARDING_HREF && !isOnboardingDismissed();

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

  if (!loading && !user && publicPage) {
    return (
      <div className="min-h-dvh bg-base text-white">{children}</div>
    );
  }

  if (loading || !user || needsOnboarding) {
    return <LoadingScreen />;
  }

  return (
    <MapsProvider>
      <UnreadCountProvider>
        <div className="min-h-dvh bg-base pb-28 text-white lg:pb-0 lg:pt-20">
          <TopNavBar />
          {children}
          <TabBar />
        </div>
      </UnreadCountProvider>
    </MapsProvider>
  );
}
