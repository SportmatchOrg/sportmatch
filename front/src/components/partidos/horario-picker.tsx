'use client';

import { useEffect, useMemo, useRef } from 'react';

import { FieldError } from '@/components/partidos/field-error';
import { formatMatchDay, weekdayLabel } from '@/lib/match-date';
import { localDateTimeValue } from '@/lib/partido-form';
import { cn } from '@/lib/utils';

const ERROR_ID = 'error-fecha';

const DAYS_AHEAD = 14;
const MINUTE_STEP = 5;
const HOUR_MS = 3_600_000;
const LAST_MINUTE = 60 - MINUTE_STEP;

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

const MINUTES = Array.from({ length: 60 / MINUTE_STEP }, (_, index) => index * MINUTE_STEP);

const ROW = 'flex gap-2 overflow-x-auto pb-3';

const ROW_LABEL = 'text-overline text-ink-46 uppercase';

const ROW_VALUE = 'text-overline font-bold tabular-nums text-brand uppercase';

const OPTION =
  'flex w-14 shrink-0 flex-col items-center justify-center gap-1 rounded-sm py-2.5 transition active:scale-[var(--press-scale-chip)] disabled:cursor-not-allowed disabled:opacity-32';

const OPTION_SELECTED = 'bg-brand text-brand-ink shadow-glow';

const OPTION_IDLE = 'bg-glass text-white shadow-bevel hover:bg-glass-strong';

const OPTION_TOP = 'text-overline uppercase opacity-64';

const OPTION_VALUE = 'text-callout font-bold tabular-nums';

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

function isSameDay(one: Date, other: Date): boolean {
  return (
    one.getFullYear() === other.getFullYear() &&
    one.getMonth() === other.getMonth() &&
    one.getDate() === other.getDate()
  );
}

type HorarioPickerProps = {
  value: string;
  onChange: (fecha: string) => void;
  error?: string;
};

export function HorarioPicker({ value, onChange, error }: HorarioPickerProps) {
  const parsed = new Date(value);
  const selected = value && !Number.isNaN(parsed.getTime()) ? parsed : null;
  const current = selected ?? defaultFecha();
  const currentTime = current.getTime();
  const hasFecha = selected !== null;

  const dayRef = useRef<HTMLButtonElement | null>(null);
  const hourRef = useRef<HTMLButtonElement | null>(null);
  const minuteRef = useRef<HTMLButtonElement | null>(null);

  const days = useMemo(() => {
    const today = new Date();

    return Array.from(
      { length: DAYS_AHEAD },
      (_, index) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + index)
    );
  }, []);

  useEffect(() => {
    if (!hasFecha) onChange(localDateTimeValue(defaultFecha()));
  }, [hasFecha, onChange]);

  useEffect(() => {
    for (const ref of [dayRef, hourRef, minuteRef]) {
      ref.current?.scrollIntoView({ block: 'nearest', inline: 'center' });
    }
  }, [currentTime]);

  function slot(day: Date, hour: number, minute: number): Date {
    return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute);
  }

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
    <div className="flex flex-col gap-6">
      <FieldError id={ERROR_ID} message={error} />

      <div className="flex flex-col gap-3">
        <RowLabel label="Día" value={formatMatchDay(localDateTimeValue(current))} />

        <div className={ROW}>
          {days.map((day, index) => {
            const active = isSameDay(day, current);
            const disabled = isPast(slot(day, 23, LAST_MINUTE));

            return (
              <button
                key={day.toISOString()}
                ref={active ? dayRef : undefined}
                type="button"
                disabled={disabled}
                aria-pressed={active}
                onClick={() => pickDay(day)}
                className={cn(OPTION, active ? OPTION_SELECTED : OPTION_IDLE)}
              >
                <span className={OPTION_TOP}>{index === 0 ? 'Hoy' : weekdayLabel(day)}</span>
                <span className={OPTION_VALUE}>{day.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <RowLabel label="Hora" value={pad(current.getHours())} />

        <div className={ROW}>
          {HOURS.map((hour) => {
            const active = hour === current.getHours();
            const disabled = isPast(slot(current, hour, LAST_MINUTE));

            return (
              <button
                key={hour}
                ref={active ? hourRef : undefined}
                type="button"
                disabled={disabled}
                aria-pressed={active}
                aria-label={`${pad(hour)} horas`}
                onClick={() => pickHour(hour)}
                className={cn(OPTION, active ? OPTION_SELECTED : OPTION_IDLE)}
              >
                <span className={OPTION_TOP} aria-hidden="true">
                  H
                </span>
                <span className={OPTION_VALUE}>{pad(hour)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <RowLabel label="Minutos" value={pad(current.getMinutes())} />

        <div className={ROW}>
          {MINUTES.map((minute) => {
            const active = minute === current.getMinutes();
            const disabled = isPast(slot(current, current.getHours(), minute));

            return (
              <button
                key={minute}
                ref={active ? minuteRef : undefined}
                type="button"
                disabled={disabled}
                aria-pressed={active}
                aria-label={`${minute} minutos`}
                onClick={() => pickMinute(minute)}
                className={cn(OPTION, active ? OPTION_SELECTED : OPTION_IDLE)}
              >
                <span className={OPTION_TOP} aria-hidden="true">
                  Min
                </span>
                <span className={OPTION_VALUE}>{pad(minute)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
