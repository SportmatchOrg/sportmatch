"use client";

import { Star } from "lucide-react";
import { useEffect, useState } from "react";

import { TextareaField } from "@/components/partidos/textarea-field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { PillButton } from "@/components/ui/pill-button";
import { TOAST_DURATION, Toast, type ToastTone } from "@/components/ui/toast";
import { UserAvatar } from "@/components/user-avatar";
import { ApiError } from "@/lib/api";
import { submitRatings, type RatingInput } from "@/lib/ratings";
import { cn } from "@/lib/utils";
import type { PublicUser } from "@/types/partido";

const SCORES = [1, 2, 3, 4, 5];
const COMMENT_MAX = 280;
const CONFLICT = 409;
const EMPTY_ANSWER: Answer = { score: 0, comment: "" };

type Answer = { score: number; comment: string };

type ToastState = { message: string; tone: ToastTone };

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (score: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {SCORES.map((score) => (
        <button
          key={score}
          type="button"
          onClick={() => onChange(score)}
          aria-label={score === 1 ? "1 estrella" : `${score} estrellas`}
          aria-pressed={score === value}
          className="rounded-full p-1 outline-none transition focus-visible:ring-3 focus-visible:ring-brand/50"
        >
          <Star
            className={cn(
              "size-8 transition",
              score <= value ? "fill-warning text-warning" : "text-ink-16",
            )}
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  );
}

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
                <DialogTitle>Calificá a tus compañeros</DialogTitle>
                <DialogDescription>
                  {stepIndex + 1} de {targets.length}
                </DialogDescription>
              </div>

              <div className="flex flex-col items-center gap-4">
                <UserAvatar
                  name={target.nombre}
                  photoUrl={target.fotoUrl}
                  sizes="88px"
                  className="size-22"
                  initialsClassName="text-title"
                />
                <p className="text-subhead text-white">{target.nombre}</p>

                <StarPicker
                  value={answer.score}
                  onChange={(score) => updateAnswer({ score })}
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
