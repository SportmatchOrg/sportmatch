import { apiFetch } from '@/lib/api';
import { toCreateMatchBody, toUpdateMatchBody, type MatchForm } from '@/lib/match-form';
import type { CancelReason, Match, MatchDetail, MyMatches } from '@/types/match';

export async function fetchMatches(): Promise<Match[]> {
  return apiFetch<Match[]>('/matches');
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
