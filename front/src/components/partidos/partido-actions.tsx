'use client';

import { ArrowRight, Check, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

import { TOAST_DURATION, Toast } from '@/components/ui/toast';
import { ApiError } from '@/lib/api';
import { cancelJoinRequest, leavePartido, requestToJoin } from '@/lib/partidos';
import type { JoinRequestStatus, PartidoDetalle } from '@/types/partido';

const CONFLICT = 409;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;

const FULL_MESSAGE = 'El partido se llenó';
const ALREADY_REQUESTED_MESSAGE = 'Ya pediste sumarte';
const PLAYED_MESSAGE = 'Este partido ya se jugó';
const JOIN_REQUEST_FALLBACK = 'No pudimos enviar tu solicitud. Probá de nuevo.';
const LEAVE_FALLBACK = 'No pudimos darte de baja. Probá de nuevo.';
const NOT_JOINED_MESSAGE = 'Ya no estabas anotado en este partido';
const CANCEL_REQUEST_FALLBACK = 'No pudimos cancelar tu solicitud. Probá de nuevo.';
const REQUEST_NOT_FOUND_MESSAGE = 'Ya no tenías una solicitud pendiente';

const PRIMARY_CTA =
  'flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-4 text-callout font-bold text-midnight shadow-glow transition hover:bg-brand-bright disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none';

const GLASS_CTA =
  'flex-1 rounded-full bg-glass-strong px-6 py-4 text-callout font-semibold text-white shadow-bevel-lit transition hover:bg-glass disabled:cursor-not-allowed disabled:opacity-60';

const DANGER_CTA =
  'flex-1 rounded-full bg-danger px-6 py-4 text-callout font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60';

const DANGER_TEXT_CTA =
  'w-full rounded-full bg-danger px-6 py-4 text-callout font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60';

export function joinRequestErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return JOIN_REQUEST_FALLBACK;

  if (error.status === CONFLICT) {
    return error.message.toLowerCase().includes('full')
      ? FULL_MESSAGE
      : ALREADY_REQUESTED_MESSAGE;
  }

  if (error.status === BAD_REQUEST) return PLAYED_MESSAGE;

  return JOIN_REQUEST_FALLBACK;
}

function leaveErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === NOT_FOUND) {
    return NOT_JOINED_MESSAGE;
  }

  return LEAVE_FALLBACK;
}

function cancelRequestErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === NOT_FOUND) {
    return REQUEST_NOT_FOUND_MESSAGE;
  }

  return CANCEL_REQUEST_FALLBACK;
}

type PartidoActionsProps = {
  partido: PartidoDetalle;
  isOrganizer: boolean;
  onDone: () => void;
};

type RunOptions = {
  onSuccess?: () => void;
  successMessage?: string;
};

type OptimisticRequestStatus = {
  from: JoinRequestStatus | null;
  to: JoinRequestStatus | null;
};

export function PartidoActions({ partido, isOrganizer, onDone }: PartidoActionsProps) {
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [optimisticRequestStatus, setOptimisticRequestStatus] =
    useState<OptimisticRequestStatus | null>(null);

  const lleno = partido.anotados >= partido.cupo;
  const requestStatus =
    optimisticRequestStatus?.from === partido.my_join_request
      ? optimisticRequestStatus.to
      : partido.my_join_request;

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), TOAST_DURATION);

    return () => clearTimeout(timer);
  }, [toast]);

  async function run(
    action: () => Promise<void>,
    toMessage: (error: unknown) => string,
    options: RunOptions = {}
  ) {
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      await action();
      options.onSuccess?.();
      if (options.successMessage) setToast(options.successMessage);
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
      {toast && (
        <div className="fixed inset-x-0 top-16 z-50 flex justify-center px-4">
          <Toast message={toast} tone="success" />
        </div>
      )}

      {error && (
        <p role="alert" className="text-center text-caption text-danger">
          {error}
        </p>
      )}

      {partido.estoy_anotado ? (
        <>
          <p className="flex items-center gap-3 rounded-full bg-glass px-4 py-3 text-callout font-bold text-white shadow-bevel-lit">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success text-midnight">
              <Check className="size-4" aria-hidden="true" />
            </span>
            Estás dentro
          </p>

          {!confirming ? (
            <button
              type="button"
              disabled={submitting}
              onClick={() => setConfirming(true)}
              className={DANGER_TEXT_CTA}
            >
              Cancelar mi lugar
            </button>
          ) : (
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
        </>
      ) : requestStatus === 'PENDING' ? (
        <>
          <p className="flex items-center gap-3 rounded-full bg-glass px-4 py-3 text-callout font-bold text-white shadow-bevel-lit">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-warning-tint text-warning">
              <Clock className="size-4" aria-hidden="true" />
            </span>
            Esperando al organizador
          </p>

          {!confirming ? (
            <button
              type="button"
              disabled={submitting}
              onClick={() => setConfirming(true)}
              className="w-full px-6 py-2 text-callout font-semibold text-danger transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar solicitud
            </button>
          ) : (
            <div className="flex flex-col gap-3 rounded-md bg-glass p-3 shadow-bevel-lit">
              <p className="px-2 text-caption text-ink-64">
                Podés volver a pedir sumarte más adelante.
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
                  onClick={() =>
                    void run(
                      () => cancelJoinRequest(partido.id),
                      cancelRequestErrorMessage,
                      {
                        onSuccess: () =>
                          setOptimisticRequestStatus({ from: 'PENDING', to: null }),
                        successMessage: 'Solicitud cancelada',
                      }
                    )
                  }
                  className={DANGER_CTA}
                >
                  {submitting ? 'Cancelando…' : 'Cancelar'}
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {requestStatus === 'REJECTED' && (
            <p className="text-center text-caption text-ink-46">
              El organizador rechazó tu solicitud. Podés volver a pedirlo.
            </p>
          )}

          <button
            type="button"
            disabled={lleno || submitting}
            onClick={() =>
              void run(() => requestToJoin(partido.id), joinRequestErrorMessage, {
                onSuccess: () =>
                  setOptimisticRequestStatus({ from: requestStatus, to: 'PENDING' }),
              })
            }
            className={PRIMARY_CTA}
          >
            {submitting ? 'Enviando…' : 'Pedir sumarme'}
            {!submitting && <ArrowRight className="size-[18px]" aria-hidden="true" />}
          </button>

          {lleno && (
            <p className="text-center text-caption text-ink-46">
              No quedan lugares en este partido
            </p>
          )}
        </>
      )}
    </div>
  );
}
