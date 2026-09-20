'use client';

import { CalendarDays, Compass, Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { JoinRequestsPanel } from '@/components/partidos/join-requests-panel';
import { MisPartidosSection } from '@/components/partidos/mis-partidos-section';
import { LoadingScreen } from '@/components/loading-screen';
import { ConfirmAction } from '@/components/ui/confirm-action';
import { EmptyState } from '@/components/ui/empty-state';
import { TOAST_DURATION, Toast, type ToastTone } from '@/components/ui/toast';
import { useMyMatches } from '@/hooks/use-my-matches';
import { NEW_MATCH_HREF } from '@/lib/nav-items';
import { cancelJoinRequest, cancelMatch, leaveMatch } from '@/lib/matches';
import { SPORT_LABEL, type Match } from '@/types/match';

const CANCEL_ERROR = 'No pudimos cancelar el partido. Probá de nuevo.';

const LEAVE_ERROR = 'No pudimos darte de baja. Probá de nuevo.';

const CANCEL_REQUEST_ERROR = 'No pudimos cancelar la solicitud. Probá de nuevo.';

const POLL_INTERVAL_MS = 2_000;

const EMPTY_ACTION =
  'flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-callout font-bold text-brand-ink shadow-glow transition hover:bg-brand-bright';

type PageToast = { message: string; tone: ToastTone };

function matchLabel(match: Match): string {
  return `${SPORT_LABEL[match.sport.name]} · ${match.location}`;
}

export default function MisPartidosPage() {
  const { organizing, playing, requested, loading, error, reload } = useMyMatches({
    pollIntervalMs: POLL_INTERVAL_MS,
  });

  const [pendingId, setPendingId] = useState<string | null>(null);
  const [toast, setToast] = useState<PageToast | null>(null);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), TOAST_DURATION);

    return () => clearTimeout(timer);
  }, [toast]);

  async function run(
    match: Match,
    action: (partidoId: string) => Promise<void>,
    success: PageToast,
    failure: string
  ) {
    if (pendingId) return;

    setPendingId(match.id);

    try {
      await action(match.id);
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

  const sinPartidos = organizing.length === 0 && playing.length === 0 && requested.length === 0;

  return (
    <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-5 py-8 lg:px-8">
      <header className="flex flex-col gap-2">
        <span className="text-overline text-brand uppercase">Tu agenda</span>
        <h1 className="text-display text-[36px] text-white lg:text-[44px]">Tus partidos</h1>

        {!sinPartidos && (
          <p className="text-callout text-ink-46 lg:hidden">
            {organizing.length} organizando · {playing.length} anotado · {requested.length} esperando
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
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-8">
          <MisPartidosSection
            title="Organizás"
            subtitle="Aprobá quién se suma a los partidos que creaste"
            matches={organizing}
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
            renderPanel={(match) => (
              <JoinRequestsPanel
                partidoId={match.id}
                capacity={match.capacity}
                joinedCount={match.joinedCount}
                isOrganizer
                onResolved={reload}
              />
            )}
            renderAction={(match) => (
              <div className="flex items-center gap-3">
                <Link
                  href={`/partidos/${match.id}/editar`}
                  className="shrink-0 text-callout font-semibold text-brand transition hover:text-brand-bright"
                >
                  Editar
                </Link>

                <ConfirmAction
                  variant="ghost"
                  label="Cancelar partido"
                  message="Se cancela para todos los jugadores. No se puede deshacer."
                  cancelLabel="Volver"
                  confirmLabel="Sí, cancelar"
                  pendingLabel="Cancelando…"
                  pending={pendingId === match.id}
                  onConfirm={() =>
                    void run(
                      match,
                      cancelMatch,
                      { message: `Partido cancelado · ${matchLabel(match)}`, tone: 'danger' },
                      CANCEL_ERROR
                    )
                  }
                />
              </div>
            )}
          />

          <MisPartidosSection
            title="Jugás"
            subtitle="Partidos a los que te sumaste"
            matches={playing}
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
            renderAction={(match) => (
              <ConfirmAction
                label="Cancelar mi lugar"
                message="Se libera tu lugar para que lo tome otra persona."
                cancelLabel="Mejor no"
                confirmLabel="Salirme"
                pendingLabel="Saliendo…"
                pending={pendingId === match.id}
                onConfirm={() =>
                  void run(
                    match,
                    leaveMatch,
                    { message: `Te bajaste · ${matchLabel(match)}`, tone: 'info' },
                    LEAVE_ERROR
                  )
                }
              />
            )}
          />

          {requested.length > 0 && (
            <div className="lg:col-start-2">
              <MisPartidosSection
                title="Esperando respuesta"
                subtitle="El organizador todavía no te respondió"
                matches={requested}
                role="player"
                empty={null}
                renderAction={(match) => (
                  <ConfirmAction
                    label="Cancelar solicitud"
                    message="Se cancela tu solicitud para sumarte al partido."
                    cancelLabel="Mejor no"
                    confirmLabel="Cancelar solicitud"
                    pendingLabel="Cancelando…"
                    pending={pendingId === match.id}
                    onConfirm={() =>
                      void run(
                        match,
                        cancelJoinRequest,
                        {
                          message: `Cancelaste tu solicitud · ${matchLabel(match)}`,
                          tone: 'info',
                        },
                        CANCEL_REQUEST_ERROR
                      )
                    }
                  />
                )}
              />
            </div>
          )}
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
