'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useCurrentUser } from '@/hooks/use-current-user';
import { HOME_HREF } from '@/lib/nav-items';
import { isAdmin } from '@/types/user';

export function useAdminAccess() {
  const router = useRouter();
  const { user, loading, error } = useCurrentUser();
  const allowed = user !== null && isAdmin(user);

  useEffect(() => {
    if (user && !isAdmin(user)) router.replace(HOME_HREF);
  }, [user, router]);

  return { user, allowed, loading, error };
}
