import { ApiError, apiFetch } from '@/lib/api';
import { formatRelativeTime } from '@/lib/relative-time';
import {
  REPORT_RESOLVED_BY_LABEL,
  type AdminReport,
  type ReportResolution,
  type ReportStatus,
} from '@/types/report';

export const RESOLUTION_SUCCESS_MESSAGE: Record<ReportResolution, string> = {
  REVIEWED: 'Reporte marcado como revisado',
  DISMISSED: 'Reporte descartado',
};

const RESOLVE_ERROR_MESSAGE: Partial<Record<number, string>> = {
  403: 'No podés resolver un reporte en tu contra.',
  404: 'Este reporte ya no existe.',
  409: 'Otro administrador ya resolvió este reporte.',
};

const RESOLVE_FALLBACK = 'No pudimos resolver el reporte. Probá de nuevo.';

export async function fetchAdminReports(status: ReportStatus): Promise<AdminReport[]> {
  const params = new URLSearchParams({ status });
  return apiFetch<AdminReport[]>(`/admin/reports?${params}`);
}

export async function resolveReport(
  reportId: string,
  status: ReportResolution
): Promise<AdminReport> {
  return apiFetch<AdminReport>(`/admin/reports/${reportId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function resolveReportErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return RESOLVE_FALLBACK;

  return RESOLVE_ERROR_MESSAGE[error.status] ?? RESOLVE_FALLBACK;
}

export function formatReceivedReports(count: number): string {
  return count === 1 ? '1 reporte recibido' : `${count} reportes recibidos`;
}

export function formatResolvedBy(report: AdminReport): string | null {
  if (report.status === 'OPEN') return null;

  const reviewer = report.reviewedBy?.name ?? 'un administrador';
  const when = report.reviewedAt ? ` · ${formatRelativeTime(report.reviewedAt)}` : '';

  return `${REPORT_RESOLVED_BY_LABEL[report.status]} ${reviewer}${when}`;
}
