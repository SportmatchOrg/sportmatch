'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/context/auth-context';
import {
  fetchInvitations, invitationErrorMessage, invitePlayer, type Invitation,
} from '@/lib/invitations';
import type { PublicUser } from '@/types/match';

const ERROR_MESSAGE = 'No pudimos cargar las invitaciones. Probá de nuevo.';
const SESSION_ERROR = 'Iniciá sesión para ver las invitaciones.';

type InvitationsState = {
  requestKey: string | null;
  invitations: Invitation[];
  error: string | null;
};

const INITIAL_STATE: InvitationsState = { requestKey: null, invitations: [], error: null };

export function useInvitations(matchId: string) {
  const { user: firebaseUser, loading: sessionLoading } = useAuth();
  const [state, setState] = useState<InvitationsState>(INITIAL_STATE);
  const [reloadToken, setReloadToken] = useState(0);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const sending = useRef(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const requestKey = JSON.stringify([firebaseUser?.uid, matchId, reloadToken]);
  const hasSession = !sessionLoading && !!firebaseUser;
  const hasCurrentData = hasSession && state.requestKey === requestKey;
  const loading = sessionLoading || (hasSession && !hasCurrentData);
  const error = sessionLoading ? null : !firebaseUser ? SESSION_ERROR
    : hasCurrentData ? state.error : null;

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    if (sessionLoading || !firebaseUser) return;

    const controller = new AbortController();
    fetchInvitations(matchId, controller.signal)
      .then((invitations) => {
        if (!controller.signal.aborted) {
          setState({ requestKey, invitations, error: null });
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setState({ requestKey, invitations: [], error: ERROR_MESSAGE });
        }
      });

    return () => controller.abort();
  }, [firebaseUser, matchId, requestKey, sessionLoading]);

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
      setState((current) => ({
        ...current,
        invitations: [
          ...current.invitations.filter((item) => item.userId !== user.id),
          { ...invitation, user },
        ],
      }));
      setSuccess(`Invitación enviada a ${user.name}`);
    } catch (error: unknown) {
      setSendError(invitationErrorMessage(error));
      reload();
    } finally {
      sending.current = false;
      setSendingId(null);
    }
  }, [error, hasSession, loading, matchId, reload]);

  return {
    invitations: hasCurrentData ? state.invitations : [],
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
