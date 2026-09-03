import { apiFetch } from '@/lib/api';
import type { Partido, PartidoDetalle } from '@/types/partido';

export async function fetchPartidos(): Promise<Partido[]> {
  return apiFetch<Partido[]>('/partidos');
}

export async function fetchPartido(partidoId: string): Promise<PartidoDetalle> {
  return apiFetch<PartidoDetalle>(`/partidos/${partidoId}`);
}

export async function joinPartido(partidoId: string): Promise<void> {
  await apiFetch(`/partidos/${partidoId}/participantes`, { method: 'POST' });
}

export async function leavePartido(partidoId: string): Promise<void> {
  await apiFetch<void>(`/partidos/${partidoId}/participantes/me`, { method: 'DELETE' });
}
