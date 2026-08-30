import { Check, X, Zap } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

import { cn } from '@/lib/utils';

export type ToastTone = 'success' | 'info' | 'danger';

const TONE_ICON: Record<ToastTone, ComponentType<SVGProps<SVGSVGElement>>> = {
  success: Check,
  info: Zap,
  danger: X,
};

const TONE_DISC: Record<ToastTone, string> = {
  success: 'bg-success-tint text-success',
  info: 'bg-brand-tint text-brand',
  danger: 'bg-danger-tint text-danger',
};

type ToastProps = {
  message: string;
  tone: ToastTone;
};

export function Toast({ message, tone }: ToastProps) {
  const Icon = TONE_ICON[tone];

  return (
    <div
      role="status"
      style={{ animation: 'toast-in var(--dur-slow) var(--ease-spring) both' }}
      className="flex items-center gap-3 rounded-full bg-glass-solid py-2 pl-2 pr-5 shadow-float-glass backdrop-blur-sheet"
    >
      <span
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-full',
          TONE_DISC[tone]
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>

      <span className="text-callout font-semibold text-white">{message}</span>
    </div>
  );
}
