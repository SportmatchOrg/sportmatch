import { cn } from '@/lib/utils';

export function BrandMark({
  className,
  leftClassName,
  rightClassName,
}: {
  className?: string;
  leftClassName?: string;
  rightClassName?: string;
}) {
  return (
    <svg viewBox="0 0 100 100" className={cn('overflow-visible', className)} aria-hidden>
      <g className={leftClassName}>
        <polygon points="29,30 29,70 50,50" className="fill-brand" />
      </g>
      <g className={rightClassName}>
        <polygon points="71,30 71,70 47,50" className="fill-ink-100" />
      </g>
    </svg>
  );
}
