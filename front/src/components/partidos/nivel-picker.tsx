'use client';

import { FieldError } from '@/components/partidos/field-error';
import { cn } from '@/lib/utils';
import { NIVELES, NIVEL_LABEL, type Nivel } from '@/types/partido';

const TRACK = 'flex gap-1 rounded-full bg-glass p-1 shadow-bevel';

const OPTION = 'flex-1 rounded-full py-2 text-callout transition';

const OPTION_SELECTED = 'bg-white font-bold text-midnight';

const OPTION_IDLE = 'text-ink-46 hover:text-white';

const ERROR_ID = 'error-nivel';

const LABEL_ID = 'label-nivel';

type NivelPickerProps = {
  value: Nivel | '';
  onChange: (nivel: Nivel) => void;
  error?: string;
};

export function NivelPicker({ value, onChange, error }: NivelPickerProps) {
  return (
    <div role="group" aria-labelledby={LABEL_ID} className="flex flex-col gap-3">
      <span id={LABEL_ID} className="text-overline text-ink-46 uppercase">
        Nivel
      </span>

      <div className={TRACK}>
        {NIVELES.map((nivel) => {
          const selected = value === nivel;

          return (
            <button
              key={nivel}
              type="button"
              onClick={() => onChange(nivel)}
              aria-pressed={selected}
              aria-describedby={error ? ERROR_ID : undefined}
              className={cn(OPTION, selected ? OPTION_SELECTED : OPTION_IDLE)}
            >
              {NIVEL_LABEL[nivel]}
            </button>
          );
        })}
      </div>

      <FieldError id={ERROR_ID} message={error} />
    </div>
  );
}
