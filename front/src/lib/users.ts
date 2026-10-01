import { apiFetch } from '@/lib/api';
import type { Match } from '@/types/match';
import type { PublicProfile } from '@/types/user';

export async function fetchPublicProfile(userId: string): Promise<PublicProfile> {
  return apiFetch<PublicProfile>(`/users/${userId}`);
}

export async function fetchPlayedBy(userId: string): Promise<Match[]> {
  return apiFetch<Match[]>(`/matches/played-by/${userId}`);
}
