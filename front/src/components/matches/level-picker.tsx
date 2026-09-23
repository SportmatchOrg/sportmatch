'use client';

import { FieldError } from '@/components/matches/field-error';
import { cn } from '@/lib/utils';
import { LEVELS, LEVEL_LABEL, type Level } from '@/types/match';

const TRACK = 'flex gap-1 rounded-full bg-glass p-1 shadow-bevel';

const OPTION = 'flex-1 rounded-full py-2 text-callout transition';

const OPTION_SELECTED = 'bg-white font-bold text-midnight';

const OPTION_IDLE = 'text-ink-46 hover:text-white';

const ERROR_ID = 'error-nivel';

const LABEL_ID = 'label-nivel';

type NivelPickerProps = {
  value: Level | '';
  onChange: (level: Level) => void;
  error?: string;
};

export function LevelPicker({ value, onChange, error }: NivelPickerProps) {
  return (
    <div role="group" aria-labelledby={LABEL_ID} className="flex flex-col gap-3">
      <span id={LABEL_ID} className="text-overline text-ink-46 uppercase">
        Nivel
      </span>

      <div className={TRACK}>
        {LEVELS.map((level) => {
          const selected = value === level;

          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              aria-pressed={selected}
              aria-describedby={error ? ERROR_ID : undefined}
              className={cn(OPTION, selected ? OPTION_SELECTED : OPTION_IDLE)}
            >
              {LEVEL_LABEL[level]}
            </button>
          );
        })}
      </div>

      <FieldError id={ERROR_ID} message={error} />
    </div>
  );
}
