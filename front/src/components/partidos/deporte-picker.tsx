'use client';

import { DEPORTE_ICON } from '@/components/partidos/deporte-icon';
import { FieldError } from '@/components/partidos/field-error';
import { cn } from '@/lib/utils';
import { DEPORTE_LABEL, type Deporte } from '@/types/partido';

const OPTION_BASE =
  'flex items-center gap-3 rounded-[20px] px-4 py-[18px] text-left text-[16.5px] font-bold tracking-[-0.34px] transition';

const OPTION_SELECTED = 'bg-brand text-midnight drop-shadow-brand-glow';

const OPTION_IDLE =
  'bg-glass text-white shadow-bevel hover:bg-glass-strong';

type DeportePickerProps = {
  deportes: Deporte[];
  loading: boolean;
  loadError: string | null;
  value: string;
  onChange: (deporteId: string) => void;
  error?: string;
};

const ERROR_ID = 'error-deporte';

export function DeportePicker({
  deportes,
  loading,
  loadError,
  value,
  onChange,
  error,
}: DeportePickerProps) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="sr-only">Deporte</legend>

      {loading && <p className="text-caption text-white/46">Cargando deportes…</p>}

      {!loading && loadError && (
        <p role="alert" className="text-caption text-danger">
          {loadError}
        </p>
      )}

      {!loading && !loadError && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {deportes.map((deporte) => {
            const Icon = DEPORTE_ICON[deporte.nombre];
            const selected = value === deporte.id;

            return (
              <button
                key={deporte.id}
                type="button"
                onClick={() => onChange(deporte.id)}
                aria-pressed={selected}
                aria-describedby={error ? ERROR_ID : undefined}
                className={cn(OPTION_BASE, selected ? OPTION_SELECTED : OPTION_IDLE)}
              >
                <Icon className="size-[22px] shrink-0" aria-hidden="true" />
                {DEPORTE_LABEL[deporte.nombre]}
              </button>
            );
          })}
        </div>
      )}

      <FieldError id={ERROR_ID} message={error} />
    </fieldset>
  );
}
