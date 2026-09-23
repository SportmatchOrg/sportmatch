"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { TextareaField } from "@/components/matches/textarea-field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import PeekRating from "@/components/ui/peek-rating";
import { PillButton } from "@/components/ui/pill-button";
import { TOAST_DURATION, Toast, type ToastTone } from "@/components/ui/toast";
import { UserAvatar } from "@/components/user-avatar";
import { ApiError } from "@/lib/api";
import { submitRatings, type RatingInput } from "@/lib/ratings";
import type { PublicUser } from "@/types/match";

const SCORE_LABELS = ["Flojo", "Regular", "Bien", "Muy bien", "Crack"];
const COMMENT_MAX = 280;
const CONFLICT = 409;
const EMPTY_ANSWER: Answer = { score: 0, comment: "" };

type Answer = { score: number; comment: string };

type ToastState = { message: string; tone: ToastTone };

export function RatingModal({
  matchId,
  targets,
  open,
  onOpenChange,
  onRated,
}: {
  matchId: string;
  targets: PublicUser[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRated: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), TOAST_DURATION);

    return () => clearTimeout(timer);
  }, [toast]);

  const target = targets[stepIndex];
  const answer = target ? (answers[target.id] ?? EMPTY_ANSWER) : EMPTY_ANSWER;
  const isLastStep = stepIndex === targets.length - 1;

  function updateAnswer(patch: Partial<Answer>) {
    if (!target) return;

    setAnswers((previous) => ({
      ...previous,
      [target.id]: { ...EMPTY_ANSWER, ...previous[target.id], ...patch },
    }));
  }

  async function handleSubmit() {
    setSubmitting(true);

    const payload: RatingInput[] = targets.map(({ id }) => {
      const { score, comment } = answers[id] ?? EMPTY_ANSWER;

      return { ratedUserId: id, score, comment: comment.trim() || undefined };
    });

    try {
      await submitRatings(matchId, payload);
      onOpenChange(false);
      setToast({
        message: `Listo, calificaste a ${targets.length} jugadores`,
        tone: "success",
      });
      onRated();
    } catch (error) {
      if (error instanceof ApiError && error.status === CONFLICT) {
        onOpenChange(false);
        setToast({ message: "Ya calificaste este partido", tone: "info" });
        onRated();
        return;
      }

      setToast({
        message: "No pudimos enviar tus calificaciones. Probá de nuevo.",
        tone: "danger",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          {target && (
            <>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-4">
                  <DialogTitle className="min-w-0">Calificá a tus compañeros</DialogTitle>

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
                  {stepIndex + 1} de {targets.length}
                </DialogDescription>
              </div>

              <div className="flex flex-col items-center gap-4">
                <UserAvatar
                  name={target.name}
                  photoUrl={target.photoUrl}
                  sizes="88px"
                  className="size-22"
                  initialsClassName="text-title"
                />
                <p className="text-subhead text-white">{target.name}</p>

                <PeekRating
                  value={answer.score}
                  onChange={(score) => updateAnswer({ score })}
                  labels={SCORE_LABELS}
                  ariaLabel={`Puntaje para ${target.name}`}
                  allowClear={false}
                />
              </div>

              <TextareaField
                id={`rating-comment-${target.id}`}
                label="Comentario"
                hint="opcional"
                rows={3}
                maxLength={COMMENT_MAX}
                value={answer.comment}
                onChange={(event) =>
                  updateAnswer({ comment: event.target.value })
                }
              />

              <div className="flex gap-3">
                <PillButton
                  variant="glass"
                  className="flex-1"
                  disabled={stepIndex === 0 || submitting}
                  onClick={() => setStepIndex((index) => index - 1)}
                >
                  Anterior
                </PillButton>

                <PillButton
                  className="flex-1"
                  disabled={answer.score === 0 || submitting}
                  onClick={() =>
                    isLastStep
                      ? void handleSubmit()
                      : setStepIndex((index) => index + 1)
                  }
                >
                  {isLastStep ? "Enviar" : "Siguiente"}
                </PillButton>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {toast && (
        <div className="fixed inset-x-0 top-16 z-50 flex justify-center px-4">
          <Toast message={toast.message} tone={toast.tone} />
        </div>
      )}
    </>
  );
}
