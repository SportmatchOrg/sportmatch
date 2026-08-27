'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/context/auth-context';

const HOME_ROUTE = '/perfil';

export function useRedirectIfAuthenticated() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace(HOME_ROUTE);
    }
  }, [user, loading, router]);

  return { checkingSession: loading || Boolean(user) };
}
