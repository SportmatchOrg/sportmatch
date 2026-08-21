import { Loader2 } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-base">
      <Loader2 className="size-6 animate-spin text-neutral-400" aria-hidden="true" />
      <span className="sr-only">Cargando…</span>
    </div>
  );
}
