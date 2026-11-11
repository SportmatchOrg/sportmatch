'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/context/auth-context';
import { useNextPath } from '@/hooks/use-next-path';
import { clearAccountBlockedNotice } from '@/lib/account-block';
import { HOME_HREF } from '@/lib/nav-items';
import { markSplashPending } from '@/lib/splash';

export function useRedirectIfAuthenticated() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const next = useNextPath();

  useEffect(() => {
    if (!loading && user) {
      clearAccountBlockedNotice();
      markSplashPending();
      router.replace(next ?? HOME_HREF);
    }
  }, [user, loading, router, next]);

  return { checkingSession: loading || Boolean(user), next };
}
