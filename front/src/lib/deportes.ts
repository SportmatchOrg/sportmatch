import { apiFetch } from '@/lib/api';
import type { Deporte } from '@/types/partido';

export async function fetchDeportes(): Promise<Deporte[]> {
  return apiFetch<Deporte[]>('/deportes');
}
