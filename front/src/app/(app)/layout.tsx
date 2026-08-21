'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { TabBar } from '@/components/tab-bar';
import { TopNavBar } from '@/components/top-nav-bar';
import { useAuth } from '@/context/auth-context';
import { LoadingScreen } from '@/components/loading-screen';

const LOGIN_ROUTE = '/login';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(LOGIN_ROUTE);
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-dvh bg-base pb-28 text-white lg:pb-0 lg:pt-28">
      <TopNavBar />
      {children}
      <TabBar />
    </div>
  );
}
