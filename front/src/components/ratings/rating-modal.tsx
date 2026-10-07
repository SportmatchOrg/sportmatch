'use client';

import { X } from 'lucide-react';
import { useRef, useState } from 'react';

import { NoShowStep } from '@/components/ratings/no-show-step';
import { RatingScoreStep } from '@/components/ratings/rating-score-step';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { IconButton } from '@/components/ui/icon-button';
import { PillButton } from '@/components/ui/pill-button';
import { ApiError } from '@/lib/api';
import { ratingSuccessMessage, ratingWindowClosed, submitRatings } from '@/lib/ratings';
import type { PublicUser } from '@/types/match';
import type { RatingAnswer, RatingFeedback, RatingInput } from '@/types/ratings';

const CONFLICT = 409;
const EMPTY_ANSWER: RatingAnswer = { score: 0, comment: '' };

type RatingModalProps = {
  matchId: string;
  targets: PublicUser[];
  players: PublicUser[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRated: (feedback: RatingFeedback) => void;
};

export function RatingModal(props: RatingModalProps) {
  return props.open ? <RatingForm key={props.matchId} {...props} /> : null;
}

function RatingForm({ matchId, targets, players, onOpenChange, onRated }: RatingModalProps) {
  const [stepIndex, setStepIndex] = useState(-1);
  const [noShowUserIds, setNoShowUserIds] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, RatingAnswer>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sending = useRef(false);
  const remainingTargets = targets.filter(({ id }) => !noShowUserIds.includes(id));
  const target = remainingTargets[stepIndex];
  const answer = target ? (answers[target.id] ?? EMPTY_ANSWER) : EMPTY_ANSWER;
  const isNoShowStep = stepIndex === -1;
  const isLastStep = stepIndex === remainingTargets.length - 1;

  function updateAnswer(patch: Partial<RatingAnswer>) {
    if (!target) return;
    setAnswers((previous) => ({
      ...previous,
      [target.id]: { ...EMPTY_ANSWER, ...previous[target.id], ...patch },
    }));
  }

  async function handleSubmit() {
    if (sending.current) return;
    const payload: RatingInput[] = remainingTargets.map(({ id }) => {
      const { score, comment } = answers[id] ?? EMPTY_ANSWER;
      return { ratedUserId: id, score, comment: comment.trim() || undefined };
    });
    if (payload.some(({ score }) => score === 0)) return;
    sending.current = true;
    setSubmitting(true);
    setError(null);
    try {
      await submitRatings(matchId, payload, noShowUserIds);
      onOpenChange(false);
      onRated({
        message: ratingSuccessMessage(payload.length, noShowUserIds.length),
        tone: 'success',
      });
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === CONFLICT) {
        onOpenChange(false);
        onRated({ message: 'Ya calificaste este partido', tone: 'info' });
      } else if (ratingWindowClosed(caught)) {
        onOpenChange(false);
        onRated({ message: 'La ventana de cierre de este partido ya terminó', tone: 'info' });
      } else {
        setError('No pudimos enviar tus calificaciones y faltas. Probá de nuevo.');
      }
    } finally {
      sending.current = false;
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!sending.current) onOpenChange(open);
      }}
    >
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="min-w-0">
              {isNoShowStep ? '¿Faltó alguien?' : 'Calificá a tus compañeros'}
            </DialogTitle>
            <IconButton
              label="Cerrar"
              variant="soft"
              size="sm"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
            >
              <X className="size-5" aria-hidden="true" />
            </IconButton>
          </div>
          <DialogDescription>
            {isNoShowStep
              ? 'Si el organizador o dos jugadores marcan a alguien, cuenta como falta.'
              : `${stepIndex + 1} de ${remainingTargets.length}`}
          </DialogDescription>
        </div>
        {error && (
          <p role="alert" className="text-caption text-danger">
            {error}
          </p>
        )}
        {isNoShowStep ? (
          <NoShowStep
            players={players}
            selectedIds={noShowUserIds}
            submitting={submitting}
            onToggle={(id, checked) =>
              setNoShowUserIds((previous) =>
                checked ? [...previous, id] : previous.filter((selected) => selected !== id)
              )
            }
            onContinue={() => (remainingTargets.length ? setStepIndex(0) : void handleSubmit())}
          />
        ) : (
          target && (
            <>
              <RatingScoreStep
                target={target}
                answer={answer}
                disabled={submitting}
                onChange={updateAnswer}
              />
              <div className="flex gap-3">
                <PillButton
                  variant="glass"
                  className="flex-1"
                  disabled={submitting}
                  onClick={() => setStepIndex((index) => index - 1)}
                >
                  Anterior
                </PillButton>
                <PillButton
                  className="flex-1"
                  disabled={answer.score === 0 || submitting}
                  onClick={() =>
                    isLastStep ? void handleSubmit() : setStepIndex((index) => index + 1)
                  }
                >
                  {submitting ? 'Enviando…' : isLastStep ? 'Enviar' : 'Siguiente'}
                </PillButton>
              </div>
            </>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
