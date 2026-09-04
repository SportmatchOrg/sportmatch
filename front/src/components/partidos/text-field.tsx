'use client';

import type { InputHTMLAttributes } from 'react';

import { FieldError } from '@/components/partidos/field-error';
import { cn } from '@/lib/utils';

const CONTROL =
  'w-full rounded-sm bg-glass px-4 py-3 text-body text-white shadow-bevel outline-none transition placeholder:text-white/46 focus:shadow-[inset_0_0_0_1px_var(--color-brand)]';

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  hideLabel?: boolean;
  error?: string;
};

export function TextField({
  id,
  label,
  hideLabel,
  error,
  className,
  ...inputProps
}: TextFieldProps) {
  const errorId = `error-${id}`;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={cn('text-overline text-ink-46 uppercase', hideLabel && 'sr-only')}>
        {label}
      </label>

      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(CONTROL, className)}
        {...inputProps}
      />

      <FieldError id={errorId} message={error} />
    </div>
  );
}
