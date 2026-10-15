'use client';

import { Dialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

import { iconButtonClassName } from '@/components/ui/icon-button';
import { cn } from '@/lib/utils';

const SCRIM =
  'fixed inset-0 z-[60] bg-scrim transition-opacity duration-[var(--dur-slow)] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0';

const SHEET =
  'fixed inset-x-0 bottom-0 z-[60] mx-auto flex max-h-[88dvh] w-full max-w-md flex-col gap-5 overflow-y-auto rounded-t-2xl bg-glass-solid px-6 pt-3 pb-8 text-white shadow-sheet backdrop-blur-sheet outline-none transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out)] data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full';

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
};

export function BottomSheet({ open, onClose, title, children, className }: BottomSheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className={SCRIM} />
        <Dialog.Popup aria-modal="true" className={cn(SHEET, className)}>
          <span
            className="h-[5px] w-10 shrink-0 self-center rounded-full bg-ink-32"
            aria-hidden="true"
          />

          <div className="flex items-center justify-between gap-4">
            <Dialog.Title className="text-headline font-bold">{title}</Dialog.Title>
            <Dialog.Close aria-label="Cerrar" className={iconButtonClassName('soft', 'sm')}>
              <X className="size-5" aria-hidden="true" />
            </Dialog.Close>
          </div>

          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
