import { Settings } from 'lucide-react';
import Link from 'next/link';

import { SETTINGS_HREF } from '@/lib/nav-items';
import { cn } from '@/lib/utils';

const BASE =
  'flex items-center justify-center bg-glass-strong text-white shadow-float-glass backdrop-blur-chip transition hover:bg-white/20';

const VARIANTS = {
  icon: 'size-11 rounded-full',
  labelled: 'h-[46px] gap-2 rounded-full px-[22px] text-callout',
} as const;

type SettingsLinkProps = {
  variant?: keyof typeof VARIANTS;
  className?: string;
};

export function SettingsLink({ variant = 'icon', className }: SettingsLinkProps) {
  return (
    <Link
      href={SETTINGS_HREF}
      aria-label={variant === 'icon' ? 'Ajustes' : undefined}
      className={cn(BASE, VARIANTS[variant], className)}
    >
      <Settings className="size-[22px] shrink-0" aria-hidden="true" />
      {variant === 'labelled' && 'Ajustes'}
    </Link>
  );
}
