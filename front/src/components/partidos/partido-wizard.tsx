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
import { useDeportes } from '@/hooks/use-deportes';
import { LAST_STEP, firstStepWithError, stepErrors } from '@/lib/partido-wizard';
import {
  validatePartidoForm,
  type PartidoForm,
  type PartidoFormErrors,
} from '@/lib/partido-form';
import {
  DESCRIPCION_MAX,
  TITULO_MAX,
  UBICACION_MAX,
  type Deporte,
  type Nivel,
} from '@/types/partido';

type WizardToast = { message: string; tone: ToastTone };

type PartidoWizardProps = {
  mode: 'create' | 'edit';
  initialForm: PartidoForm;
  submit: (form: PartidoForm) => Promise<unknown>;
  toastMessage: (form: PartidoForm, deporte?: Deporte) => string;
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
  const { deportes, loading: deportesLoading, error: deportesError } = useDeportes();
  const { user } = useCurrentUser();
  const [form, setForm] = useState<PartidoForm>(initialForm);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<PartidoFormErrors>({});
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

  const deporte = deportes.find((candidate) => candidate.id === form.deporteId);

  function setField<K extends keyof PartidoForm>(key: K, value: PartidoForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function save() {
    const found = validatePartidoForm(form);

    if (Object.keys(found).length > 0) {
      setErrors(found);
      setStep(firstStepWithError(found));
      return;
    }

    setSubmitting(true);

    try {
      await submit(form);
      setToast({ message: toastMessage(form, deporte), tone: 'success' });
      redirectTimer.current = setTimeout(() => router.replace(doneHref), TOAST_DURATION);
    } catch (caught) {
      setToast({ message: errorMessage(caught), tone: 'danger' });
      setSubmitting(false);
    }
  }

  function handleContinue() {
    if (submitting) return;

    const found = stepErrors(validatePartidoForm(form), step);
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
            deportes={deportes}
            loading={deportesLoading}
            loadError={deportesError}
            value={form.deporteId}
            onChange={(deporteId) => setField('deporteId', deporteId)}
            error={errors.deporteId}
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
              maxLength={UBICACION_MAX}
              value={form.ubicacion}
              onChange={(event) => setField('ubicacion', event.target.value)}
              error={errors.ubicacion}
              className="pl-11"
            />
          </div>
        )}

        {step === 2 && (
          <HorarioPicker
            value={form.fecha}
            onChange={(fecha) => setField('fecha', fecha)}
            error={errors.fecha}
          />
        )}

        {step === 3 && (
          <div className="flex flex-col gap-6">
            <CupoStepper
              value={form.cupo}
              onChange={(cupo) => setField('cupo', cupo)}
              error={errors.cupo}
            />

            <NivelPicker
              value={form.nivel}
              onChange={(nivel: Nivel) => setField('nivel', nivel)}
              error={errors.nivel}
            />

            <TextField
              id="titulo"
              label="Título"
              maxLength={TITULO_MAX}
              placeholder="Ej. Picado de los jueves"
              value={form.titulo}
              onChange={(event) => setField('titulo', event.target.value)}
              error={errors.titulo}
            />

            <TextareaField
              id="descripcion"
              label="Descripción"
              hint="opcional"
              maxLength={DESCRIPCION_MAX}
              placeholder="Contá cómo se juega, qué llevar, si se arman equipos…"
              value={form.descripcion}
              onChange={(event) => setField('descripcion', event.target.value)}
              error={errors.descripcion}
            />
          </div>
        )}

        {step === LAST_STEP && <PartidoSummary form={form} deporte={deporte} organizador={user} />}
      </WizardShell>

      {toast && (
        <div className="fixed inset-x-0 top-16 z-[70] flex justify-center px-4">
          <Toast message={toast.message} tone={toast.tone} />
        </div>
      )}
    </>
  );
}
