'use client';

import { PartidoWizard } from '@/components/partidos/partido-wizard';
import { ApiError } from '@/lib/api';
import { formatMatchDay, formatMatchTime } from '@/lib/match-date';
import { EMPTY_PARTIDO_FORM } from '@/lib/partido-form';
import { createPartido } from '@/lib/partidos';
import { DEPORTE_LABEL, type Deporte } from '@/types/partido';

const GENERIC_ERROR = 'No pudimos crear el partido. Probá de nuevo.';

function publishedMessage(form: { fecha: string }, deporte?: Deporte): string {
  const label = deporte ? DEPORTE_LABEL[deporte.nombre] : '';

  return `Partido publicado · ${label} · ${formatMatchDay(form.fecha)} · ${formatMatchTime(form.fecha)}`;
}

export default function NewPartidoPage() {
  return (
    <PartidoWizard
      mode="create"
      initialForm={EMPTY_PARTIDO_FORM}
      submit={createPartido}
      toastMessage={publishedMessage}
      errorMessage={(error) => (error instanceof ApiError ? error.message : GENERIC_ERROR)}
      doneHref="/buscar"
    />
  );
}
