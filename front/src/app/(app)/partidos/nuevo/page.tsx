'use client';

import { MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { CupoStepper } from '@/components/partidos/cupo-stepper';
import { DeportePicker } from '@/components/partidos/deporte-picker';
import { HorarioPicker } from '@/components/partidos/horario-picker';
import { NivelPicker } from '@/components/partidos/nivel-picker';
import { PartidoSummary } from '@/components/partidos/partido-summary';
import { TextField } from '@/components/partidos/text-field';
import { TextareaField } from '@/components/partidos/textarea-field';
import { WizardShell } from '@/components/partidos/wizard-shell';
import { Toast, type ToastTone } from '@/components/ui/toast';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useDeportes } from '@/hooks/use-deportes';
import { ApiError } from '@/lib/api';
import { formatMatchDay, formatMatchTime } from '@/lib/match-date';
import {
  EMPTY_PARTIDO_FORM,
  validatePartidoForm,
  type PartidoForm,
  type PartidoFormErrors,
} from '@/lib/partido-form';
import { LAST_STEP, firstStepWithError, stepErrors } from '@/lib/partido-wizard';
import { createPartido } from '@/lib/partidos';
import {
  DEPORTE_LABEL,
  DESCRIPCION_MAX,
  TITULO_MAX,
  UBICACION_MAX,
  type Nivel,
} from '@/types/partido';

const GENERIC_ERROR = 'No pudimos crear el partido. Probá de nuevo.';

const TOAST_DURATION = 2800;

const AFTER_PUBLISH_ROUTE = '/buscar';

type WizardToast = { message: string; tone: ToastTone };

export default function NewPartidoPage() {
  const router = useRouter();
  const { deportes, loading: deportesLoading, error: deportesError } = useDeportes();
  const { user } = useCurrentUser();

  const [form, setForm] = useState<PartidoForm>(EMPTY_PARTIDO_FORM);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<PartidoFormErrors>({});
  const [toast, setToast] = useState<WizardToast | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), TOAST_DURATION);

    return () => clearTimeout(timer);
  }, [toast]);

  const deporte = deportes.find((candidate) => candidate.id === form.deporteId);

  function setField<K extends keyof PartidoForm>(key: K, value: PartidoForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function publishedMessage(): string {
    const label = deporte ? DEPORTE_LABEL[deporte.nombre] : '';

    return `Partido publicado · ${label} · ${formatMatchDay(form.fecha)} · ${formatMatchTime(form.fecha)}`;
  }

  async function publish() {
    const found = validatePartidoForm(form);

    if (Object.keys(found).length > 0) {
      setErrors(found);
      setStep(firstStepWithError(found));
      return;
    }

    setSubmitting(true);

    try {
      await createPartido(form);

      setToast({ message: publishedMessage(), tone: 'success' });
      setTimeout(() => router.replace(AFTER_PUBLISH_ROUTE), TOAST_DURATION);
    } catch (caught) {
      setToast({
        message: caught instanceof ApiError ? caught.message : GENERIC_ERROR,
        tone: 'danger',
      });
      setSubmitting(false);
    }
  }

  function handleContinue() {
    if (submitting) return;

    const found = stepErrors(validatePartidoForm(form), step);
    setErrors(found);

    if (Object.keys(found).length > 0) return;

    if (step === LAST_STEP) {
      void publish();
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
    if (submitting) return;

    router.back();
  }

  return (
    <>
      <WizardShell
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

        {step === LAST_STEP && (
          <PartidoSummary form={form} deporte={deporte} organizador={user} />
        )}
      </WizardShell>

      {toast && (
        <div className="fixed inset-x-0 top-16 z-[70] flex justify-center px-4">
          <Toast message={toast.message} tone={toast.tone} />
        </div>
      )}
    </>
  );
}
