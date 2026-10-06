'use client';

import { useEffect, useState } from 'react';

import { TOAST_DURATION } from '@/components/ui/toast';
import type { RatingFeedback } from '@/types/ratings';

export function useRatingFeedback() {
  const [feedback, setFeedback] = useState<RatingFeedback | null>(null);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [feedback]);

  return { feedback, setFeedback };
}
