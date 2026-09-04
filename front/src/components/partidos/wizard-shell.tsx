'use client';

import { ArrowRight, Check, ChevronLeft, X } from 'lucide-react';
import type { ReactNode } from 'react';

import { LAST_STEP, WIZARD_STEPS } from '@/lib/partido-wizard';
import { cn } from '@/lib/utils';

const ICON_BUTTON =
  'flex size-11 shrink-0 items-center justify-center rounded-full bg-glass-solid text-white shadow-bevel backdrop-blur-chip transition hover:bg-glass-strong';

const CTA =
  'pointer-events-auto flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-4 text-callout font-bold text-brand-ink shadow-glow transition hover:bg-brand-bright disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none lg:w-auto lg:px-8';

const BACK_CTA =
  'pointer-events-auto hidden items-center gap-2 rounded-full bg-glass px-6 py-3 text-callout font-semibold text-white shadow-bevel-lit transition hover:bg-glass-strong lg:flex';

const TRACK_TRANSITION = 'width var(--dur-base) var(--ease-out)';

const RAIL_ITEM = 'flex items-center gap-4 rounded-md px-4 py-3 transition';

const RAIL_ITEM_ACTIVE = 'bg-glass shadow-bevel-lit';

const RAIL_MARK =
  'flex size-7 shrink-0 items-center justify-center rounded-full text-caption font-bold tabular-nums';

const RAIL_MARK_DONE = 'bg-success text-midnight';

const RAIL_MARK_ACTIVE = 'bg-brand text-brand-ink shadow-glow';

const RAIL_MARK_PENDING = 'bg-glass text-ink-46 shadow-bevel';

function ProgressTrack({ step, total }: { step: number; total: number }) {
  return (
    <span
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={step + 1}
      className="h-[5px] flex-1 overflow-hidden rounded-full bg-glass-strong"
    >
      <span
        style={{ width: `${((step + 1) / total) * 100}%`, transition: TRACK_TRANSITION }}
        className="block h-full rounded-full bg-brand"
      />
    </span>
  );
}

type WizardShellProps = {
  step: number;
  submitting: boolean;
  onBack: () => void;
  onExit: () => void;
  onContinue: () => void;
  children: ReactNode;
};

export function WizardShell({
  step,
  submitting,
  onBack,
  onExit,
  onContinue,
  children,
}: WizardShellProps) {
  const { name, question } = WIZARD_STEPS[step];
  const total = WIZARD_STEPS.length;
  const isLast = step === LAST_STEP;
  const isFirst = step === 0;

  return (
    <div className="fixed inset-0 z-[60] bg-base lg:static lg:z-auto lg:flex lg:h-[calc(100dvh-5rem)] lg:items-center lg:justify-center lg:px-8 lg:py-6">
      <div className="flex h-full flex-col lg:h-[calc(100dvh-8rem)] lg:max-h-[820px] lg:w-full lg:max-w-[1240px] lg:flex-row lg:overflow-hidden lg:rounded-lg lg:bg-panel lg:shadow-bevel">
        <aside className="hidden lg:flex lg:w-[320px] lg:shrink-0 lg:flex-col lg:justify-between lg:gap-8 lg:border-r lg:border-glass-strong lg:p-8">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <span className="text-overline text-brand uppercase">Nuevo partido</span>
              <p className="text-title font-bold text-white">Crear partido</p>
            </div>

            <ol className="flex flex-col gap-1">
              {WIZARD_STEPS.map((wizardStep, index) => {
                const active = index === step;
                const done = index < step;

                return (
                  <li
                    key={wizardStep.name}
                    aria-current={active ? 'step' : undefined}
                    className={cn(RAIL_ITEM, active && RAIL_ITEM_ACTIVE)}
                  >
                    <span
                      className={cn(
                        RAIL_MARK,
                        done && RAIL_MARK_DONE,
                        active && RAIL_MARK_ACTIVE,
                        !done && !active && RAIL_MARK_PENDING
                      )}
                    >
                      {done ? <Check className="size-4" aria-hidden="true" /> : index + 1}
                    </span>

                    <span
                      className={cn(
                        'text-callout',
                        active && 'font-bold text-white',
                        done && 'text-ink-64',
                        !done && !active && 'text-ink-46'
                      )}
                    >
                      {wizardStep.name}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="flex flex-col gap-3">
            <span className="flex">
              <ProgressTrack step={step} total={total} />
            </span>

            <span className="text-caption tabular-nums text-ink-46">
              Paso {step + 1} de {total}
            </span>
          </div>
        </aside>

        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
          <header className="flex shrink-0 flex-col gap-6 px-5 pt-6 lg:px-10 lg:pt-8">
            <div className="flex items-center gap-4 lg:hidden">
              <button
                type="button"
                aria-label={isFirst ? 'Salir de crear partido' : 'Volver al paso anterior'}
                onClick={isFirst ? onExit : onBack}
                className={ICON_BUTTON}
              >
                {isFirst ? (
                  <X className="size-5" aria-hidden="true" />
                ) : (
                  <ChevronLeft className="size-6" aria-hidden="true" />
                )}
              </button>

              <ProgressTrack step={step} total={total} />

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

              <button
                type="button"
                aria-label="Salir de crear partido"
                onClick={onExit}
                className={cn(ICON_BUTTON, 'hidden lg:flex')}
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
          </header>

          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto px-5 pt-8 pb-40 lg:px-10 lg:pb-8">
            {children}
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-base from-55% to-transparent px-5 pt-10 pb-8 lg:static lg:flex lg:items-center lg:justify-between lg:gap-4 lg:border-t lg:border-glass-strong lg:bg-none lg:px-10 lg:py-6">
            {isFirst ? (
              <span className="hidden lg:block" />
            ) : (
              <button type="button" disabled={submitting} onClick={onBack} className={BACK_CTA}>
                <ChevronLeft className="size-[18px]" aria-hidden="true" />
                Atrás
              </button>
            )}

            <button type="button" disabled={submitting} onClick={onContinue} className={CTA}>
              {isLast && submitting && 'Publicando…'}
              {isLast && !submitting && 'Publicar partido'}
              {!isLast && 'Continuar'}

              {isLast ? (
                <Check className="size-[18px]" aria-hidden="true" />
              ) : (
                <ArrowRight className="size-[18px]" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
