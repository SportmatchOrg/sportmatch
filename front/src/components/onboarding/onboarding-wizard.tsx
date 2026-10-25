'use client';

import { ArrowRight, Check, ChevronLeft, MapPin } from 'lucide-react';
import { useState } from 'react';

import { AuthField } from '@/components/auth/auth-field';
import { LevelPicker } from '@/components/matches/level-picker';
import { WizardProgress } from '@/components/matches/wizard-progress';
import { EditField } from '@/components/profile/edit-field';
import { SportsPicker } from '@/components/profile/sports-picker';
import { IconButton } from '@/components/ui/icon-button';
import { PillButton } from '@/components/ui/pill-button';
import { completeOnboarding } from '@/lib/users';
import type { Level } from '@/types/match';
import { CITY_MAX, CITY_MIN } from '@/types/user';

const SCREEN = 'fixed inset-0 z-[60] overflow-y-auto bg-base text-white';

const CONTENT =
  'mx-auto flex min-h-full w-full max-w-md flex-col gap-8 px-5 pt-6 pb-8 lg:justify-center lg:py-10';

const SAVE_ERROR = 'No pudimos guardar tus datos. Probá de nuevo.';

const STEPS = ['¿Qué deportes jugás?', '¿Cuál es tu nivel?', '¿Dónde jugás?'];

const LAST_STEP = STEPS.length - 1;

type OnboardingWizardProps = {
  userId: string;
  onFinish: () => void;
};

export function OnboardingWizard({ userId, onFinish }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [sportIds, setSportIds] = useState<string[]>([]);
  const [level, setLevel] = useState<Level | ''>('');
  const [city, setCity] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedCity = city.trim();
  const isLast = step === LAST_STEP;
  const canContinue = [sportIds.length > 0, level !== '', trimmedCity.length >= CITY_MIN][step];

  async function save() {
    if (level === '') return;

    setSaving(true);
    setError(null);

    try {
      await completeOnboarding(userId, { sportIds, level, city: trimmedCity });
      onFinish();
    } catch {
      setError(SAVE_ERROR);
      setSaving(false);
    }
  }

  function next() {
    if (!canContinue || saving) return;

    if (isLast) {
      void save();
    } else {
      setStep(step + 1);
    }
  }

  return (
    <div className={SCREEN}>
      <main className={CONTENT}>
        <header className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            {step > 0 && (
              <IconButton
                label="Volver al paso anterior"
                disabled={saving}
                onClick={() => setStep(step - 1)}
              >
                <ChevronLeft className="size-6" aria-hidden="true" />
              </IconButton>
            )}

            <WizardProgress step={step} total={STEPS.length} />

            <span className="text-caption tabular-nums text-ink-46">
              {step + 1}/{STEPS.length}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-overline text-brand uppercase">Bienvenido a SportMatch</span>
            <h1 className="text-display text-[36px]">{STEPS[step]}</h1>
          </div>
        </header>

        <section className="flex-1 lg:flex-none">
          {step === 0 && (
            <SportsPicker value={sportIds} onChange={setSportIds} disabled={saving} />
          )}

          {step === 1 && <LevelPicker value={level} onChange={setLevel} />}

          {step === 2 && (
            <EditField id="city" label="Ciudad">
              <AuthField
                id="city"
                icon={<MapPin className="size-5" aria-hidden="true" />}
                type="text"
                placeholder="¿Dónde jugás?"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                autoComplete="address-level2"
                maxLength={CITY_MAX}
                disabled={saving}
              />
            </EditField>
          )}
        </section>

        {error && (
          <p role="alert" className="text-center text-caption text-danger">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <PillButton disabled={!canContinue || saving} onClick={next} className="w-full">
            {isLast ? (saving ? 'Guardando…' : 'Empezar') : 'Continuar'}
            {isLast ? (
              <Check className="size-[18px]" aria-hidden="true" />
            ) : (
              <ArrowRight className="size-[18px]" aria-hidden="true" />
            )}
          </PillButton>

          <PillButton variant="glass" disabled={saving} onClick={onFinish} className="w-full">
            Más tarde
          </PillButton>
        </div>
      </main>
    </div>
  );
}
