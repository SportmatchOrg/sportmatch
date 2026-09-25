'use client';

import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const BASE =
  'flex shrink-0 items-center justify-center rounded-full transition active:scale-[var(--press-scale)] disabled:cursor-not-allowed disabled:opacity-40';

const VARIANT = {
  glass: 'bg-glass-solid text-white shadow-bevel backdrop-blur-chip hover:bg-glass-strong',
  soft: 'bg-glass text-white shadow-bevel-lit hover:bg-glass-strong',
  strong: 'bg-glass-strong text-white shadow-bevel-lit hover:bg-glass-solid',
  brand: 'bg-brand text-brand-ink shadow-glow hover:bg-brand-bright',
} as const;

const SIZE = {
  sm: 'size-9',
  nav: 'size-nav-item-desktop',
  md: 'size-11',
} as const;

type IconButtonVariant = keyof typeof VARIANT;
export type IconButtonSize = keyof typeof SIZE;

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
};

// Lets a Link look like an IconButton without nesting a <button> inside an <a>.
export function iconButtonClassName(
  variant: IconButtonVariant = 'glass',
  size: IconButtonSize = 'md'
) {
  return cn(BASE, VARIANT[variant], SIZE[size]);
}

export function IconButton({
                             label,
                             variant = 'glass',
                             size = 'md',
                             className,
                             ...props
                           }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(iconButtonClassName(variant, size), className)}
      {...props}
    />
  );
}
