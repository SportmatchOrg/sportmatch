'use client';

import { ArrowRight, Check, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

import { PillButton } from '@/components/ui/pill-button';
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

type ConfirmationBlockProps = {
  message: string;
  cancelLabel: string;
  confirmLabel: string;
  pendingLabel: string;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

function ConfirmationBlock({
  message,
  cancelLabel,
  confirmLabel,
  pendingLabel,
  pending,
  onCancel,
  onConfirm,
}: ConfirmationBlockProps) {
  return (
    <div className="flex flex-col gap-3 rounded-md bg-glass p-3 shadow-bevel-lit">
      <p className="px-2 text-caption text-ink-64">{message}</p>

      <div className="flex gap-3">
        <PillButton
          variant="glass"
          size="lg"
          disabled={pending}
          onClick={onCancel}
          className="flex-1"
        >
          {cancelLabel}
        </PillButton>

        <PillButton
          variant="danger"
          size="lg"
          disabled={pending}
          onClick={onConfirm}
          className="flex-1"
        >
          {pending ? pendingLabel : confirmLabel}
        </PillButton>
      </div>
    </div>
  );
}

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
            Estás adentro
          </p>

          {!confirming ? (
            <PillButton
              variant="danger"
              size="lg"
              disabled={submitting}
              onClick={() => setConfirming(true)}
              className="w-full"
            >
              Cancelar mi lugar
            </PillButton>
          ) : (
            <ConfirmationBlock
              message="Se libera tu lugar para que lo tome otra persona."
              cancelLabel="Mejor no"
              confirmLabel="Salirme"
              pendingLabel="Saliendo…"
              pending={submitting}
              onCancel={() => setConfirming(false)}
              onConfirm={() => void run(() => leavePartido(partido.id), leaveErrorMessage)}
            />
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
            <PillButton
              variant="dangerGhost"
              size="md"
              disabled={submitting}
              onClick={() => setConfirming(true)}
              className="w-full"
            >
              Cancelar solicitud
            </PillButton>
          ) : (
            <ConfirmationBlock
              message="Podés volver a pedir sumarte más adelante."
              cancelLabel="Mejor no"
              confirmLabel="Cancelar"
              pendingLabel="Cancelando…"
              pending={submitting}
              onCancel={() => setConfirming(false)}
              onConfirm={() =>
                void run(() => cancelJoinRequest(partido.id), cancelRequestErrorMessage, {
                  onSuccess: () =>
                    setOptimisticRequestStatus({ from: 'PENDING', to: null }),
                  successMessage: 'Solicitud cancelada',
                })
              }
            />
          )}
        </>
      ) : (
        <>
          {requestStatus === 'REJECTED' && (
            <p className="text-center text-caption text-ink-46">
              El organizador rechazó tu solicitud. Podés volver a pedirlo.
            </p>
          )}

          <PillButton
            variant="brand"
            size="lg"
            disabled={lleno || submitting}
            onClick={() =>
              void run(() => requestToJoin(partido.id), joinRequestErrorMessage, {
                onSuccess: () =>
                  setOptimisticRequestStatus({ from: requestStatus, to: 'PENDING' }),
              })
            }
            className="w-full"
          >
            {submitting ? 'Enviando…' : 'Pedir sumarme'}
            {!submitting && <ArrowRight className="size-[18px]" aria-hidden="true" />}
          </PillButton>

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
