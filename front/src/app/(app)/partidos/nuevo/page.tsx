'use client';

import { PartidoWizard } from '@/components/partidos/partido-wizard';
import { ApiError } from '@/lib/api';
import { formatMatchDay, formatMatchTime } from '@/lib/match-date';
import { EMPTY_MATCH_FORM } from '@/lib/match-form';
import { createMatch } from '@/lib/matches';
import { SPORT_LABEL, type Sport } from '@/types/match';

const GENERIC_ERROR = 'No pudimos crear el partido. Probá de nuevo.';

function publishedMessage(form: { date: string }, sport?: Sport): string {
  const label = sport ? SPORT_LABEL[sport.name] : '';

  return `Partido publicado · ${label} · ${formatMatchDay(form.date)} · ${formatMatchTime(form.date)}`;
}

export default function NewPartidoPage() {
  return (
    <PartidoWizard
      mode="create"
      initialForm={EMPTY_MATCH_FORM}
      submit={createMatch}
      toastMessage={publishedMessage}
      errorMessage={(error) => (error instanceof ApiError ? error.message : GENERIC_ERROR)}
      doneHref="/buscar"
    />
  );
}
