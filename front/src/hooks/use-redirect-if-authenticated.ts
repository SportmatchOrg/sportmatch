'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/context/auth-context';
import { useSplash } from '@/context/splash-context';
import { useNextPath } from '@/hooks/use-next-path';
import { clearAccountBlockedNotice } from '@/lib/account-block';
import { HOME_HREF } from '@/lib/nav-items';

export function useRedirectIfAuthenticated() {
  const { user, loading } = useAuth();
  const { showSplash } = useSplash();
  const router = useRouter();
  const next = useNextPath();

  useEffect(() => {
    if (!loading && user) {
      clearAccountBlockedNotice();
      showSplash();
      router.replace(next ?? HOME_HREF);
    }
  }, [user, loading, router, next, showSplash]);

  return { checkingSession: loading || Boolean(user), next };
}
