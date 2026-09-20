'use client';

import { MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { CupoStepper } from '@/components/partidos/cupo-stepper';
import { DeportePicker } from '@/components/partidos/deporte-picker';
import { HorarioPicker } from '@/components/partidos/horario-picker';
import { NivelPicker } from '@/components/partidos/nivel-picker';
import { PartidoSummary } from '@/components/partidos/partido-summary';
import { TextField } from '@/components/partidos/text-field';
import { TextareaField } from '@/components/partidos/textarea-field';
import { WizardShell } from '@/components/partidos/wizard-shell';
import { TOAST_DURATION, Toast, type ToastTone } from '@/components/ui/toast';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useSports } from '@/hooks/use-sports';
import { LAST_STEP, firstStepWithError, stepErrors } from '@/lib/match-wizard';
import {
  validateMatchForm,
  type MatchForm,
  type MatchFormErrors,
} from '@/lib/match-form';
import {
  DESCRIPTION_MAX,
  TITLE_MAX,
  LOCATION_MAX,
  type Sport,
  type Level,
} from '@/types/match';

type WizardToast = { message: string; tone: ToastTone };

type PartidoWizardProps = {
  mode: 'create' | 'edit';
  initialForm: MatchForm;
  submit: (form: MatchForm) => Promise<unknown>;
  toastMessage: (form: MatchForm, sport?: Sport) => string;
  errorMessage: (error: unknown) => string;
  doneHref: string;
};

export function PartidoWizard({
  mode,
  initialForm,
  submit,
  toastMessage,
  errorMessage,
  doneHref,
}: PartidoWizardProps) {
  const router = useRouter();
  const { sports, loading: deportesLoading, error: deportesError } = useSports();
  const { user } = useCurrentUser();
  const [form, setForm] = useState<MatchForm>(initialForm);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<MatchFormErrors>({});
  const [toast, setToast] = useState<WizardToast | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  const sport = sports.find((candidate) => candidate.id === form.sportId);

  function setField<K extends keyof MatchForm>(key: K, value: MatchForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function save() {
    const found = validateMatchForm(form);

    if (Object.keys(found).length > 0) {
      setErrors(found);
      setStep(firstStepWithError(found));
      return;
    }

    setSubmitting(true);

    try {
      await submit(form);
      setToast({ message: toastMessage(form, sport), tone: 'success' });
      redirectTimer.current = setTimeout(() => router.replace(doneHref), TOAST_DURATION);
    } catch (caught) {
      setToast({ message: errorMessage(caught), tone: 'danger' });
      setSubmitting(false);
    }
  }

  function handleContinue() {
    if (submitting) return;

    const found = stepErrors(validateMatchForm(form), step);
    setErrors(found);

    if (Object.keys(found).length > 0) return;

    if (step === LAST_STEP) {
      void save();
      return;
    }

    setStep(step + 1);
  }

  function handleBack() {
    if (submitting) return;

    setErrors({});
    setStep(step - 1);
  }

  function handleExit() {
    if (!submitting) router.back();
  }

  return (
    <>
      <WizardShell
        mode={mode}
        step={step}
        submitting={submitting}
        onBack={handleBack}
        onExit={handleExit}
        onContinue={handleContinue}
      >
        {step === 0 && (
          <DeportePicker
            sports={sports}
            loading={deportesLoading}
            loadError={deportesError}
            value={form.sportId}
            onChange={(sportId) => setField('sportId', sportId)}
            error={errors.sportId}
          />
        )}

        {step === 1 && (
          <div className="relative">
            <MapPin
              className="pointer-events-none absolute top-3.5 left-4 size-[18px] text-ink-46"
              aria-hidden="true"
            />

            <TextField
              id="ubicacion"
              label="Lugar"
              hideLabel
              placeholder="Buscá una cancha o dirección"
              maxLength={LOCATION_MAX}
              value={form.location}
              onChange={(event) => setField('location', event.target.value)}
              error={errors.location}
              className="pl-11"
            />
          </div>
        )}

        {step === 2 && (
          <HorarioPicker
            value={form.date}
            onChange={(date) => setField('date', date)}
            error={errors.date}
          />
        )}

        {step === 3 && (
          <div className="flex flex-col gap-6">
            <CupoStepper
              value={form.capacity}
              onChange={(capacity) => setField('capacity', capacity)}
              error={errors.capacity}
            />

            <NivelPicker
              value={form.level}
              onChange={(level: Level) => setField('level', level)}
              error={errors.level}
            />

            <TextField
              id="titulo"
              label="Título"
              maxLength={TITLE_MAX}
              placeholder="Ej. Picado de los jueves"
              value={form.title}
              onChange={(event) => setField('title', event.target.value)}
              error={errors.title}
            />

            <TextareaField
              id="descripcion"
              label="Descripción"
              hint="opcional"
              maxLength={DESCRIPTION_MAX}
              placeholder="Contá cómo se juega, qué llevar, si se arman equipos…"
              value={form.description}
              onChange={(event) => setField('description', event.target.value)}
              error={errors.description}
            />
          </div>
        )}

        {step === LAST_STEP && <PartidoSummary form={form} sport={sport} organizer={user} />}
      </WizardShell>

      {toast && (
        <div className="fixed inset-x-0 top-16 z-[70] flex justify-center px-4">
          <Toast message={toast.message} tone={toast.tone} />
        </div>
      )}
    </>
  );
}
