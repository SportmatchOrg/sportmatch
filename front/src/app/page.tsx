'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { LoadingScreen } from '@/components/loading-screen';
import { useAuth } from '@/context/auth-context';

const SIGNED_IN_ROUTE = '/perfil';
const SIGNED_OUT_ROUTE = '/login';

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    router.replace(user ? SIGNED_IN_ROUTE : SIGNED_OUT_ROUTE);
  }, [loading, user, router]);

  return <LoadingScreen />;
}
