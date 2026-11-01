'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';

import { useAuth } from '@/context/auth-context';
import {
  fetchInvitations, invitationErrorMessage, invitePlayer, type Invitation,
} from '@/lib/invitations';
import { matchKeys } from '@/lib/query-keys';
import type { PublicUser } from '@/types/match';

const ERROR_MESSAGE = 'No pudimos cargar las invitaciones. Probá de nuevo.';
const SESSION_ERROR = 'Iniciá sesión para ver las invitaciones.';

const NO_INVITATIONS: Invitation[] = [];

export function useInvitations(matchId: string) {
  const queryClient = useQueryClient();
  const { user: firebaseUser, loading: sessionLoading } = useAuth();
  const [sendingId, setSendingId] = useState<string | null>(null);
  const sending = useRef(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const hasSession = !sessionLoading && !!firebaseUser;

  const { data, isPending, isLoadingError, refetch } = useQuery({
    queryKey: matchKeys.invitations(matchId),
    queryFn: ({ signal }) => fetchInvitations(matchId, signal),
    enabled: hasSession,
  });

  const loading = sessionLoading || (hasSession && isPending);
  const error = sessionLoading ? null : !firebaseUser ? SESSION_ERROR
    : isLoadingError ? ERROR_MESSAGE : null;

  const reload = useCallback(() => void refetch(), [refetch]);

  const invite = useCallback(async (user: PublicUser) => {
    if (!hasSession) {
      setSendError(SESSION_ERROR);
      return;
    }
    if (loading || error || sending.current) return;
    sending.current = true;
    setSendingId(user.id);
    setSendError(null);
    setSuccess(null);

    try {
      const invitation = await invitePlayer(matchId, user.id);
      queryClient.setQueryData<Invitation[]>(matchKeys.invitations(matchId), (current = []) => [
        ...current.filter((item) => item.userId !== user.id),
        { ...invitation, user },
      ]);
      setSuccess(`Invitación enviada a ${user.name}`);
    } catch (error: unknown) {
      setSendError(invitationErrorMessage(error));
      void queryClient.invalidateQueries({ queryKey: matchKeys.invitations(matchId) });
    } finally {
      sending.current = false;
      setSendingId(null);
    }
  }, [error, hasSession, loading, matchId, queryClient]);

  return {
    invitations: data ?? NO_INVITATIONS,
    loading,
    error,
    canInvite: hasSession && !loading && !error && sendingId === null,
    reload,
    invite,
    sendingId,
    sendError,
    success,
  };
}
