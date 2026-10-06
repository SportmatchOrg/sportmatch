import { ApiError, apiFetch } from '@/lib/api';
import type { RatingInput, RatingTargets } from '@/types/ratings';

export async function fetchRatingTargets(matchId: string): Promise<RatingTargets> {
  return apiFetch<RatingTargets>(`/matches/${matchId}/ratings/pending`);
}

export async function submitRatings(
  matchId: string,
  ratings: RatingInput[],
  noShowUserIds: string[],
): Promise<void> {
  await apiFetch(`/matches/${matchId}/ratings`, {
    method: 'POST',
    body: JSON.stringify({ ratings, noShowUserIds }),
  });
}

export function ratingSuccessMessage(ratedCount: number, noShowCount: number): string {
  const ratings = `Listo, calificaste a ${ratedCount} ${ratedCount === 1 ? 'jugador' : 'jugadores'}`;
  return noShowCount > 0
    ? `${ratings} y marcaste ${noShowCount} ${noShowCount === 1 ? 'falta' : 'faltas'}`
    : ratings;
}

export function ratingWindowClosed(error: unknown): boolean {
  return error instanceof ApiError && error.status === 400 &&
    error.message === 'The rating window is closed';
}
