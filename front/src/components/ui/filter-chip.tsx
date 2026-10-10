import type { ButtonHTMLAttributes, ComponentType, SVGProps } from 'react';

import { cn } from '@/lib/utils';

const BASE =
  'flex h-chip shrink-0 items-center gap-1.5 rounded-full px-4 text-callout font-semibold whitespace-nowrap transition outline-none active:scale-[var(--press-scale-chip)] focus-visible:ring-2 focus-visible:ring-brand aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:active:scale-100';

const IDLE = 'bg-glass-strong text-white shadow-bevel backdrop-blur-card hover:bg-glass-solid';

const SELECTED = 'bg-white text-midnight';

type FilterChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected: boolean;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
};

export function FilterChip({
                             selected,
                             icon: Icon,
                             className,
                             children,
                             ...props
                           }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(BASE, selected ? SELECTED : IDLE, className)}
      {...props}
    >
      {Icon && <Icon className="size-4" aria-hidden="true" />}
      {children}
    </button>
  );
}
