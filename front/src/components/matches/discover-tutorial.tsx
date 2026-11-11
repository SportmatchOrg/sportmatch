'use client';

import { ChevronsLeft, ChevronsRight, Pointer, type LucideIcon } from 'lucide-react';
import { useState } from 'react';

import { PillButton } from '@/components/ui/pill-button';
import { cn } from '@/lib/utils';

const OVERLAY =
  'fixed inset-0 z-[60] flex items-end justify-center bg-scrim px-4 pb-[max(24px,env(safe-area-inset-bottom))] lg:items-center lg:pb-0';

const CARD =
  'flex w-full max-w-sm flex-col items-center gap-5 rounded-lg bg-raised p-6 text-center text-white shadow-card-glass';

const STEP_ICON = 'flex size-16 items-center justify-center rounded-full';

const STEP_DOT = 'h-1.5 rounded-full transition-all duration-[var(--dur-base)]';

const TITLE_ID = 'discover-tutorial-title';

type TutorialStep = {
  icon: LucideIcon;
  iconClassName: string;
  title: string;
};

const STEPS: TutorialStep[] = [
  {
    icon: ChevronsRight,
    iconClassName: 'bg-success-tint text-success',
    title: 'Deslizá a la derecha para pedir sumarte',
  },
  {
    icon: ChevronsLeft,
    iconClassName: 'bg-danger-tint text-danger',
    title: 'A la izquierda para pasar',
  },
  {
    icon: Pointer,
    iconClassName: 'bg-brand-tint text-brand',
    title: 'Tocá la tarjeta para ver el detalle',
  },
];

type DiscoverTutorialProps = {
  onClose: () => void;
};

export function DiscoverTutorial({ onClose }: DiscoverTutorialProps) {
  const [stepIndex, setStepIndex] = useState(0);

  const step = STEPS[stepIndex];
  const Icon = step.icon;
  const lastStep = stepIndex === STEPS.length - 1;

  function next() {
    if (lastStep) {
      onClose();
      return;
    }

    setStepIndex((current) => current + 1);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={TITLE_ID}
      onKeyDown={(event) => event.key === 'Escape' && onClose()}
      className={OVERLAY}
    >
      <div className={CARD}>
        <span className={cn(STEP_ICON, step.iconClassName)} aria-hidden="true">
          <Icon className="size-8" />
        </span>

        <div className="flex flex-col gap-2">
          <span className="text-overline text-ink-46 uppercase">
            Paso {stepIndex + 1} de {STEPS.length}
          </span>
          <h2 id={TITLE_ID} className="text-headline font-bold">
            {step.title}
          </h2>
        </div>

        <div className="flex gap-2" aria-hidden="true">
          {STEPS.map(({ title }, index) => (
            <span
              key={title}
              className={cn(STEP_DOT, index === stepIndex ? 'w-6 bg-brand' : 'w-1.5 bg-ink-32')}
            />
          ))}
        </div>

        <div className="flex w-full gap-3">
          {!lastStep && (
            <PillButton variant="glass" size="md" onClick={onClose} className="flex-1">
              Saltar
            </PillButton>
          )}
          <PillButton size="md" autoFocus onClick={next} className="flex-1">
            {lastStep ? 'Empezar' : 'Siguiente'}
          </PillButton>
        </div>
      </div>
    </div>
  );
}
