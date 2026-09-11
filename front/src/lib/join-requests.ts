import { apiFetch } from '@/lib/api';
import type { JoinRequestStatus, PublicUser } from '@/types/partido';

export type JoinRequest = {
  id: string;
  status: JoinRequestStatus;
  user: PublicUser;
};

export async function fetchJoinRequests(partidoId: string): Promise<JoinRequest[]> {
  return apiFetch<JoinRequest[]>(`/partidos/${partidoId}/join-requests`);
}

export async function resolveJoinRequest(
  partidoId: string,
  joinRequestId: string,
  status: 'ACCEPTED' | 'REJECTED'
): Promise<void> {
  await apiFetch(`/partidos/${partidoId}/join-requests/${joinRequestId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
