import { X } from 'lucide-react';

import { IconButton } from '@/components/ui/icon-button';
import { PillButton } from '@/components/ui/pill-button';
import { Skeleton } from '@/components/ui/skeleton';

export function MatchCreationNotice({
  loading,
  message,
  onExit,
}: {
  loading: boolean;
  message: string | null;
  onExit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-base p-5 lg:static lg:min-h-[calc(100dvh-5rem)] lg:p-8">
      <section className="flex w-full max-w-md flex-col gap-6 rounded-lg bg-panel p-6 shadow-bevel">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-headline font-bold text-white">Crear partido</h1>
          <IconButton label="Salir de crear partido" onClick={onExit}>
            <X className="size-5" aria-hidden="true" />
          </IconButton>
        </div>
        {loading ? (
          <div role="status" className="flex flex-col gap-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
            <span className="sr-only">Comprobando tu perfil…</span>
          </div>
        ) : (
          <p role="alert" className="text-callout text-danger">
            {message}
          </p>
        )}
        <PillButton variant="glass" onClick={onExit}>
          Volver
        </PillButton>
      </section>
    </div>
  );
}
