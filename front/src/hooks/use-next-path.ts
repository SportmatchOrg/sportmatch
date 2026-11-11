'use client';

import { useSyncExternalStore } from 'react';

import { readNextPath } from '@/lib/auth-redirect';

function subscribe(): () => void {
  return () => undefined;
}

export function useNextPath(): string | null {
  const search = useSyncExternalStore(subscribe, () => window.location.search, () => '');

  return readNextPath(search);
}
