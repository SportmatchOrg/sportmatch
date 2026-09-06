'use client';

import { ArrowRight, Check } from 'lucide-react';
import { useState } from 'react';

import { ApiError } from '@/lib/api';
import { joinPartido, leavePartido } from '@/lib/partidos';
import type { PartidoDetalle } from '@/types/partido';

const CONFLICT = 409;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;

const FULL_MESSAGE = 'El partido se llenó';
const ALREADY_JOINED_MESSAGE = 'Ya estás anotado';
const PLAYED_MESSAGE = 'Este partido ya se jugó';
const JOIN_FALLBACK = 'No pudimos sumarte al partido. Probá de nuevo.';
const LEAVE_FALLBACK = 'No pudimos darte de baja. Probá de nuevo.';
const NOT_JOINED_MESSAGE = 'Ya no estabas anotado en este partido';

const PRIMARY_CTA =
  'flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-4 text-callout font-bold text-midnight shadow-glow transition hover:bg-brand-bright disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none';

const GLASS_CTA =
  'flex-1 rounded-full bg-glass-strong px-6 py-4 text-callout font-semibold text-white shadow-bevel-lit transition hover:bg-glass disabled:cursor-not-allowed disabled:opacity-60';

const DANGER_CTA =
  'flex-1 rounded-full bg-danger px-6 py-4 text-callout font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60';

const DANGER_TEXT_CTA =
  'w-full rounded-full bg-danger px-6 py-4 text-callout font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60';

function joinErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return JOIN_FALLBACK;

  if (error.status === CONFLICT) {
    return error.message.includes('full') ? FULL_MESSAGE : ALREADY_JOINED_MESSAGE;
  }

  if (error.status === BAD_REQUEST) return PLAYED_MESSAGE;

  return JOIN_FALLBACK;
}

function leaveErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === NOT_FOUND) {
    return NOT_JOINED_MESSAGE;
  }

  return LEAVE_FALLBACK;
}

type PartidoActionsProps = {
  partido: PartidoDetalle;
  isOrganizer: boolean;
  onDone: () => void;
};

export function PartidoActions({ partido, isOrganizer, onDone }: PartidoActionsProps) {
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lleno = partido.anotados >= partido.cupo;

  async function run(action: () => Promise<void>, toMessage: (error: unknown) => string) {
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      await action();
      onDone();
    } catch (caught) {
      setError(toMessage(caught));
    } finally {
      setSubmitting(false);
      setConfirming(false);
    }
  }

  if (isOrganizer) {
    return (
      <p className="rounded-full bg-glass px-6 py-4 text-center text-callout font-semibold text-ink-80 shadow-bevel-lit">
        Organizás este partido
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p role="alert" className="text-center text-caption text-danger">
          {error}
        </p>
      )}

      {!partido.estoy_anotado && (
        <>
          <button
            type="button"
            disabled={lleno || submitting}
            onClick={() => void run(() => joinPartido(partido.id), joinErrorMessage)}
            className={PRIMARY_CTA}
          >
            {submitting ? 'Sumándote…' : 'Unirme al partido'}
            {!submitting && <ArrowRight className="size-[18px]" aria-hidden="true" />}
          </button>

          {lleno && (
            <p className="text-center text-caption text-ink-46">
              No quedan lugares en este partido
            </p>
          )}
        </>
      )}

      {partido.estoy_anotado && (
        <p className="flex items-center gap-3 rounded-full bg-glass px-4 py-3 text-callout font-bold text-white shadow-bevel-lit">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success text-midnight">
            <Check className="size-4" aria-hidden="true" />
          </span>
          Estás dentro
        </p>
      )}

      {partido.estoy_anotado && !confirming && (
        <button
          type="button"
          disabled={submitting}
          onClick={() => setConfirming(true)}
          className={DANGER_TEXT_CTA}
        >
          Cancelar mi lugar
        </button>
      )}

      {partido.estoy_anotado && confirming && (
        <div className="flex flex-col gap-3 rounded-md bg-glass p-3 shadow-bevel-lit">
          <p className="px-2 text-caption text-ink-64">
            Se libera tu lugar para que lo tome otra persona.
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setConfirming(false)}
              className={GLASS_CTA}
            >
              Mejor no
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => void run(() => leavePartido(partido.id), leaveErrorMessage)}
              className={DANGER_CTA}
            >
              {submitting ? 'Saliendo…' : 'Salirme'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
