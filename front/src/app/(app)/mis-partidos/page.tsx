'use client';

import { CalendarDays, Compass, Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { MisPartidosSection } from '@/components/partidos/mis-partidos-section';
import { LoadingScreen } from '@/components/loading-screen';
import { ConfirmAction } from '@/components/ui/confirm-action';
import { EmptyState } from '@/components/ui/empty-state';
import { Toast, type ToastTone } from '@/components/ui/toast';
import { usePartidosMios } from '@/hooks/use-partidos-mios';
import { NEW_MATCH_HREF } from '@/lib/nav-items';
import { cancelPartido, leavePartido } from '@/lib/partidos';
import { DEPORTE_LABEL, type Partido } from '@/types/partido';

const TOAST_DURATION = 2800;

const CANCEL_ERROR = 'No pudimos cancelar el partido. Probá de nuevo.';

const LEAVE_ERROR = 'No pudimos darte de baja. Probá de nuevo.';

const EMPTY_ACTION =
  'flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-callout font-bold text-brand-ink shadow-glow transition hover:bg-brand-bright';

type PageToast = { message: string; tone: ToastTone };

function partidoLabel(partido: Partido): string {
  return `${DEPORTE_LABEL[partido.deporte.nombre]} · ${partido.ubicacion}`;
}

export default function MisPartidosPage() {
  const { organizo, juego, loading, error, reload } = usePartidosMios();

  const [pendingId, setPendingId] = useState<string | null>(null);
  const [toast, setToast] = useState<PageToast | null>(null);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), TOAST_DURATION);

    return () => clearTimeout(timer);
  }, [toast]);

  async function run(
    partido: Partido,
    action: (partidoId: string) => Promise<void>,
    success: PageToast,
    failure: string
  ) {
    if (pendingId) return;

    setPendingId(partido.id);

    try {
      await action(partido.id);
      setToast(success);
      reload();
    } catch {
      setToast({ message: failure, tone: 'danger' });
    } finally {
      setPendingId(null);
    }
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-col items-center gap-2 px-5 py-16 text-center">
        <h1 className="text-title font-bold text-white">No pudimos cargar tus partidos</h1>
        <p className="text-body text-ink-46">{error}</p>
      </main>
    );
  }

  const sinPartidos = organizo.length === 0 && juego.length === 0;

  return (
    <main className="mx-auto w-full max-w-[1400px] px-5 py-8 lg:px-8">
      <header className="flex flex-col gap-2">
        <span className="text-overline text-brand uppercase">Tu agenda</span>
        <h1 className="text-display text-[36px] text-white lg:text-[44px]">Tus partidos</h1>

        {!sinPartidos && (
          <p className="text-callout text-ink-46">
            {organizo.length} organizando · {juego.length} anotado
          </p>
        )}
      </header>

      {sinPartidos ? (
        <div className="py-20">
          <EmptyState
            icon={CalendarDays}
            title="Todavía no tenés partidos"
            text="Creá uno o sumate a alguno que esté buscando jugadores."
            action={
              <Link href={NEW_MATCH_HREF} className={EMPTY_ACTION}>
                <Plus className="size-[18px]" aria-hidden="true" />
                Crear partido
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-8">
          <MisPartidosSection
            title="Organizás"
            subtitle="Los partidos que creaste"
            partidos={organizo}
            role="host"
            empty={
              <EmptyState
                icon={Plus}
                title="No organizás ninguno"
                text="Creá un partido y esperá a que se sumen jugadores."
                action={
                  <Link href={NEW_MATCH_HREF} className={EMPTY_ACTION}>
                    <Plus className="size-[18px]" aria-hidden="true" />
                    Crear partido
                  </Link>
                }
              />
            }
            renderAction={(partido) => (
              <ConfirmAction
                variant="ghost"
                label="Cancelar partido"
                message="Se cancela para todos los jugadores. No se puede deshacer."
                cancelLabel="Volver"
                confirmLabel="Sí, cancelar"
                pendingLabel="Cancelando…"
                pending={pendingId === partido.id}
                onConfirm={() =>
                  void run(
                    partido,
                    cancelPartido,
                    { message: `Partido cancelado · ${partidoLabel(partido)}`, tone: 'danger' },
                    CANCEL_ERROR
                  )
                }
              />
            )}
          />

          <MisPartidosSection
            title="Jugás"
            subtitle="Partidos a los que te sumaste"
            partidos={juego}
            role="player"
            empty={
              <EmptyState
                icon={Compass}
                title="No estás anotado en ninguno"
                text="Buscá partidos cerca tuyo y sumate al que te guste."
                action={
                  <Link href="/buscar" className={EMPTY_ACTION}>
                    <Compass className="size-[18px]" aria-hidden="true" />
                    Ver partidos
                  </Link>
                }
              />
            }
            renderAction={(partido) => (
              <ConfirmAction
                label="Cancelar mi lugar"
                message="Se libera tu lugar para que lo tome otra persona."
                cancelLabel="Mejor no"
                confirmLabel="Salirme"
                pendingLabel="Saliendo…"
                pending={pendingId === partido.id}
                onConfirm={() =>
                  void run(
                    partido,
                    leavePartido,
                    { message: `Te bajaste · ${partidoLabel(partido)}`, tone: 'info' },
                    LEAVE_ERROR
                  )
                }
              />
            )}
          />
        </div>
      )}

      {toast && (
        <div className="fixed inset-x-0 top-16 z-50 flex justify-center px-4">
          <Toast message={toast.message} tone={toast.tone} />
        </div>
      )}
    </main>
  );
}
