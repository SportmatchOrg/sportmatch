import { apiFetch } from '@/lib/api';
import type { PublicUser } from '@/types/match';

export type RatingInput = {
  ratedUserId: string;
  score: number;
  comment?: string;
};

export type RatingTargets = {
  matchId: string;
  targets: PublicUser[];
};

export async function fetchRatingTargets(matchId: string): Promise<RatingTargets> {
  return apiFetch<RatingTargets>(`/matches/${matchId}/ratings/pending`);
}

export async function submitRatings(matchId: string, ratings: RatingInput[]): Promise<void> {
  await apiFetch(`/matches/${matchId}/ratings`, {
    method: 'POST',
    body: JSON.stringify({ ratings }),
  });
}
