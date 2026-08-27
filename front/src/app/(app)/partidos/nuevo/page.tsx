'use client';

import { useState, type FormEvent } from 'react';

import { DeportePicker } from '@/components/partidos/deporte-picker';
import { NivelPicker } from '@/components/partidos/nivel-picker';
import { PartidoCreated } from '@/components/partidos/partido-created';
import { TextField } from '@/components/partidos/text-field';
import { TextareaField } from '@/components/partidos/textarea-field';
import { useDeportes } from '@/hooks/use-deportes';
import { ApiError, apiFetch } from '@/lib/api';
import {
  EMPTY_PARTIDO_FORM,
  clampCupoInput,
  localDateTimeValue,
  toCreatePartidoBody,
  validatePartidoForm,
  type PartidoForm,
  type PartidoFormErrors,
} from '@/lib/partido-form';
import {
  CUPO_MAX,
  CUPO_MIN,
  DESCRIPCION_MAX,
  UBICACION_MAX,
  type Nivel,
  type Partido,
} from '@/types/partido';

const GENERIC_ERROR = 'No pudimos crear el partido. Probá de nuevo.';

export default function NewPartidoPage() {
  const { deportes, loading: deportesLoading, error: deportesError } = useDeportes();

  const [form, setForm] = useState<PartidoForm>(EMPTY_PARTIDO_FORM);
  const [errors, setErrors] = useState<PartidoFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<Partido | null>(null);
  const [minFecha] = useState(() => localDateTimeValue());

  function setField<K extends keyof PartidoForm>(key: K, value: PartidoForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const found = validatePartidoForm(form);
    setErrors(found);
    setSubmitError(null);

    if (Object.keys(found).length > 0) return;

    setSubmitting(true);

    try {
      const partido = await apiFetch<Partido>('/partidos', {
        method: 'POST',
        body: JSON.stringify(toCreatePartidoBody(form)),
      });
      setCreated(partido);
    } catch (caught) {
      setSubmitError(caught instanceof ApiError ? caught.message : GENERIC_ERROR);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCreateAnother() {
    setForm(EMPTY_PARTIDO_FORM);
    setErrors({});
    setSubmitError(null);
    setCreated(null);
  }

  if (created) {
    return (
      <main className="mx-auto w-full max-w-md px-5 py-8">
        <PartidoCreated partido={created} deportes={deportes} onCreateAnother={handleCreateAnother} />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-md px-5 py-8">
      <h1 className="text-title">Crear partido</h1>

      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-6">
        <DeportePicker
          deportes={deportes}
          loading={deportesLoading}
          loadError={deportesError}
          value={form.deporteId}
          onChange={(deporteId) => setField('deporteId', deporteId)}
          error={errors.deporteId}
        />

        <NivelPicker
          value={form.nivel}
          onChange={(nivel: Nivel) => setField('nivel', nivel)}
          error={errors.nivel}
        />

        <TextField
          id="fecha"
          label="Fecha y hora"
          type="datetime-local"
          min={minFecha}
          value={form.fecha}
          onChange={(event) => setField('fecha', event.target.value)}
          error={errors.fecha}
        />

        <TextField
          id="ubicacion"
          label="Ubicación"
          placeholder="Parque Sur · Cancha 2"
          maxLength={UBICACION_MAX}
          value={form.ubicacion}
          onChange={(event) => setField('ubicacion', event.target.value)}
          error={errors.ubicacion}
        />

        <TextField
          id="cupo"
          label="Cupo"
          type="text"
          inputMode="numeric"
          maxLength={2}
          placeholder={`Entre ${CUPO_MIN} y ${CUPO_MAX}`}
          value={form.cupo}
          onChange={(event) => setField('cupo', clampCupoInput(event.target.value, form.cupo))}
          error={errors.cupo}
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

        {submitError && (
          <p
            role="alert"
            className="rounded-xl bg-danger/10 px-4 py-3 text-body text-danger shadow-field-error"
          >
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-accent px-6 py-4 text-callout text-midnight shadow-glow transition hover:bg-accent-bright disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
        >
          {submitting ? 'Creando…' : 'Crear partido'}
        </button>
      </form>
    </main>
  );
}
