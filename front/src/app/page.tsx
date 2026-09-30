'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Landing } from '@/components/landing/landing';
import { LoadingScreen } from '@/components/loading-screen';
import { useAuth } from '@/context/auth-context';
import { HOME_HREF } from '@/lib/nav-items';

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace(HOME_HREF);
    }
  }, [loading, user, router]);

  if (loading || user) {
    return <LoadingScreen />;
  }

  return <Landing />;
}
