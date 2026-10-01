'use client';

import { ChevronDown, X } from 'lucide-react';
import { useState } from 'react';

import { FieldError } from '@/components/matches/field-error';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PillButton } from '@/components/ui/pill-button';
import { CANCEL_REASONS, type CancelReason } from '@/types/match';

const TRIGGER =
  'flex w-full items-center justify-between gap-3 rounded-md bg-glass px-4 py-3 text-callout text-white shadow-bevel transition hover:bg-glass-strong';

const PLACEHOLDER = 'Elegí una razón';

type CancelMatchDialogProps = {
  pending: boolean;
  onConfirm: (reason: CancelReason) => Promise<void>;
};

export function CancelMatchDialog({ pending, onConfirm }: CancelMatchDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<CancelReason | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    setOpen(next);

    if (!next) {
      setReason(null);
      setError(null);
    }
  }

  async function handleConfirm() {
    if (!reason) return;

    setError(null);

    try {
      await onConfirm(reason);
      handleOpenChange(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No pudimos cancelar el partido.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} disablePointerDismissal>
      <DialogTrigger
        render={
          <PillButton variant="dangerGhost" size="md" disabled={pending} className="w-full py-2" />
        }
      >
        <X className="size-4" aria-hidden="true" />
        Cancelar partido
      </DialogTrigger>

      <DialogContent>
        <div className="flex flex-col gap-2">
          <DialogTitle>Cancelar partido</DialogTitle>
          <DialogDescription>
            Se cancela para todos los jugadores y no se puede deshacer.
          </DialogDescription>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-caption text-ink-64">Razón</span>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={TRIGGER}
              disabled={pending}
              aria-label={reason ? `Razón: ${reason}` : PLACEHOLDER}
            >
              <span className={reason ? 'truncate' : 'truncate text-ink-46'}>
                {reason ?? PLACEHOLDER}
              </span>
              <ChevronDown className="size-4 shrink-0 text-ink-64" aria-hidden="true" />
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuRadioGroup
                value={reason ?? ''}
                onValueChange={(value) => {
                  setReason(value as CancelReason);
                  setError(null);
                }}
              >
                {CANCEL_REASONS.map((option) => (
                  <DropdownMenuRadioItem key={option} value={option}>
                    {option}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <FieldError id="cancel-match-error" message={error ?? undefined} />
        </div>

        <div className="flex gap-3">
          <DialogClose
            render={<PillButton variant="glass" size="md" disabled={pending} className="flex-1" />}
          >
            Volver
          </DialogClose>

          <PillButton
            variant="danger"
            size="md"
            disabled={pending || !reason}
            onClick={() => void handleConfirm()}
            className="flex-1"
          >
            {pending ? 'Cancelando…' : 'Sí, cancelar'}
          </PillButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
