import { apiFetch } from '@/lib/api';
import type { Sport } from '@/types/match';

export async function fetchSports(): Promise<Sport[]> {
  return apiFetch<Sport[]>('/sports');
}
