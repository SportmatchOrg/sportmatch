import { apiFetch } from '@/lib/api';
import type { JoinRequestStatus, PublicUser } from '@/types/match';

export type JoinRequest = {
  id: string;
  status: JoinRequestStatus;
  user: PublicUser;
};

export async function fetchJoinRequests(matchId: string): Promise<JoinRequest[]> {
  return apiFetch<JoinRequest[]>(`/matches/${matchId}/join-requests`);
}

export async function resolveJoinRequest(
  matchId: string,
  joinRequestId: string,
  status: 'ACCEPTED' | 'REJECTED'
): Promise<void> {
  await apiFetch(`/matches/${matchId}/join-requests/${joinRequestId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
