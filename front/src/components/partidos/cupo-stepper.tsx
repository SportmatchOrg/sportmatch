'use client';

import { Minus, Plus } from 'lucide-react';

import { FieldError } from '@/components/partidos/field-error';
import { IconButton } from '@/components/ui/icon-button';
import { CUPO_DEFAULT, CUPO_MAX, CUPO_MIN } from '@/types/partido';

const ERROR_ID = 'error-cupo';

type CupoStepperProps = {
  value: string;
  onChange: (cupo: string) => void;
  error?: string;
};

export function CupoStepper({ value, onChange, error }: CupoStepperProps) {
  const parsed = Number(value);
  const cupo = Number.isInteger(parsed) && parsed > 0 ? parsed : CUPO_DEFAULT;

  function shift(delta: number) {
    onChange(String(Math.min(CUPO_MAX, Math.max(CUPO_MIN, cupo + delta))));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3 rounded-md bg-glass px-4 py-3 shadow-bevel-lit">
        <span className="min-w-0 truncate text-callout font-semibold text-white">
          Jugadores totales
        </span>

        <div className="flex shrink-0 items-center gap-3">
          <IconButton
            label="Quitar un jugador"
            variant="soft"
            disabled={cupo <= CUPO_MIN}
            onClick={() => shift(-1)}
          >
            <Minus className="size-5" aria-hidden="true" />
          </IconButton>

          <span
            aria-live="polite"
            aria-describedby={error ? ERROR_ID : undefined}
            className="w-12 text-center text-[30px] font-bold tabular-nums text-white"
          >
            {cupo}
          </span>

          <IconButton
            label="Sumar un jugador"
            variant="brand"
            disabled={cupo >= CUPO_MAX}
            onClick={() => shift(1)}
          >
            <Plus className="size-5" aria-hidden="true" />
          </IconButton>
        </div>
      </div>

      <FieldError id={ERROR_ID} message={error} />
    </div>
  );
}
