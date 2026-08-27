'use client';

import { FieldError } from '@/components/partidos/field-error';
import { cn } from '@/lib/utils';
import { NIVELES, NIVEL_LABEL, type Nivel } from '@/types/partido';

const CHIP_BASE =
  'rounded-full px-4 py-2 text-callout transition';

const CHIP_SELECTED = 'bg-brand text-midnight';

const CHIP_IDLE =
  'bg-glass text-white/46 shadow-bevel hover:text-white';

const ERROR_ID = 'error-nivel';

type NivelPickerProps = {
  value: Nivel | '';
  onChange: (nivel: Nivel) => void;
  error?: string;
};

export function NivelPicker({ value, onChange, error }: NivelPickerProps) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-callout text-white">Nivel</legend>

      <div className="flex flex-wrap gap-2">
        {NIVELES.map((nivel) => {
          const selected = value === nivel;

          return (
            <button
              key={nivel}
              type="button"
              onClick={() => onChange(nivel)}
              aria-pressed={selected}
              aria-describedby={error ? ERROR_ID : undefined}
              className={cn(CHIP_BASE, selected ? CHIP_SELECTED : CHIP_IDLE)}
            >
              {NIVEL_LABEL[nivel]}
            </button>
          );
        })}
      </div>

      <FieldError id={ERROR_ID} message={error} />
    </fieldset>
  );
}
