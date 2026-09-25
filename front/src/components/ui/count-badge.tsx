import { cn } from '@/lib/utils';

const BADGE =
  'pointer-events-none flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brand px-1 text-overline leading-none tracking-normal text-brand-ink ring-2';

const DEFAULT_MAX = 9;

type CountBadgeProps = {
  count: number;
  max?: number;
  className?: string;
};

export function CountBadge({ count, max = DEFAULT_MAX, className }: CountBadgeProps) {
  if (count <= 0) return null;

  return (
    <span aria-hidden="true" className={cn(BADGE, className)}>
      {count > max ? `${max}+` : count}
    </span>
  );
}
