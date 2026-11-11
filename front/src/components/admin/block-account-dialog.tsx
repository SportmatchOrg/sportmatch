'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { FieldError } from '@/components/matches/field-error';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { PillButton } from '@/components/ui/pill-button';
import { SegmentedControl, type SegmentOption } from '@/components/ui/segmented-control';
import {
  BLOCK_DURATIONS,
  BLOCK_DURATION_LABEL,
  blockEndDate,
  formatBlockEnd,
  type BlockDuration,
} from '@/lib/account-block';
import { blockAccount, blockAccountErrorMessage } from '@/lib/admin-reports';
import { adminReportKeys } from '@/lib/query-keys';
import type { AdminReport } from '@/types/report';

const DURATION_OPTIONS: SegmentOption<BlockDuration>[] = BLOCK_DURATIONS.map((value) => ({
  value,
  label: BLOCK_DURATION_LABEL[value],
}));

const ERROR_ID = 'block-account-error';

type BlockAccountDialogProps = {
  report: AdminReport;
  onClose: () => void;
  onBlocked: () => void;
};

function StepHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-2">
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>
    </div>
  );
}

function blockEndLabel(until: Date | null): string {
  return until ? `Bloqueada ${formatBlockEnd(until)}` : 'Bloqueada sin fecha de fin';
}

function blockConsequence(until: Date | null): string {
  return until
    ? `No va a poder usar SportMatch ${formatBlockEnd(until)}.`
    : 'No va a poder volver a usar SportMatch.';
}

export function BlockAccountDialog({ report, onClose, onBlocked }: BlockAccountDialogProps) {
  const queryClient = useQueryClient();
  const [duration, setDuration] = useState<BlockDuration>('DAYS_7');
  const [confirming, setConfirming] = useState(false);
  const { mutate, isPending, error } = useMutation({ mutationFn: blockAccount });
  const { reportedUser } = report;
  const until = blockEndDate(duration);

  function handleOpenChange(open: boolean) {
    if (!open && !isPending) onClose();
  }

  function block() {
    mutate(
      { userId: reportedUser.id, duration, reportId: report.id },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: adminReportKeys.all });
          onBlocked();
        },
      }
    );
  }

  return (
    <Dialog open onOpenChange={handleOpenChange} disablePointerDismissal>
      <DialogContent>
        {confirming ? (
          <>
            <StepHeader
              title={`¿Bloquear a ${reportedUser.name}?`}
              description={`${blockConsequence(until)} El reporte queda como revisado.`}
            />

            <FieldError id={ERROR_ID} message={error ? blockAccountErrorMessage(error) : undefined} />

            <div className="flex gap-3">
              <PillButton
                variant="glass"
                size="md"
                disabled={isPending}
                onClick={() => setConfirming(false)}
                className="flex-1"
              >
                Volver
              </PillButton>

              <PillButton
                variant="danger"
                size="md"
                disabled={isPending}
                aria-describedby={error ? ERROR_ID : undefined}
                onClick={block}
                className="flex-1"
              >
                {isPending ? 'Bloqueando…' : 'Bloquear'}
              </PillButton>
            </div>
          </>
        ) : (
          <>
            <StepHeader
              title="Bloquear cuenta"
              description={`Elegí por cuánto tiempo bloquear a ${reportedUser.name}.`}
            />

            <div className="flex flex-col gap-2">
              <SegmentedControl
                label="Duración del bloqueo"
                options={DURATION_OPTIONS}
                value={duration}
                onChange={setDuration}
                className="lg:w-auto lg:self-start"
              />
              <p className="text-caption text-ink-46">{blockEndLabel(until)}</p>
            </div>

            <div className="flex gap-3">
              <DialogClose render={<PillButton variant="glass" size="md" className="flex-1" />}>
                Cancelar
              </DialogClose>

              <PillButton
                variant="danger"
                size="md"
                onClick={() => setConfirming(true)}
                className="flex-1"
              >
                Continuar
              </PillButton>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
