'use client';

import { ArrowRight, Check, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ConfirmAction } from '@/components/ui/confirm-action';
import { PillButton } from '@/components/ui/pill-button';
import { TOAST_DURATION, Toast } from '@/components/ui/toast';
import { useMatchParticipation } from '@/hooks/use-match-participation';
import { useRespondInvitation } from '@/hooks/use-respond-invitation';
import { hasPendingInvitation } from '@/lib/invitations';
import { suspensionMessage } from '@/lib/suspension';
import type { Match } from '@/types/match';

type MatchActionsProps = {
  match: Match;
  isOrganizer: boolean;
  suspendedUntil: string | null;
  requestReady: boolean;
  disabled?: boolean;
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

export function MatchActions({
  match,
  isOrganizer,
  suspendedUntil,
  requestReady,
  disabled = false,
}: MatchActionsProps) {
  const participation = useMatchParticipation(match);
  const invitation = useRespondInvitation(match.id);
  const suspension = suspensionMessage(suspendedUntil);
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const lleno = match.joinedCount >= match.capacity;
  const busy = disabled || participation.pending || invitation.pending;
  const responseError = participation.error ?? invitation.error;
  const requestStatus = participation.requestStatus;

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), TOAST_DURATION);

    return () => clearTimeout(timer);
  }, [toast]);

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

      {responseError && (
        <p role="alert" className="text-center text-caption text-danger">
          {responseError}
        </p>
      )}

      {match.isJoined ? (
        <>
          <p className="flex items-center gap-3 rounded-full bg-glass px-4 py-3 text-callout font-bold text-white shadow-bevel-lit">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success text-midnight">
              <Check className="size-4" aria-hidden="true" />
            </span>
            Estás dentro
          </p>

          {!confirming ? (
            <PillButton
              variant="danger"
              size="lg"
              disabled={busy || !participation.canParticipate}
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
              pending={busy}
              onCancel={() => setConfirming(false)}
              onConfirm={() => {
                invitation.reset();
                void participation.leave().then(() => setConfirming(false));
              }}
            />
          )}
        </>
      ) : hasPendingInvitation(match) ? (
        <>
          <p className="flex items-center gap-3 rounded-full bg-glass px-4 py-3 text-callout font-bold text-white shadow-bevel-lit">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-warning-tint text-warning">
              <Clock className="size-4" aria-hidden="true" />
            </span>
            Te invitaron
          </p>

          <div className="flex flex-wrap gap-3">
            <PillButton
              variant="brand"
              size="lg"
              disabled={busy || !invitation.canRespond || !requestReady || !!suspension
                || lleno || match.status === 'CANCELED'}
              onClick={() => {
                participation.reset();
                void invitation.respond('ACCEPTED');
              }}
              className="flex-1"
            >
              {invitation.pending ? 'Respondiendo…' : 'Aceptar'}
            </PillButton>

            <ConfirmAction
              label="Rechazar invitación"
              message="No te sumarás a este partido. Podés pedir sumarte más adelante."
              cancelLabel="Mejor no"
              confirmLabel="Rechazar"
              pendingLabel="Rechazando…"
              pending={invitation.pending}
              disabled={busy}
              trigger={
                <PillButton
                  variant="glass"
                  size="lg"
                  disabled={busy || !invitation.canRespond || match.status === 'CANCELED'}
                  className="flex-1"
                >
                  Rechazar
                </PillButton>
              }
              onConfirm={() => {
                participation.reset();
                void invitation.respond('REJECTED');
              }}
            />
          </div>

          {lleno && !responseError && (
            <p className="text-center text-caption text-danger">El partido ya está lleno</p>
          )}
          {match.status === 'CANCELED' && !responseError && (
            <p className="text-center text-caption text-danger">El partido está cancelado</p>
          )}
          {suspension && <p className="text-center text-caption text-danger">{suspension}</p>}
          {!requestReady && (
            <p className="text-center text-caption text-ink-46">
              No pudimos comprobar tu perfil. Volvé a cargar la página.
            </p>
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
              disabled={busy || !participation.canParticipate}
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
              pending={busy}
              onCancel={() => setConfirming(false)}
              onConfirm={() => {
                invitation.reset();
                void participation.cancelRequest().then((success) => {
                  if (success) setToast('Solicitud cancelada');
                  setConfirming(false);
                });
              }}
            />
          )}
        </>
      ) : (
        <>
          {requestStatus === 'REJECTED' && match.myJoinRequestOrigin === 'REQUEST' && (
            <p className="text-center text-caption text-ink-46">
              El organizador rechazó tu solicitud. Podés volver a pedirlo.
            </p>
          )}

          <PillButton
            variant="brand"
            size="lg"
            disabled={lleno || busy || !participation.canParticipate || !requestReady
              || !!suspension || match.status === 'CANCELED'}
            onClick={() => {
              invitation.reset();
              void participation.requestJoin();
            }}
            className="w-full"
          >
            {participation.pending ? 'Enviando…' : 'Pedir sumarme'}
            {!participation.pending && <ArrowRight className="size-[18px]" aria-hidden="true" />}
          </PillButton>

          {suspension && <p className="text-center text-caption text-danger">{suspension}</p>}
          {!requestReady && (
            <p className="text-center text-caption text-ink-46">
              No pudimos comprobar tu perfil. Volvé a cargar la página.
            </p>
          )}

          {lleno && (
            <p className="text-center text-caption text-ink-46">
              No quedan lugares en este partido
            </p>
          )}
          {match.status === 'CANCELED' && (
            <p className="text-center text-caption text-ink-46">El partido está cancelado</p>
          )}
        </>
      )}
    </div>
  );
}
