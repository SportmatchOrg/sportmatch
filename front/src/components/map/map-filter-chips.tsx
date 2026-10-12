'use client';

import { Navigation } from 'lucide-react';

import { FilterChip } from '@/components/ui/filter-chip';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { UserLocation } from '@/hooks/use-user-location';
import {
  DAY_FILTERS,
  DAY_FILTER_LABEL,
  toggleLevel,
  type DayFilter,
  type MapFilters,
} from '@/lib/map-filters';
import { cn } from '@/lib/utils';
import { LEVELS, LEVEL_LABEL } from '@/types/match';

const NEARBY_LABEL = 'Cerca';

const LOCATION_NEEDED = 'Activá tu ubicación';

type MapFilterChipsProps = {
  filters: MapFilters;
  onChange: (filters: MapFilters) => void;
  location: UserLocation | null;
  className?: string;
};

export function MapFilterChips({ filters, onChange, location, className }: MapFilterChipsProps) {
  const nearbyOn = filters.nearby !== null;

  function toggleNearby() {
    if (nearbyOn) {
      onChange({ ...filters, nearby: null });
    } else if (location) {
      onChange({
        ...filters,
        nearby: { latitude: location.latitude, longitude: location.longitude },
      });
    }
  }

  function toggleDay(day: DayFilter) {
    onChange({ ...filters, day: filters.day === day ? null : day });
  }

  return (
    <div role="group" aria-label="Filtros" className={cn('flex gap-2', className)}>
      {location || nearbyOn ? (
        <FilterChip icon={Navigation} selected={nearbyOn} onClick={toggleNearby}>
          {NEARBY_LABEL}
        </FilterChip>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              render={
                <FilterChip icon={Navigation} selected={false} aria-disabled="true">
                  {NEARBY_LABEL}
                </FilterChip>
              }
            />
            <TooltipContent side="bottom">{LOCATION_NEEDED}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {DAY_FILTERS.map((day) => (
        <FilterChip key={day} selected={filters.day === day} onClick={() => toggleDay(day)}>
          {DAY_FILTER_LABEL[day]}
        </FilterChip>
      ))}

      {LEVELS.map((level) => (
        <FilterChip
          key={level}
          selected={filters.levels.includes(level)}
          onClick={() => onChange(toggleLevel(filters, level))}
        >
          {LEVEL_LABEL[level]}
        </FilterChip>
      ))}
    </div>
  );
}
