import { ApiError, apiFetch } from '@/lib/api';
import type { JoinRequest } from '@/lib/join-requests';
import { suspensionErrorMessage } from '@/lib/suspension';
import type { JoinRequestStatus, Match } from '@/types/match';

export type InvitationResponse = Exclude<JoinRequestStatus, 'PENDING'>;

type InvitationRecord = Pick<JoinRequest, 'id' | 'status'> & {
  userId: string;
};

export type Invitation = JoinRequest & { userId: string };

export const INVITATION_STATUS_LABEL: Record<JoinRequestStatus, string> = {
  PENDING: 'Pendiente',
  ACCEPTED: 'Aceptó',
  REJECTED: 'Rechazó',
};

export async function fetchInvitations(matchId: string, signal?: AbortSignal): Promise<Invitation[]> {
  return apiFetch<Invitation[]>(`/matches/${matchId}/invitations`, { signal });
}

export async function invitePlayer(matchId: string, userId: string): Promise<InvitationRecord> {
  return apiFetch<InvitationRecord>(`/matches/${matchId}/invitations`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

export function hasPendingInvitation(match: Match): boolean {
  return !match.isJoined && match.myJoinRequest === 'PENDING'
    && match.myJoinRequestOrigin === 'INVITATION';
}

export async function respondInvitation(matchId: string, status: InvitationResponse): Promise<void> {
  await apiFetch(`/matches/${matchId}/invitations/me`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function invitationResponseErrorMessage(error: unknown): string {
  const suspension = suspensionErrorMessage(error);
  if (suspension) return suspension;
  const fallback = 'No pudimos responder la invitación. Probá de nuevo.';
  if (!(error instanceof ApiError)) return fallback;

  if (error.status === 401) return 'Tu sesión expiró. Volvé a iniciar sesión.';
  if (error.status === 403) return 'No podés responder esta invitación.';
  if (error.status === 404) return 'El partido o la invitación ya no están disponibles.';
  if (error.status !== 409) return fallback;

  const message = error.message.toLowerCase();
  if (message.includes('full')) return 'El partido ya está lleno';
  if (message.includes('canceled')) return 'El partido está cancelado';
  if (message.includes('started')) return 'El partido ya empezó';
  if (message.includes('already joined')) return 'Ya estás anotado en este partido';
  return 'La invitación ya no se puede responder. Actualizá el partido.';
}

export function invitationErrorMessage(error: unknown): string {
  const fallback = 'No pudimos enviar la invitación. Probá de nuevo.';
  if (!(error instanceof ApiError)) return fallback;

  const message = error.message.toLowerCase();
  if (error.status === 401) return 'Tu sesión expiró. Volvé a iniciar sesión.';
  if (error.status === 403) return 'Solo el organizador puede invitar jugadores.';
  if (error.status === 404) return 'El partido o el jugador ya no están disponibles.';
  if (error.status === 400) return 'No se puede invitar a este jugador';
  if (error.status !== 409) return fallback;

  if (message.includes('full')) return 'El partido está lleno';
  if (message.includes('canceled')) return 'El partido está cancelado';
  if (message.includes('started')) return 'El partido ya empezó';
  if (message.includes('already joined')) return 'Ya está anotado';
  if (message.includes('pending invitation')) return 'Ya invitaste a este jugador';
  if (message.includes('already requested')) return 'Este jugador ya pidió sumarse';
  if (message.includes('pending request or invitation')) {
    return 'Este jugador ya tiene una solicitud o invitación pendiente';
  }
  return 'No se puede invitar a este jugador';
}
