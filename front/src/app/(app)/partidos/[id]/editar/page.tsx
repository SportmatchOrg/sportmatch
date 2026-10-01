'use client';

import { Pencil, Search } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

import { MatchWizard } from '@/components/matches/match-wizard';
import { LoadingScreen } from '@/components/loading-screen';
import { EmptyState } from '@/components/ui/empty-state';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useMatch } from '@/hooks/use-match';
import { ApiError } from '@/lib/api';
import { formatMatchDay, formatMatchTime } from '@/lib/match-date';
import { toMatchForm } from '@/lib/match-form';
import { updateMatch } from '@/lib/matches';
import { SPORT_LABEL, type Sport } from '@/types/match';

const FORBIDDEN = 403;
const NOT_FOUND = 404;
const INVALID = 400;

function updatedMessage(form: { date: string }, sport?: Sport): string {
  const label = sport ? SPORT_LABEL[sport.name] : '';

  return `Cambios guardados · ${label} · ${formatMatchDay(form.date)} · ${formatMatchTime(form.date)}`;
}

function updateErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return 'No pudimos guardar los cambios. Probá de nuevo.';
  }

  if (error.status === FORBIDDEN) {
    return 'Solo el organizador puede editar este partido.';
  }

  if (error.status === NOT_FOUND) {
    return 'No encontramos este partido.';
  }

  if (error.status === INVALID) {
    return 'Revisá la fecha y el cupo: no podés poner una fecha pasada ni un cupo menor a los jugadores ya anotados.';
  }

  return 'No pudimos guardar los cambios. Probá de nuevo.';
}

export default function EditMatchPage({ params }: PageProps<'/partidos/[id]/editar'>) {
  const { id } = use(params);
  const { match, loading: partidoLoading, notFound, error } = useMatch(id);
  const { user, loading: userLoading } = useCurrentUser();

  if (partidoLoading || userLoading) {
    return <LoadingScreen />;
  }

  if (notFound || !match) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-8">
        <EmptyState
          icon={Search}
          title={notFound ? 'No encontramos este partido' : 'No pudimos cargar el partido'}
          text={notFound ? 'Puede que se haya cancelado o que el link esté mal.' : (error ?? '')}
          action={
            <Link href="/mis-partidos" className="text-callout font-semibold text-brand">
              Volver a mis partidos
            </Link>
          }
        />
      </main>
    );
  }

  const isOrganizer = user?.id === match.organizer.id;
  const isPlayed = new Date(match.date) <= new Date();

  if (!isOrganizer || isPlayed) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-8">
        <EmptyState
          icon={Pencil}
          title={
            isPlayed
              ? 'No podés editar un partido ya jugado'
              : 'Solo el organizador puede editar este partido'
          }
          text={
            isPlayed
              ? 'Los partidos que ya se jugaron no se pueden modificar.'
              : 'Volvé al detalle para consultar la información del partido.'
          }
          action={
            <Link href={`/partidos/${id}`} className="text-callout font-semibold text-brand">
              Ver partido
            </Link>
          }
        />
      </main>
    );
  }

  return (
    <MatchWizard
      mode="edit"
      initialForm={toMatchForm(match)}
      submit={(form) => updateMatch(id, form)}
      toastMessage={updatedMessage}
      errorMessage={updateErrorMessage}
      doneHref={`/partidos/${id}`}
    />
  );
}
