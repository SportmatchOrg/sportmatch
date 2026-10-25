'use client';

import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useAuth } from '@/context/auth-context';
import { fetchAdminReports } from '@/lib/admin-reports';
import { adminReportKeys } from '@/lib/query-keys';
import type { AdminReport, ReportStatus } from '@/types/report';

const ERROR_MESSAGE = 'No pudimos cargar los reportes. Probá de nuevo en un momento.';

const NO_REPORTS: AdminReport[] = [];

export function useAdminReports(status: ReportStatus, enabled: boolean) {
  const { user: firebaseUser, loading: sessionLoading } = useAuth();

  const { data, isPending, isLoadingError, refetch } = useQuery({
    queryKey: adminReportKeys.list(status),
    queryFn: () => fetchAdminReports(status),
    enabled: enabled && !sessionLoading && !!firebaseUser,
  });

  const reload = useCallback(() => void refetch(), [refetch]);

  return {
    reports: data ?? NO_REPORTS,
    loading: sessionLoading || isPending,
    error: isLoadingError ? ERROR_MESSAGE : null,
    reload,
  };
}
