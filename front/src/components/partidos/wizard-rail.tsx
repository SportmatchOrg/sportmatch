import { Check } from 'lucide-react';

import { WizardProgress } from '@/components/partidos/wizard-progress';
import { WIZARD_STEPS } from '@/lib/partido-wizard';
import { cn } from '@/lib/utils';

const ITEM = 'flex items-center gap-4 rounded-md px-4 py-3 transition';

const ITEM_ACTIVE = 'bg-glass shadow-bevel-lit';

const MARK =
  'flex size-7 shrink-0 items-center justify-center rounded-full text-caption font-bold tabular-nums';

const MARK_DONE = 'bg-success text-midnight';

const MARK_ACTIVE = 'bg-brand text-brand-ink shadow-glow';

const MARK_PENDING = 'bg-glass text-ink-46 shadow-bevel';

type WizardRailProps = {
  mode: 'create' | 'edit';
  step: number;
};

export function WizardRail({ mode, step }: WizardRailProps) {
  const total = WIZARD_STEPS.length;
  const overline = mode === 'edit' ? 'Partido existente' : 'Nuevo partido';
  const title = mode === 'edit' ? 'Editar partido' : 'Crear partido';

  return (
    <aside className="hidden lg:flex lg:w-[320px] lg:shrink-0 lg:flex-col lg:justify-between lg:gap-8 lg:border-r lg:border-glass-strong lg:p-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-overline text-brand uppercase">{overline}</span>
          <p className="text-title font-bold text-white">{title}</p>
        </div>

        <ol className="flex flex-col gap-1">
          {WIZARD_STEPS.map((wizardStep, index) => {
            const active = index === step;
            const done = index < step;

            return (
              <li
                key={wizardStep.name}
                aria-current={active ? 'step' : undefined}
                className={cn(ITEM, active && ITEM_ACTIVE)}
              >
                <span
                  className={cn(
                    MARK,
                    done && MARK_DONE,
                    active && MARK_ACTIVE,
                    !done && !active && MARK_PENDING
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
          <WizardProgress step={step} total={total} />
        </span>

        <span className="text-caption tabular-nums text-ink-46">
          Paso {step + 1} de {total}
        </span>
      </div>
    </aside>
  );
}
