'use client';

import { useCallback, useEffect, useState } from 'react';

import { TOAST_DURATION, type ToastTone } from '@/components/ui/toast';

export type TimedToast = { message: string; tone: ToastTone };

export function useTimedToast() {
  const [toast, setToast] = useState<TimedToast | null>(null);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((message: string, tone: ToastTone) => {
    setToast({ message, tone });
  }, []);

  return { toast, showToast };
}
