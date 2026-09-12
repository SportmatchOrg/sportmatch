'use client';

import { ArrowRight, Check, ChevronLeft, X } from 'lucide-react';
import type { ReactNode } from 'react';

import { WizardProgress } from '@/components/partidos/wizard-progress';
import { WizardRail } from '@/components/partidos/wizard-rail';
import { IconButton } from '@/components/ui/icon-button';
import { PillButton } from '@/components/ui/pill-button';
import { LAST_STEP, WIZARD_STEPS } from '@/lib/partido-wizard';

type WizardShellProps = {
  mode: 'create' | 'edit';
  step: number;
  submitting: boolean;
  onBack: () => void;
  onExit: () => void;
  onContinue: () => void;
  children: ReactNode;
};

export function WizardShell({
  mode,
  step,
  submitting,
  onBack,
  onExit,
  onContinue,
  children,
}: WizardShellProps) {
  const { name, question: defaultQuestion } = WIZARD_STEPS[step];
  const total = WIZARD_STEPS.length;
  const isLast = step === LAST_STEP;
  const isFirst = step === 0;
  const exitLabel = mode === 'edit' ? 'Salir de editar partido' : 'Salir de crear partido';
  const submitLabel = mode === 'edit' ? 'Guardar cambios' : 'Publicar partido';
  const pendingLabel = mode === 'edit' ? 'Guardando…' : 'Publicando…';
  const question =
    isLast && mode === 'edit' ? '¿Listo para guardar los cambios?' : defaultQuestion;

  return (
    <div className="fixed inset-0 z-[60] bg-base lg:static lg:z-auto lg:flex lg:h-[calc(100dvh-5rem)] lg:items-center lg:justify-center lg:px-8 lg:py-6">
      <div className="flex h-full flex-col lg:h-[calc(100dvh-8rem)] lg:max-h-[820px] lg:w-full lg:max-w-[1240px] lg:flex-row lg:overflow-hidden lg:rounded-lg lg:bg-panel lg:shadow-bevel">
        <WizardRail mode={mode} step={step} />

        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
          <header className="flex shrink-0 flex-col gap-6 px-5 pt-6 lg:px-10 lg:pt-8">
            <div className="flex items-center gap-4 lg:hidden">
              <IconButton
                label={isFirst ? exitLabel : 'Volver al paso anterior'}
                onClick={isFirst ? onExit : onBack}
              >
                {isFirst ? (
                  <X className="size-5" aria-hidden="true" />
                ) : (
                  <ChevronLeft className="size-6" aria-hidden="true" />
                )}
              </IconButton>

              <WizardProgress step={step} total={total} />

              <span className="text-caption tabular-nums text-ink-46">
                {step + 1}/{total}
              </span>
            </div>

            <div className="flex items-start justify-between gap-6">
              <div className="flex flex-col gap-3">
                <span className="text-overline text-brand uppercase">
                  Paso {step + 1} · {name}
                </span>

                <h1 className="text-display text-[36px] text-white lg:text-[34px]">{question}</h1>
              </div>

              <IconButton
                label={exitLabel}
                onClick={onExit}
                className="hidden lg:flex"
              >
                <X className="size-5" aria-hidden="true" />
              </IconButton>
            </div>
          </header>

          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto px-5 pt-10 pb-40 lg:px-10 lg:pb-8">
            {children}
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-base from-55% to-transparent px-5 pt-10 pb-8 lg:static lg:flex lg:items-center lg:justify-between lg:gap-4 lg:border-t lg:border-glass-strong lg:bg-none lg:px-10 lg:py-6">
            {isFirst ? (
              <span className="hidden lg:block" />
            ) : (
              <PillButton
                variant="glass"
                size="md"
                disabled={submitting}
                onClick={onBack}
                className="pointer-events-auto hidden lg:flex"
              >
                <ChevronLeft className="size-[18px]" aria-hidden="true" />
                Atrás
              </PillButton>
            )}

            <PillButton
              disabled={submitting}
              onClick={onContinue}
              className="pointer-events-auto w-full lg:w-auto lg:px-8"
            >
              {isLast && submitting && pendingLabel}
              {isLast && !submitting && submitLabel}
              {!isLast && 'Continuar'}

              {isLast ? (
                <Check className="size-[18px]" aria-hidden="true" />
              ) : (
                <ArrowRight className="size-[18px]" aria-hidden="true" />
              )}
            </PillButton>
          </div>
        </div>
      </div>
    </div>
  );
}
