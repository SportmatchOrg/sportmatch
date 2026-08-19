import type { ReactNode } from 'react';

export function SubmitButton({
  loading,
  children,
}: {
  loading: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-full bg-sky-500 py-4 text-base font-bold text-neutral-950 shadow-[0_0_28px_-6px_rgba(56,189,248,0.8)] transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
    >
      {loading ? 'Procesando…' : children}
    </button>
  );
}
