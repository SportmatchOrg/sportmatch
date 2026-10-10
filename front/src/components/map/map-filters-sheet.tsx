'use client';

import { SPORT_ICON } from '@/components/matches/sport-icon';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { FilterChip } from '@/components/ui/filter-chip';
import { PillButton } from '@/components/ui/pill-button';
import { useSports } from '@/hooks/use-sports';
import { toggleLevel, toggleSport, type MapFilters } from '@/lib/map-filters';
import { LEVELS, LEVEL_LABEL, SPORT_LABEL } from '@/types/match';

const SECTION_LABEL = 'text-overline text-ink-46 uppercase';

const CHIPS = 'flex flex-wrap gap-2';

type MapFiltersSheetProps = {
  open: boolean;
  onClose: () => void;
  filters: MapFilters;
  onChange: (filters: MapFilters) => void;
  resultCount: number;
};

function resultsLabel(count: number): string {
  return count === 1 ? 'Ver 1 partido' : `Ver ${count} partidos`;
}

export function MapFiltersSheet({
  open,
  onClose,
  filters,
  onChange,
  resultCount,
}: MapFiltersSheetProps) {
  const { sports, loading, error } = useSports();

  return (
    <BottomSheet open={open} onClose={onClose} title="Filtros">
      <section className="flex flex-col gap-3">
        <h3 className={SECTION_LABEL}>Deporte</h3>

        {loading && <p className="text-caption text-ink-46">Cargando deportes…</p>}

        {error && (
          <p role="alert" className="text-caption text-danger">
            {error}
          </p>
        )}

        <div role="group" aria-label="Deporte" className={CHIPS}>
          {sports.map((sport) => (
            <FilterChip
              key={sport.id}
              icon={SPORT_ICON[sport.name]}
              selected={filters.sportIds.includes(sport.id)}
              onClick={() => onChange(toggleSport(filters, sport.id))}
            >
              {SPORT_LABEL[sport.name]}
            </FilterChip>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className={SECTION_LABEL}>Nivel</h3>

        <div role="group" aria-label="Nivel" className={CHIPS}>
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
      </section>

      <PillButton onClick={onClose}>{resultsLabel(resultCount)}</PillButton>
    </BottomSheet>
  );
}
