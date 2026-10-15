'use client';

import { useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { useAuth } from '@/context/auth-context';
import { useInvalidateMatches } from '@/hooks/use-invalidate-matches';
import { ApiError } from '@/lib/api';
import {
  cancelJoinRequest,
  cancelRequestErrorMessage,
  joinRequestErrorMessage,
  leaveErrorMessage,
  leaveMatch,
  requestToJoin,
} from '@/lib/matches';
import { matchKeys } from '@/lib/query-keys';
import type { JoinRequestStatus, Match } from '@/types/match';

const ACTIONS = { request: requestToJoin, cancel: cancelJoinRequest, leave: leaveMatch };
const ERROR_MESSAGES = {
  request: joinRequestErrorMessage,
  cancel: cancelRequestErrorMessage,
  leave: leaveErrorMessage,
};
type ParticipationAction = keyof typeof ACTIONS;
type OptimisticRequestStatus = { match: Match; status: JoinRequestStatus | null };

export function useMatchParticipation(match: Match) {
  const { user, loading: sessionLoading } = useAuth();
  const queryClient = useQueryClient();
  const invalidateMatches = useInvalidateMatches();
  const mutationKey = matchKeys.participation(match.id);
  const pending = useIsMutating({ mutationKey }) > 0;
  const hasSession = !sessionLoading && !!user;
  const [optimisticRequest, setOptimisticRequest] = useState<OptimisticRequestStatus | null>(null);
  const mutation = useMutation({
    mutationKey,
    mutationFn: (action: ParticipationAction) => ACTIONS[action](match.id),
    onSuccess: (_data, action) => {
      if (action !== 'leave') {
        setOptimisticRequest({ match, status: action === 'request' ? 'PENDING' : null });
      }
    },
    onSettled: (_data, error) => {
      if (!error || (error instanceof ApiError && (error.status === 404 || error.status === 409))) {
        return invalidateMatches();
      }
    },
  });

  async function execute(action: ParticipationAction): Promise<boolean> {
    if (!hasSession || (action === 'request' && match.status === 'CANCELED')
      || queryClient.isMutating({ mutationKey }) > 0
      || queryClient.isMutating({ mutationKey: matchKeys.invitationResponse(match.id) }) > 0) {
      return false;
    }

    try {
      await mutation.mutateAsync(action);
      return true;
    } catch {
      return false;
    }
  }

  return {
    requestJoin: () => execute('request'),
    cancelRequest: () => execute('cancel'),
    leave: () => execute('leave'),
    pending,
    canParticipate: hasSession && !pending,
    requestStatus: optimisticRequest?.match === match ? optimisticRequest.status : match.myJoinRequest,
    error: mutation.error && mutation.variables
      ? ERROR_MESSAGES[mutation.variables](mutation.error) : null,
    reset: mutation.reset,
  };
}
