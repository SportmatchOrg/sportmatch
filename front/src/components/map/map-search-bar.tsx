'use client';

import { Search, SlidersHorizontal } from 'lucide-react';

import { iconButtonClassName } from '@/components/ui/icon-button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const SEARCH =
  'flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-full bg-glass-solid px-4 text-callout text-ink-32 shadow-bevel backdrop-blur-card aria-disabled:cursor-not-allowed aria-disabled:opacity-60';

const FILTERS = 'aria-disabled:cursor-not-allowed aria-disabled:opacity-60';

const UNAVAILABLE = 'Próximamente';

export function MapSearchBar({ className }: { className?: string }) {
  return (
    <TooltipProvider>
      <div className={cn('flex items-center gap-2', className)}>
        <Tooltip>
          <TooltipTrigger type="button" aria-disabled="true" className={SEARCH}>
            <Search className="size-5 shrink-0" aria-hidden="true" />
            <span className="truncate">Buscá en esta zona</span>
          </TooltipTrigger>
          <TooltipContent side="bottom">{UNAVAILABLE}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            type="button"
            aria-disabled="true"
            aria-label="Filtros"
            className={cn(iconButtonClassName('glass'), FILTERS)}
          >
            <SlidersHorizontal className="size-5" aria-hidden="true" />
          </TooltipTrigger>
          <TooltipContent side="bottom">{UNAVAILABLE}</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
