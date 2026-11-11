'use client';

import { CalendarDays, Compass, Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

import { CancelMatchDialog } from '@/components/matches/cancel-match-dialog';
import { JoinRequestsPanel } from '@/components/matches/join-requests-panel';
import { MyMatchesSection } from '@/components/matches/my-matches-section';
import { MatchActions } from '@/components/matches/match-actions';
import { LoadingScreen } from '@/components/loading-screen';
import { ConfirmAction } from '@/components/ui/confirm-action';
import { EmptyState } from '@/components/ui/empty-state';
import { TOAST_DURATION, Toast } from '@/components/ui/toast';
import { useMyMatchesActions } from '@/hooks/use-my-matches-actions';
import { useMyMatches } from '@/hooks/use-my-matches';
import { useCurrentUser } from '@/hooks/use-current-user';
import { NEW_MATCH_HREF } from '@/lib/nav-items';
import { SPORT_LABEL, type Match } from '@/types/match';

const POLL_INTERVAL_MS = 2_000;

const EMPTY_ACTION =
  'flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-callout font-bold text-brand-ink shadow-glow transition hover:bg-brand-bright';

function matchLabel(match: Match): string {
  return `${SPORT_LABEL[match.sport.name]} · ${match.location}`;
}

function canceledLast(matches: Match[]): Match[] {
  return [...matches].sort(
    (a, b) => Number(a.status === 'CANCELED') - Number(b.status === 'CANCELED')
  );
}

export default function MyMatchesPage() {
  const { organizing, playing, requested, invited, loading, error } = useMyMatches({
    pollIntervalMs: POLL_INTERVAL_MS,
  });
  const { user, loading: userLoading } = useCurrentUser();
  const { pendingId, busy, toast, clearToast, leave, cancelRequest, cancelHostedMatch } =
    useMyMatchesActions();

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(clearToast, TOAST_DURATION);

    return () => clearTimeout(timer);
  }, [toast, clearToast]);

  if (loading || (invited.length > 0 && userLoading)) {
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

  const sinPartidos = organizing.length === 0 && playing.length === 0
    && requested.length === 0 && invited.length === 0;

  return (
    <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-5 py-8 lg:px-8">
      <header className="flex flex-col gap-2">
        <span className="text-overline text-brand uppercase">Tu agenda</span>
        <h1 className="text-display text-[36px] text-white lg:text-[44px]">Tus partidos</h1>

        {!sinPartidos && (
          <p className="text-callout text-ink-46 lg:hidden">
            {organizing.length} organizando · {playing.length} anotado · {requested.length} esperando
            {invited.length > 0 && ` · ${invited.length} invitaciones`}
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
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-8">
          {invited.length > 0 && (
            <div className="lg:col-span-2">
              <MyMatchesSection
                title="Invitaciones"
                subtitle="Te invitaron a estos partidos"
                matches={invited}
                role="player"
                empty={null}
                renderAction={(match) => (
                  <MatchActions
                    match={match}
                    isOrganizer={false}
                    suspendedUntil={user?.stats.suspendedUntil ?? null}
                    requestReady={!!user}
                    disabled={busy}
                  />
                )}
              />
            </div>
          )}

          <MyMatchesSection
            title="Organizás"
            subtitle="Aprobá quién se suma a los partidos que creaste"
            matches={canceledLast(organizing)}
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

                <CancelMatchDialog
                  pending={pendingId === match.id}
                  disabled={busy}
                  onConfirm={(reason) => cancelHostedMatch(match.id, reason, matchLabel(match))}
                />
              </div>
            )}
          />

          <MyMatchesSection
            title="Jugás"
            subtitle="Partidos a los que te sumaste"
            matches={canceledLast(playing)}
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
                disabled={busy}
                onConfirm={() => void leave(match.id, matchLabel(match))}
              />
            )}
          />

          {requested.length > 0 && (
            <div className="lg:col-start-2">
              <MyMatchesSection
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
                    disabled={busy}
                    onConfirm={() => void cancelRequest(match.id, matchLabel(match))}
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
