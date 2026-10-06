'use client';

import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

import { RatingModal } from '@/components/ratings/rating-modal';
import { PillButton } from '@/components/ui/pill-button';
import { Skeleton } from '@/components/ui/skeleton';
import { Toast } from '@/components/ui/toast';
import { useRatingFeedback } from '@/hooks/use-rating-feedback';
import { useRatingTargets } from '@/hooks/use-rating-targets';

export function RatingSection({ matchId, played }: { matchId: string; played: boolean }) {
  const { targets, players, loading, allowed, error, reload } = useRatingTargets(matchId, played);
  const [open, setOpen] = useState(false);
  const { feedback, setFeedback } = useRatingFeedback();

  return (
    <>
      {played &&
        allowed &&
        (loading ? (
          <Skeleton className="h-13 w-full rounded-full" />
        ) : error ? (
          <div className="flex flex-col gap-3">
            <p role="alert" className="text-caption text-danger">
              {error}
            </p>
            <PillButton variant="glass" onClick={reload}>
              Reintentar
            </PillButton>
          </div>
        ) : players.length === 0 ? (
          <p className="flex items-center gap-3 text-callout font-semibold text-ink-64">
            <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden="true" />
            Ya calificaste este partido
          </p>
        ) : (
          <PillButton onClick={() => setOpen(true)}>Calificar jugadores</PillButton>
        ))}
      <RatingModal
        matchId={matchId}
        targets={targets}
        players={players}
        open={open}
        onOpenChange={setOpen}
        onRated={(result) => {
          setFeedback(result);
          reload();
        }}
      />
      {feedback && (
        <div className="fixed inset-x-0 top-16 z-50 flex justify-center px-4">
          <Toast message={feedback.message} tone={feedback.tone} />
        </div>
      )}
    </>
  );
}
