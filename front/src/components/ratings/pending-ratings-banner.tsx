'use client';

import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';

import { RatingModal } from '@/components/ratings/rating-modal';
import { PillButton } from '@/components/ui/pill-button';
import { TOAST_DURATION, Toast } from '@/components/ui/toast';
import { formatMatchDay, formatMatchTime } from '@/lib/match-date';
import { fetchRatingTargets } from '@/lib/ratings';
import { DEPORTE_LABEL, type Partido, type PublicUser } from '@/types/partido';

const OPEN_ERROR = 'No pudimos abrir la calificación. Probá de nuevo.';

type OpenMatch = {
  id: string;
  targets: PublicUser[];
};

export function PendingRatingsBanner({
  matches,
  onRated,
}: {
  matches: Partido[];
  onRated: () => void;
}) {
  const [openMatch, setOpenMatch] = useState<OpenMatch | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), TOAST_DURATION);

    return () => clearTimeout(timer);
  }, [toast]);

  if (matches.length === 0) return null;

  async function openRating(matchId: string) {
    setLoadingId(matchId);

    try {
      const { targets } = await fetchRatingTargets(matchId);

      if (targets.length === 0) {
        onRated();
        return;
      }

      setOpenMatch({ id: matchId, targets });
    } catch {
      setToast(OPEN_ERROR);
    } finally {
      setLoadingId(null);
    }
  }

  const title =
    matches.length === 1
      ? 'Tenés 1 partido sin calificar'
      : `Tenés ${matches.length} partidos sin calificar`;

  return (
    <>
      <section className="flex w-full flex-col gap-3 rounded-md bg-glass p-4 shadow-bevel-lit">
        <div className="flex items-start gap-3">
          <Star className="size-5 shrink-0 fill-warning text-warning" aria-hidden="true" />

          <div className="flex flex-col gap-1">
            <h2 className="text-subhead text-white">{title}</h2>
            <p className="text-caption text-ink-64">
              Calificá a tus compañeros para que su puntaje refleje cómo juegan
            </p>
          </div>
        </div>

        <ul className="flex flex-col divide-y divide-glass-border">
          {matches.map((partido) => (
            <li
              key={partido.id}
              className="flex items-center gap-4 py-2.5 first:pt-0 last:pb-0"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-callout font-semibold text-white">
                  {DEPORTE_LABEL[partido.deporte.nombre]} · {partido.ubicacion}
                </span>
                <span className="text-caption text-ink-46">
                  {formatMatchDay(partido.fecha)} · {formatMatchTime(partido.fecha)}
                </span>
              </span>

              <PillButton
                size="md"
                className="shrink-0"
                disabled={loadingId !== null}
                onClick={() => void openRating(partido.id)}
              >
                {loadingId === partido.id ? 'Abriendo…' : 'Calificar'}
              </PillButton>
            </li>
          ))}
        </ul>
      </section>

      {openMatch && (
        <RatingModal
          matchId={openMatch.id}
          targets={openMatch.targets}
          open
          onOpenChange={(open) => {
            if (!open) setOpenMatch(null);
          }}
          onRated={onRated}
        />
      )}

      {toast && (
        <div className="fixed inset-x-0 top-16 z-50 flex justify-center px-4">
          <Toast message={toast} tone="danger" />
        </div>
      )}
    </>
  );
}
