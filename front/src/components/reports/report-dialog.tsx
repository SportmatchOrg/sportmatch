'use client';

import { useEffect, useState, type ReactElement } from 'react';
import { createPortal } from 'react-dom';

import { FieldError } from '@/components/matches/field-error';
import { TextareaField } from '@/components/matches/textarea-field';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PillButton } from '@/components/ui/pill-button';
import { TOAST_DURATION, Toast } from '@/components/ui/toast';
import { createReport, reportErrorMessage } from '@/lib/reports';
import {
  REPORT_COMMENT_MAX,
  REPORT_REASONS,
  REPORT_REASON_LABEL,
  type ReportReason,
} from '@/types/report';

const REASON =
  'flex cursor-pointer items-center gap-3 rounded-sm bg-glass px-4 py-3 text-callout text-white shadow-bevel transition hover:bg-glass-strong has-[:checked]:shadow-[inset_0_0_0_1px_var(--color-brand)] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand';

const REASON_LABEL_ID = 'report-reason-label';

const ERROR_ID = 'report-error';

const TOAST_POSITION = 'fixed inset-x-0 top-16 z-50 flex justify-center px-4';

const SENT = 'Gracias, vamos a revisarlo';

type ReportDialogProps = {
  reportedUser: { id: string; name: string };
  matchId?: string;
  trigger: ReactElement;
};

export function ReportDialog({ reportedUser, matchId, trigger }: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!sent) return;

    const timer = setTimeout(() => setSent(false), TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [sent]);

  function handleOpenChange(next: boolean) {
    if (sending) return;

    setOpen(next);

    if (!next) {
      setReason(null);
      setComment('');
      setError(null);
    }
  }

  async function send() {
    if (!reason || sending) return;

    setSending(true);
    setError(null);

    try {
      await createReport({
        reportedUserId: reportedUser.id,
        reason,
        comment: comment.trim() || undefined,
        matchId,
      });
      setSending(false);
      handleOpenChange(false);
      setSent(true);
    } catch (caught) {
      setError(reportErrorMessage(caught));
      setSending(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger render={trigger} />

        <DialogContent>
          <div className="flex flex-col gap-2">
            <DialogTitle>Reportar a {reportedUser.name}</DialogTitle>
            <DialogDescription>
              Lo revisa el equipo de SportMatch. No le avisamos a quién reportás.
            </DialogDescription>
          </div>

          <div className="flex flex-col gap-2">
            <span id={REASON_LABEL_ID} className="text-overline text-ink-46 uppercase">
              Motivo
            </span>

            <div role="radiogroup" aria-labelledby={REASON_LABEL_ID} className="flex flex-col gap-2">
              {REPORT_REASONS.map((option) => (
                <label key={option} className={REASON}>
                  <input
                    type="radio"
                    name="report-reason"
                    value={option}
                    checked={reason === option}
                    disabled={sending}
                    onChange={() => {
                      setReason(option);
                      setError(null);
                    }}
                    className="size-4 accent-brand"
                  />
                  {REPORT_REASON_LABEL[option]}
                </label>
              ))}
            </div>
          </div>

          <TextareaField
            id="report-comment"
            label="Comentario"
            hint={`Opcional · ${comment.length}/${REPORT_COMMENT_MAX}`}
            rows={3}
            maxLength={REPORT_COMMENT_MAX}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Contanos qué pasó"
            disabled={sending}
          />

          <FieldError id={ERROR_ID} message={error ?? undefined} />

          <div className="flex gap-3">
            <DialogClose
              render={<PillButton variant="glass" size="md" disabled={sending} className="flex-1" />}
            >
              Cancelar
            </DialogClose>

            <PillButton
              variant="danger"
              size="md"
              disabled={!reason || sending}
              aria-describedby={error ? ERROR_ID : undefined}
              onClick={() => void send()}
              className="flex-1"
            >
              {sending ? 'Enviando…' : 'Enviar reporte'}
            </PillButton>
          </div>
        </DialogContent>
      </Dialog>

      {sent &&
        createPortal(
          <div className={TOAST_POSITION}>
            <Toast message={SENT} tone="success" />
          </div>,
          document.body
        )}
    </>
  );
}
