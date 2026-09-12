'use client';

import { Pencil, Search } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

import { PartidoWizard } from '@/components/partidos/partido-wizard';
import { LoadingScreen } from '@/components/loading-screen';
import { EmptyState } from '@/components/ui/empty-state';
import { useCurrentUser } from '@/hooks/use-current-user';
import { usePartido } from '@/hooks/use-partido';
import { ApiError } from '@/lib/api';
import { formatMatchDay, formatMatchTime } from '@/lib/match-date';
import { toPartidoForm } from '@/lib/partido-form';
import { updatePartido } from '@/lib/partidos';
import { DEPORTE_LABEL, type Deporte } from '@/types/partido';

const FORBIDDEN = 403;
const NOT_FOUND = 404;
const INVALID = 400;

function updatedMessage(form: { fecha: string }, deporte?: Deporte): string {
  const label = deporte ? DEPORTE_LABEL[deporte.nombre] : '';

  return `Cambios guardados · ${label} · ${formatMatchDay(form.fecha)} · ${formatMatchTime(form.fecha)}`;
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

export default function EditPartidoPage({ params }: PageProps<'/partidos/[id]/editar'>) {
  const { id } = use(params);
  const { partido, loading: partidoLoading, notFound, error } = usePartido(id);
  const { user, loading: userLoading } = useCurrentUser();

  if (partidoLoading || userLoading) {
    return <LoadingScreen />;
  }

  if (notFound || !partido) {
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

  const isOrganizer = user?.id === partido.organizador.id;
  const isPlayed = new Date(partido.fecha) <= new Date();

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
    <PartidoWizard
      mode="edit"
      initialForm={toPartidoForm(partido)}
      submit={(form) => updatePartido(id, form)}
      toastMessage={updatedMessage}
      errorMessage={updateErrorMessage}
      doneHref={`/partidos/${id}`}
    />
  );
}
