'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/context/auth-context';
import { HOME_HREF } from '@/lib/nav-items';
import { markSplashPending } from '@/lib/splash';

export function useRedirectIfAuthenticated() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      markSplashPending();
      router.replace(HOME_HREF);
    }
  }, [user, loading, router]);

  return { checkingSession: loading || Boolean(user) };
}
