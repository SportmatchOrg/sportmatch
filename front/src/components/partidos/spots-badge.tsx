import { cn } from '@/lib/utils';

const LOW_SPOTS = 2;

const BADGE =
  'flex shrink-0 items-center gap-1.5 rounded-full pt-[7px] pr-[11px] pb-[8px] pl-[11px] text-caption leading-none font-semibold';

type SpotsBadgeProps = {
  libres: number;
  onPhoto?: boolean;
};

export function SpotsBadge({ libres, onPhoto = false }: SpotsBadgeProps) {
  const low = libres <= LOW_SPOTS;

  const fill = onPhoto
    ? 'bg-glass-solid backdrop-blur-chip'
    : low
      ? 'bg-danger-tint'
      : 'bg-success-tint';

  const ring = low
    ? 'shadow-[inset_0_0_0_1px_var(--color-danger-ring)]'
    : 'shadow-[inset_0_0_0_1px_var(--color-success-ring)]';

  return (
    <span className={cn(BADGE, fill, ring, low ? 'text-danger' : 'text-success')}>
      <span
        className={cn('size-2 rounded-full', low ? 'bg-danger' : 'bg-success')}
        aria-hidden="true"
      />
      {libres}
      <span className="sr-only">{libres === 1 ? 'lugar libre' : 'lugares libres'}</span>
    </span>
  );
}
