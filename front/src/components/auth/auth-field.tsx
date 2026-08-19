import type { InputHTMLAttributes, ReactNode } from 'react';

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  icon: ReactNode;
  trailing?: ReactNode;
};

export function AuthField({ icon, trailing, className, ...inputProps }: AuthFieldProps) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400">
        {icon}
      </span>

      <input
        {...inputProps}
        className={[
          'w-full rounded-full border border-white/12 bg-surface-glass py-4 pl-14',
          trailing ? 'pr-14' : 'pr-5',
          'text-base text-white placeholder:text-neutral-400',
          'outline-none transition focus:border-sky-400/70 focus:ring-2 focus:ring-sky-400/20',
          'disabled:opacity-50',
          className ?? '',
        ].join(' ')}
      />

      {trailing && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2">{trailing}</span>
      )}
    </div>
  );
}
