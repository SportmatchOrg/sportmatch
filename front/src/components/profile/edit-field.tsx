import type { ReactNode } from 'react';

type EditFieldProps = {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
};

export function editFieldErrorId(id: string): string {
  return `${id}-error`;
}

export function EditField({ id, label, error, children }: EditFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="pl-1 text-overline text-ink-46 uppercase">
        {label}
      </label>

      {children}

      {error && (
        <p id={editFieldErrorId(id)} role="alert" className="pl-5 text-caption text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
