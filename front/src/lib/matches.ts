import { ApiError, apiFetch } from '@/lib/api';
import { toCreateMatchBody, toUpdateMatchBody, type MatchForm } from '@/lib/match-form';
import { suspensionErrorMessage } from '@/lib/suspension';
import type {
  CancelReason,
  Match,
  MatchDetail,
  MatchesQuery,
  MyMatches,
} from '@/types/match';

const CONFLICT = 409;
const BAD_REQUEST = 400;
const JOIN_REQUEST_FALLBACK = 'No pudimos enviar tu solicitud. Probá de nuevo.';

export function joinRequestErrorMessage(error: unknown): string {
  const suspension = suspensionErrorMessage(error);
  if (suspension) return suspension;
  if (!(error instanceof ApiError)) return JOIN_REQUEST_FALLBACK;

  if (error.status === CONFLICT) {
    return error.message.toLowerCase().includes('full')
      ? 'El partido se llenó'
      : 'Ya pediste sumarte';
  }

  if (error.status === BAD_REQUEST) return 'Este partido ya se jugó';

  return JOIN_REQUEST_FALLBACK;
}

function toSearchParams(query: MatchesQuery): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined) return;

    [value].flat().forEach((item) => params.append(key, String(item)));
  });

  return params;
}

export async function fetchMatches(query: MatchesQuery = {}): Promise<Match[]> {
  const search = toSearchParams(query).toString();

  return apiFetch<Match[]>(search ? `/matches?${search}` : '/matches');
}
export async function fetchMyMatches(): Promise<MyMatches> {
  return apiFetch<MyMatches>('/matches/mine');
}

export async function fetchMatch(matchId: string): Promise<MatchDetail> {
  return apiFetch<MatchDetail>(`/matches/${matchId}`);
}

export async function createMatch(form: MatchForm): Promise<Match> {
  return apiFetch<Match>('/matches', {
    method: 'POST',
    body: JSON.stringify(toCreateMatchBody(form)),
  });
}

export async function updateMatch(matchId: string, form: MatchForm): Promise<Match> {
  return apiFetch<Match>(`/matches/${matchId}`, {
    method: 'PATCH',
    body: JSON.stringify(toUpdateMatchBody(form)),
  });
}

export async function requestToJoin(matchId: string): Promise<void> {
  await apiFetch(`/matches/${matchId}/join-requests`, { method: 'POST' });
}

export async function cancelJoinRequest(matchId: string): Promise<void> {
  await apiFetch<void>(`/matches/${matchId}/join-requests/me`, { method: 'DELETE' });
}

export async function cancelMatch(matchId: string, reason: CancelReason): Promise<Match> {
  return apiFetch<Match>(`/matches/${matchId}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
}

export async function leaveMatch(matchId: string): Promise<void> {
  await apiFetch<void>(`/matches/${matchId}/participants/me`, { method: 'DELETE' });
}
