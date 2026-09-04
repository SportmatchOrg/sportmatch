'use client';

import type { TextareaHTMLAttributes } from 'react';

import { FieldError } from '@/components/partidos/field-error';
import { cn } from '@/lib/utils';

const CONTROL =
  'w-full resize-y rounded-sm bg-glass px-4 py-3 text-body text-white shadow-bevel outline-none transition placeholder:text-white/46 focus:shadow-[inset_0_0_0_1px_var(--color-brand)]';

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
};

export function TextareaField({
  id,
  label,
  hint,
  error,
  className,
  ...textareaProps
}: TextareaFieldProps) {
  const errorId = `error-${id}`;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="flex items-baseline gap-2 text-overline text-ink-46 uppercase">
        {label}
        {hint && <span className="text-caption text-white/46">{hint}</span>}
      </label>

      <textarea
        id={id}
        rows={4}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(CONTROL, className)}
        {...textareaProps}
      />

      <FieldError id={errorId} message={error} />
    </div>
  );
}
