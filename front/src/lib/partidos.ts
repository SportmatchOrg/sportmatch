import { apiFetch } from '@/lib/api';
import type { Partido } from '@/types/partido';

export async function fetchPartidos(): Promise<Partido[]> {
  return apiFetch<Partido[]>('/partidos');
}

export async function joinPartido(partidoId: string): Promise<void> {
  await apiFetch(`/partidos/${partidoId}/participantes`, { method: 'POST' });
}
