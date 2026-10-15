'use client';

import { useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { useInvalidateMatches } from '@/hooks/use-invalidate-matches';
import { ApiError } from '@/lib/api';
import {
  invitationResponseErrorMessage,
  respondInvitation,
  type InvitationResponse,
} from '@/lib/invitations';
import { matchKeys } from '@/lib/query-keys';

export function useRespondInvitation(matchId: string) {
  const { user, loading: sessionLoading } = useAuth();
  const queryClient = useQueryClient();
  const invalidateMatches = useInvalidateMatches();
  const mutationKey = matchKeys.invitationResponse(matchId);
  const pending = useIsMutating({ mutationKey }) > 0;
  const hasSession = !sessionLoading && !!user;
  const mutation = useMutation({
    mutationKey,
    mutationFn: (status: InvitationResponse) => respondInvitation(matchId, status),
    onSettled: (_data, error) => {
      if (!error || (error instanceof ApiError && (error.status === 404 || error.status === 409))) {
        return invalidateMatches();
      }
    },
  });

  function respond(status: InvitationResponse) {
    if (!hasSession || queryClient.isMutating({ mutationKey }) > 0) return;

    mutation.mutate(status);
  }

  return {
    respond,
    pending,
    canRespond: hasSession && !pending,
    error: mutation.error ? invitationResponseErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  };
}
