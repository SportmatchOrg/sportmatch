import { Check, X, type LucideIcon } from 'lucide-react';

import type { SwipeActionTone } from '@/components/ui/swipe-row';
import type { ReportResolution } from '@/types/report';

type ResolutionAction = {
  label: string;
  icon: LucideIcon;
  buttonVariant: 'brand' | 'glass';
  swipeTone: SwipeActionTone;
};

export const RESOLUTION_ACTION: Record<ReportResolution, ResolutionAction> = {
  REVIEWED: { label: 'Marcar revisado', icon: Check, buttonVariant: 'brand', swipeTone: 'success' },
  DISMISSED: { label: 'Descartar', icon: X, buttonVariant: 'glass', swipeTone: 'neutral' },
};

export const RESOLUTIONS = Object.keys(RESOLUTION_ACTION) as ReportResolution[];
