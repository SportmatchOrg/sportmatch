import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const SHINY =
  'animate-ai-shimmer bg-[linear-gradient(110deg,var(--color-ink-46)_35%,var(--color-ink-100)_50%,var(--color-ink-46)_65%)] bg-[length:200%_100%] bg-clip-text text-transparent motion-reduce:animate-none motion-reduce:text-ink-80 motion-reduce:[background:none]';

export function ShinyText({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn(SHINY, className)} {...props} />;
}
