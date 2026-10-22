import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

const TONE = {
  danger: 'bg-danger-tint text-danger',
  warning: 'bg-warning-tint text-warning',
} as const;

export type BadgeTone = keyof typeof TONE;

type BadgeProps = {
  tone: BadgeTone;
  children: ReactNode;
  className?: string;
};

export function Badge({ tone, children, className }: BadgeProps) {
  return (
    <span
      className={cn('rounded-full px-3 py-1 text-caption font-semibold', TONE[tone], className)}
    >
      {children}
    </span>
  );
}
