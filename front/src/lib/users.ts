import { apiFetch } from '@/lib/api';
import type { Partido } from '@/types/partido';
import type { PublicProfile } from '@/types/user';

export async function fetchPublicProfile(userId: string): Promise<PublicProfile> {
  return apiFetch<PublicProfile>(`/users/${userId}`);
}

export async function fetchPlayedBy(userId: string): Promise<Partido[]> {
  return apiFetch<Partido[]>(`/partidos/played-by/${userId}`);
}
