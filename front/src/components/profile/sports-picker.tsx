'use client';

import { SPORT_ICON } from '@/components/matches/sport-icon';
import { FilterChip } from '@/components/ui/filter-chip';
import { useSports } from '@/hooks/use-sports';
import { SPORT_LABEL } from '@/types/match';
import { SPORTS_MAX } from '@/types/user';

const LABEL = 'flex items-center justify-between gap-3 px-1 text-overline text-ink-46 uppercase';

const LABEL_ID = 'sports-label';

type SportsPickerProps = {
  value: string[];
  onChange: (sportIds: string[]) => void;
  disabled?: boolean;
};

export function SportsPicker({ value, onChange, disabled = false }: SportsPickerProps) {
  const { sports, loading, error } = useSports();
  const full = value.length >= SPORTS_MAX;

  function toggle(sportId: string) {
    if (disabled) return;

    if (value.includes(sportId)) {
      onChange(value.filter((id) => id !== sportId));
    } else if (!full) {
      onChange([...value, sportId]);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p id={LABEL_ID} className={LABEL}>
        Deportes
        <span className="normal-case">
          {value.length} de {SPORTS_MAX}
        </span>
      </p>

      {loading && <p className="pl-1 text-caption text-ink-46">Cargando deportes…</p>}

      {error && (
        <p role="alert" className="pl-1 text-caption text-danger">
          {error}
        </p>
      )}

      <div role="group" aria-labelledby={LABEL_ID} className="flex flex-wrap gap-2">
        {sports.map((sport) => {
          const selected = value.includes(sport.id);

          return (
            <FilterChip
              key={sport.id}
              icon={SPORT_ICON[sport.name]}
              selected={selected}
              aria-disabled={disabled || (full && !selected)}
              onClick={() => toggle(sport.id)}
            >
              {SPORT_LABEL[sport.name]}
            </FilterChip>
          );
        })}
      </div>
    </div>
  );
}
