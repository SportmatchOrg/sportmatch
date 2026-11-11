'use client';

import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';

import { resolveReport } from '@/lib/admin-reports';
import { adminReportKeys } from '@/lib/query-keys';
import type { AdminReport, ReportResolution } from '@/types/report';

type ResolveReportInput = {
  reportId: string;
  status: ReportResolution;
};

type ResolveReportSnapshot = {
  lists: [QueryKey, AdminReport[] | undefined][];
};

export function useResolveReport() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ reportId, status }: ResolveReportInput) => resolveReport(reportId, status),
    onMutate: async ({ reportId }): Promise<ResolveReportSnapshot> => {
      await queryClient.cancelQueries({ queryKey: adminReportKeys.all });

      const lists = queryClient.getQueriesData<AdminReport[]>({ queryKey: adminReportKeys.all });

      queryClient.setQueriesData<AdminReport[]>({ queryKey: adminReportKeys.all }, (reports) =>
        reports?.filter((report) => report.id !== reportId)
      );

      return { lists };
    },
    onError: (_error, _input, snapshot) => {
      snapshot?.lists.forEach(([queryKey, reports]) => queryClient.setQueryData(queryKey, reports));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: adminReportKeys.all }),
  });

  return { resolve: mutation.mutate };
}
