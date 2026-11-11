import { ApiError, apiFetch } from '@/lib/api';
import type { NewReport } from '@/types/report';

const CONFLICT = 409;

export async function createReport(report: NewReport): Promise<void> {
  await apiFetch('/reports', { method: 'POST', body: JSON.stringify(report) });
}

export function reportErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === CONFLICT) {
    return 'Ya reportaste a este jugador';
  }

  return 'No pudimos enviar el reporte. Probá de nuevo.';
}
