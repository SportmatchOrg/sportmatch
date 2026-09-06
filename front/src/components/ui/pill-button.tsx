'use client';

import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const BASE =
  'flex items-center justify-center gap-2 rounded-full px-6 text-callout transition disabled:cursor-not-allowed disabled:opacity-60';

const VARIANT = {
  brand: 'bg-brand font-bold text-brand-ink shadow-glow hover:bg-brand-bright disabled:shadow-none',
  glass: 'bg-glass font-semibold text-white shadow-bevel-lit hover:bg-glass-strong',
} as const;

const SIZE = {
  md: 'py-3',
  lg: 'py-4',
} as const;

type PillButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANT;
  size?: keyof typeof SIZE;
};

export function PillButton({
  variant = 'brand',
  size = 'lg',
  className,
  ...props
}: PillButtonProps) {
  return (
    <button type="button" className={cn(BASE, VARIANT[variant], SIZE[size], className)} {...props} />
  );
}
