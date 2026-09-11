'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/context/auth-context';
import { markSplashPending } from '@/lib/splash';

const HOME_ROUTE = '/buscar';

export function useRedirectIfAuthenticated() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      markSplashPending();
      router.replace(HOME_ROUTE);
    }
  }, [user, loading, router]);

  return { checkingSession: loading || Boolean(user) };
}
