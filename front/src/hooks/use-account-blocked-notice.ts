'use client';

import { useSyncExternalStore } from 'react';

import { readAccountBlockedNotice } from '@/lib/account-block';

function subscribe(): () => void {
  return () => undefined;
}

export function useAccountBlockedNotice(): string | null {
  return useSyncExternalStore(subscribe, readAccountBlockedNotice, () => null);
}
