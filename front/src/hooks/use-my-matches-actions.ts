'use client';

import { useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';

import type { ToastTone } from '@/components/ui/toast';
import { useAuth } from '@/context/auth-context';
import { useInvalidateMatches } from '@/hooks/use-invalidate-matches';
import { ApiError } from '@/lib/api';
import {
  cancelJoinRequest,
  cancelMatch,
  cancelMatchErrorMessage,
  cancelRequestErrorMessage,
  leaveErrorMessage,
  leaveMatch,
} from '@/lib/matches';
import { matchKeys } from '@/lib/query-keys';
import type { CancelReason } from '@/types/match';

type PageToast = { message: string; tone: ToastTone };
type Action = { matchId: string; label: string } & (
  | { kind: 'leave' | 'cancelRequest' }
  | { kind: 'cancelHostedMatch'; reason: CancelReason }
);

export function useMyMatchesActions() {
  const { user, loading: sessionLoading } = useAuth();
  const queryClient = useQueryClient();
  const invalidateMatches = useInvalidateMatches();
  const locked = useRef(false);
  const [toast, setToast] = useState<PageToast | null>(null);
  const clearToast = useCallback(() => setToast(null), []);
  const activeMutations = useIsMutating({ mutationKey: matchKeys.all });
  const hasSession = !sessionLoading && !!user;
  const mutation = useMutation({
    mutationKey: matchKeys.myActions(),
    mutationFn: async (action: Action) => {
      if (action.kind === 'cancelHostedMatch') {
        await cancelMatch(action.matchId, action.reason);
      } else if (action.kind === 'cancelRequest') {
        await cancelJoinRequest(action.matchId);
      } else {
        await leaveMatch(action.matchId);
      }
    },
    onSuccess: (_data, action) => {
      const message = action.kind === 'cancelHostedMatch' ? 'Partido cancelado'
        : action.kind === 'cancelRequest' ? 'Cancelaste tu solicitud' : 'Te bajaste';
      setToast({ message: `${message} · ${action.label}`,
        tone: action.kind === 'cancelHostedMatch' ? 'danger' : 'info' });
    },
    onError: (error, action) => {
      if (action.kind === 'cancelHostedMatch') return;
      setToast({
        message: action.kind === 'leave' ? leaveErrorMessage(error) : cancelRequestErrorMessage(error),
        tone: 'danger',
      });
    },
    onSettled: async (_data, error) => {
      if (error && !(error instanceof ApiError && (error.status === 404 || error.status === 409))) {
        return;
      }
      try {
        await invalidateMatches({ throwOnError: true });
      } catch {
        if (!error) {
          setToast({ message: 'La acción se completó, pero no pudimos actualizar los datos. Recargá la página.',
            tone: 'info' });
        }
      }
    },
  });

  async function execute(action: Action) {
    if (!hasSession || locked.current || queryClient.isMutating({ mutationKey: matchKeys.all }) > 0) {
      if (action.kind === 'cancelHostedMatch') {
        throw new Error('Esperá a que termine la otra acción.');
      }
      return;
    }
    locked.current = true;
    try {
      await mutation.mutateAsync(action);
    } catch (error) {
      if (action.kind === 'cancelHostedMatch') throw new Error(cancelMatchErrorMessage(error));
    } finally {
      locked.current = false;
    }
  }

  return {
    pendingId: mutation.isPending ? mutation.variables?.matchId ?? null : null,
    busy: !hasSession || activeMutations > 0,
    toast,
    clearToast,
    leave: (matchId: string, label: string) => execute({ kind: 'leave', matchId, label }),
    cancelRequest: (matchId: string, label: string) => execute({ kind: 'cancelRequest', matchId, label }),
    cancelHostedMatch: (matchId: string, reason: CancelReason, label: string) =>
      execute({ kind: 'cancelHostedMatch', matchId, reason, label }),
  };
}
