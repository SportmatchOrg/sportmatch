'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

import { PillButton } from '@/components/ui/pill-button';

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
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <PillButton
        variant={variant === 'ghost' ? 'dangerGhost' : 'danger'}
        size="md"
        disabled={pending}
        onClick={() => setConfirming(true)}
        className="w-full"
      >
        {variant === 'ghost' && <X className="size-4" aria-hidden="true" />}
        {label}
      </PillButton>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p role="alert" className="text-caption text-ink-64">
        {message}
      </p>

      <div className="flex gap-3">
        <PillButton
          variant="glass"
          size="md"
          disabled={pending}
          onClick={() => setConfirming(false)}
          className="flex-1"
        >
          {cancelLabel}
        </PillButton>

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
    </div>
  );
}
