'use client';

import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const BASE =
  'flex items-center justify-center gap-2 rounded-full px-6 text-callout whitespace-nowrap transition disabled:cursor-not-allowed disabled:opacity-60';

const VARIANT = {
  brand: 'bg-brand font-bold text-brand-ink shadow-glow hover:bg-brand-bright disabled:shadow-none',
  glass: 'bg-glass font-semibold text-white shadow-bevel-lit hover:bg-glass-strong',
  danger: 'bg-danger text-[13.5px] leading-none font-bold text-white hover:brightness-110',
  dangerGhost: 'px-0 text-[13.5px] leading-none font-bold text-danger hover:brightness-110',
} as const;

const SIZE = {
  md: 'py-3',
  lg: 'py-4',
} as const;

type PillVariant = keyof typeof VARIANT;
type PillSize = keyof typeof SIZE;

export function pillButtonClassName({
  variant = 'brand',
  size = 'lg',
  className,
}: {
  variant?: PillVariant;
  size?: PillSize;
  className?: string;
} = {}): string {
  return cn(BASE, VARIANT[variant], SIZE[size], className);
}

type PillButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: PillVariant;
  size?: PillSize;
};

export function PillButton({
  variant = 'brand',
  size = 'lg',
  className,
  ...props
}: PillButtonProps) {
  return (
    <button type="button" className={pillButtonClassName({ variant, size, className })} {...props} />
  );
}
