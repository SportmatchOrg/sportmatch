'use client';

import { Check, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { UserAvatar } from '@/components/user-avatar';
import { IconButton } from '@/components/ui/icon-button';
import { Skeleton } from '@/components/ui/skeleton';
import { TOAST_DURATION, Toast } from '@/components/ui/toast';
import { useJoinRequests } from '@/hooks/use-join-requests';
import { ApiError } from '@/lib/api';
import { resolveJoinRequest, type JoinRequest } from '@/lib/join-requests';
import { cn } from '@/lib/utils';

const CONFLICT = 409;
const FULL_MESSAGE = 'No se pudo aceptar: el partido está lleno';
const RESOLVE_FALLBACK = 'No pudimos resolver la solicitud. Probá de nuevo.';

type JoinRequestsPanelProps = {
  partidoId: string;
  capacity: number;
  joinedCount: number;
  isOrganizer: boolean;
  onResolved: () => void;
};

function PanelSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-label="Cargando solicitudes">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-11 w-full rounded-full" />
      <Skeleton className="h-11 w-full rounded-full" />
    </div>
  );
}

function RequestRow({
  request,
  resolving,
  onResolve,
}: {
  request: JoinRequest;
  resolving: boolean;
  onResolve: (request: JoinRequest, status: 'ACCEPTED' | 'REJECTED') => void;
}) {
  return (
    <li className="flex items-center gap-3">
      <Link
        href={`/usuarios/${request.user.id}`}
        aria-label={`Ver perfil de ${request.user.name}`}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-sm focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
      >
        <UserAvatar
          name={request.user.name}
          photoUrl={request.user.photoUrl}
          sizes="44px"
          className="size-11"
          initialsClassName="text-caption"
        />

        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-[15px] font-semibold text-white">
            {request.user.name}
          </span>
          <span className="text-caption text-ink-46">quiere sumarse</span>
        </span>
      </Link>

      <span className="flex shrink-0 gap-2">
        <IconButton
          label={`Rechazar a ${request.user.name}`}
          variant="strong"
          disabled={resolving}
          onClick={() => onResolve(request, 'REJECTED')}
          className="size-10"
        >
          <X className="size-[18px]" aria-hidden="true" />
        </IconButton>
        <IconButton
          label={`Aceptar a ${request.user.name}`}
          variant="brand"
          disabled={resolving}
          onClick={() => onResolve(request, 'ACCEPTED')}
          className="size-10"
        >
          <Check className="size-[18px]" aria-hidden="true" />
        </IconButton>
      </span>
    </li>
  );
}

export function JoinRequestsPanel({
  partidoId,
  capacity,
  joinedCount,
  isOrganizer,
  onResolved,
}: JoinRequestsPanelProps) {
  const { joinRequests, loading, error, reload } = useJoinRequests(partidoId, isOrganizer);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const pendingRequests = joinRequests.filter((request) => request.status === 'PENDING');
  const pendingCount = pendingRequests.length;

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!isOrganizer) return null;

  async function handleResolve(
    request: JoinRequest,
    status: 'ACCEPTED' | 'REJECTED'
  ): Promise<void> {
    if (resolvingId) return;

    setResolvingId(request.id);

    try {
      await resolveJoinRequest(partidoId, request.id, status);
      reload();
      onResolved();
    } catch (caught) {
      setToast(
        status === 'ACCEPTED' && caught instanceof ApiError && caught.status === CONFLICT
          ? FULL_MESSAGE
          : RESOLVE_FALLBACK
      );
      reload();
    } finally {
      setResolvingId(null);
    }
  }

  return (
    <section className="flex flex-col gap-4">
      {toast && (
        <div className="fixed inset-x-0 top-16 z-50 flex justify-center px-4">
          <Toast message={toast} tone="danger" />
        </div>
      )}

      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-overline text-ink-46 uppercase">Solicitudes</h2>
          <span
            className={cn(
              'rounded-full px-3 py-1 text-caption font-semibold',
              pendingCount > 0
                ? 'bg-brand text-brand-ink'
                : 'bg-success-tint text-success'
            )}
          >
            {pendingCount > 0
              ? `${pendingCount} ${pendingCount === 1 ? 'pendiente' : 'pendientes'}`
              : 'Todo listo'}
          </span>
        </div>
        <p className="text-caption text-ink-46">
          {joinedCount}/{capacity} jugadores confirmados
        </p>
      </header>

      {loading ? (
        <PanelSkeleton />
      ) : error ? (
        <p role="alert" className="text-caption text-danger">
          {error}
        </p>
      ) : (
        pendingRequests.length === 0 ? (
          <p className="text-caption text-ink-46">No hay solicitudes pendientes</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {pendingRequests.map((request) => (
              <RequestRow
                key={request.id}
                request={request}
                resolving={resolvingId !== null}
                onResolve={handleResolve}
              />
            ))}
          </ul>
        )
      )}
    </section>
  );
}
