'use client';

import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PillButton } from '@/components/ui/pill-button';
import { cn } from '@/lib/utils';

type ConfirmActionProps = {
  label: string;
  message: string;
  cancelLabel: string;
  confirmLabel: string;
  pendingLabel: string;
  pending: boolean;
  variant?: 'solid' | 'ghost';
  onConfirm: () => void;
};

export function ConfirmAction({
  label,
  message,
  cancelLabel,
  confirmLabel,
  pendingLabel,
  pending,
  variant = 'solid',
  onConfirm,
}: ConfirmActionProps) {
  const [open, setOpen] = useState(false);
  const wasPending = useRef(pending);

  useEffect(() => {
    if (wasPending.current && !pending) setOpen(false);
    wasPending.current = pending;
  }, [pending]);

  return (
    <Dialog open={open} onOpenChange={setOpen} disablePointerDismissal>
      <DialogTrigger
        render={
          <PillButton
            variant={variant === 'ghost' ? 'dangerGhost' : 'danger'}
            size="md"
            disabled={pending}
            className={cn('w-full', variant === 'ghost' && 'py-2')}
          />
        }
      >
        <X className="size-4" aria-hidden="true" />
        {label}
      </DialogTrigger>

      <DialogContent>
        <div className="flex flex-col gap-2">
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </div>

        <div className="flex gap-3">
          <DialogClose
            render={<PillButton variant="glass" size="md" disabled={pending} className="flex-1" />}
          >
            {cancelLabel}
          </DialogClose>
          <PillButton
            variant="danger"
            size="md"
            disabled={pending}
            onClick={onConfirm}
            className="flex-1"
          >
            {pending ? pendingLabel : confirmLabel}
          </PillButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
