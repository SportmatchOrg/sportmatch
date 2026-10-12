'use client';

import { ChevronDown } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { es } from 'react-day-picker/locale';

import { FieldError } from '@/components/matches/field-error';
import { Calendar } from '@/components/ui/calendar';
import { formatMatchDay, formatMatchTime } from '@/lib/match-date';
import { localDateTimeValue } from '@/lib/match-form';

const ERROR_ID = 'error-fecha';

const MINUTE_STEP = 5;
const HOUR_MS = 3_600_000;
const LAST_MINUTE = 60 - MINUTE_STEP;

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

const MINUTES = Array.from({ length: 60 / MINUTE_STEP }, (_, index) => index * MINUTE_STEP);

const ROW_LABEL = 'text-overline text-ink-46 uppercase';

const ROW_VALUE = 'text-overline font-bold tabular-nums text-brand uppercase';

const SELECT =
  'h-12 w-full appearance-none rounded-sm bg-glass pr-10 pl-4 text-callout font-bold tabular-nums text-white shadow-bevel transition outline-none [color-scheme:dark] hover:bg-glass-strong focus-visible:ring-2 focus-visible:ring-brand';

function RowLabel({ label, value }: { label: string; value: string }) {
  return (
    <span className={ROW_LABEL}>
      {label} · <span className={ROW_VALUE}>{value}</span>
    </span>
  );
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function isPast(date: Date): boolean {
  return date.getTime() <= Date.now();
}

function defaultFecha(): Date {
  const start = new Date(Date.now() + HOUR_MS);
  start.setMinutes(0, 0, 0);

  return start;
}

function slot(day: Date, hour: number, minute: number): Date {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute);
}

type TimeSelectProps = {
  label: string;
  value: number;
  options: number[];
  isDisabled: (option: number) => boolean;
  onChange: (option: number) => void;
};

function TimeSelect({ label, value, options, isDisabled, onChange }: TimeSelectProps) {
  return (
    <label className="relative flex-1">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={SELECT}
      >
        {options.map((option) => (
          <option key={option} value={option} disabled={isDisabled(option)}>
            {pad(option)}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-ink-46"
        aria-hidden="true"
      />
    </label>
  );
}

type HorarioPickerProps = {
  value: string;
  onChange: (date: string) => void;
  error?: string;
};

export function SchedulePicker({ value, onChange, error }: HorarioPickerProps) {
  const parsed = new Date(value);
  const selected = value && !Number.isNaN(parsed.getTime()) ? parsed : null;
  const current = selected ?? defaultFecha();
  const hasFecha = selected !== null;
  const currentValue = localDateTimeValue(current);

  const today = useMemo(() => {
    const now = new Date();

    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  // A match saved with minutes outside the 5-minute steps still shows its own time.
  const currentMinute = current.getMinutes();
  const minutes = MINUTES.includes(currentMinute)
    ? MINUTES
    : [...MINUTES, currentMinute].sort((first, second) => first - second);

  useEffect(() => {
    if (!hasFecha) onChange(localDateTimeValue(defaultFecha()));
  }, [hasFecha, onChange]);

  function emit(next: Date) {
    onChange(localDateTimeValue(next));
  }

  function pickDay(day: Date) {
    const next = slot(day, current.getHours(), current.getMinutes());

    emit(isPast(next) ? defaultFecha() : next);
  }

  function pickHour(hour: number) {
    const next = slot(current, hour, current.getMinutes());

    if (!isPast(next)) {
      emit(next);
      return;
    }

    const firstFree = MINUTES.find((minute) => !isPast(slot(current, hour, minute)));

    emit(slot(current, hour, firstFree ?? 0));
  }

  function pickMinute(minute: number) {
    emit(slot(current, current.getHours(), minute));
  }

  return (
    <div className="flex flex-col gap-6 lg:h-full lg:flex-row lg:gap-10">
      <div className="flex flex-col gap-3 lg:min-h-0 lg:max-w-xl lg:flex-1">
        <FieldError id={ERROR_ID} message={error} />

        <RowLabel label="Día" value={formatMatchDay(currentValue)} />

        <Calendar
          mode="single"
          required
          selected={current}
          onSelect={pickDay}
          defaultMonth={current}
          startMonth={today}
          disabled={{ before: today }}
          locale={es}
        />
      </div>

      <div className="flex flex-col gap-3 lg:w-56">
        <RowLabel label="Hora" value={formatMatchTime(currentValue)} />

        <div className="flex items-center gap-2">
          <TimeSelect
            label="Hora"
            value={current.getHours()}
            options={HOURS}
            isDisabled={(hour) => isPast(slot(current, hour, LAST_MINUTE))}
            onChange={pickHour}
          />
          <span className="text-callout font-bold text-ink-46" aria-hidden="true">
            :
          </span>
          <TimeSelect
            label="Minutos"
            value={current.getMinutes()}
            options={minutes}
            isDisabled={(minute) => isPast(slot(current, current.getHours(), minute))}
            onChange={pickMinute}
          />
        </div>
      </div>
    </div>
  );
}
