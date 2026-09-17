'use client';

import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

import { RatingModal } from '@/components/ratings/rating-modal';
import { PillButton } from '@/components/ui/pill-button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRatingTargets } from '@/hooks/use-rating-targets';

export function RatingSection({ matchId, played }: { matchId: string; played: boolean }) {
  const { targets, loading, allowed, reload } = useRatingTargets(matchId, played);
  const [open, setOpen] = useState(false);

  if (!played || !allowed) return null;

  if (loading) {
    return <Skeleton className="h-13 w-full rounded-full" />;
  }

  if (targets.length === 0) {
    return (
      <p className="flex items-center gap-3 text-callout font-semibold text-ink-64">
        <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden="true" />
        Ya calificaste este partido
      </p>
    );
  }

  return (
    <>
      <PillButton onClick={() => setOpen(true)}>Calificar jugadores</PillButton>

      <RatingModal
        matchId={matchId}
        targets={targets}
        open={open}
        onOpenChange={setOpen}
        onRated={reload}
      />
    </>
  );
}
