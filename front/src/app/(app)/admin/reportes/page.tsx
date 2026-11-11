'use client';

import { ShieldCheck, TriangleAlert } from 'lucide-react';
import { useState } from 'react';

import { BlockAccountDialog } from '@/components/admin/block-account-dialog';
import { ModerationHistoryDialog } from '@/components/admin/moderation-history-dialog';
import { ReportDetailSheet } from '@/components/admin/report-detail-sheet';
import { ReportListSkeleton } from '@/components/admin/report-list-skeleton';
import { ReportRow } from '@/components/admin/report-row';
import { EmptyState } from '@/components/ui/empty-state';
import { RetryButton } from '@/components/ui/retry-button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SegmentedControl, type SegmentOption } from '@/components/ui/segmented-control';
import { Toast } from '@/components/ui/toast';
import { useAdminAccess } from '@/hooks/use-admin-access';
import { useAdminReports } from '@/hooks/use-admin-reports';
import { useResolveReport } from '@/hooks/use-resolve-report';
import { useTimedToast } from '@/hooks/use-timed-toast';
import {
  BLOCK_SUCCESS_MESSAGE,
  RESOLUTION_SUCCESS_MESSAGE,
  resolveReportErrorMessage,
} from '@/lib/admin-reports';
import {
  REPORT_STATUSES,
  REPORT_STATUS_LABEL,
  type AdminReport,
  type ReportResolution,
  type ReportStatus,
} from '@/types/report';

const PAGE = 'flex w-full flex-col gap-6 px-5 py-6 lg:px-6 lg:py-10 xl:px-8';

const STATUS_OPTIONS: SegmentOption<ReportStatus>[] = REPORT_STATUSES.map((value) => ({
  value,
  label: REPORT_STATUS_LABEL[value],
}));

const EMPTY_STATE: Record<ReportStatus, { title: string; text: string }> = {
  OPEN: {
    title: 'No hay reportes abiertos',
    text: 'Cuando alguien reporte a un jugador, lo vas a ver acá.',
  },
  REVIEWED: {
    title: 'No hay reportes revisados',
    text: 'Los reportes que marques como revisados quedan en esta lista.',
  },
  DISMISSED: {
    title: 'No hay reportes descartados',
    text: 'Los reportes que descartes quedan en esta lista.',
  },
};

const MOBILE_HINT =
  'Deslizá a la derecha para marcar revisado o a la izquierda para descartar. Tocá un reporte para ver el detalle.';

const DESKTOP_HINT = 'Hacé clic en un reporte para ver el detalle y resolverlo.';

const ACCESS_ERROR = 'No pudimos comprobar tus permisos. Probá de nuevo en un momento.';

export default function AdminReportsPage() {
  const { user, allowed, loading: accessLoading, error: accessError } = useAdminAccess();
  const [status, setStatus] = useState<ReportStatus>('OPEN');
  const [selected, setSelected] = useState<AdminReport | null>(null);
  const [blocking, setBlocking] = useState<AdminReport | null>(null);
  const [historyOf, setHistoryOf] = useState<AdminReport | null>(null);
  const { reports, loading, error, reload } = useAdminReports(status, allowed);
  const { resolve } = useResolveReport();
  const { toast, showToast } = useTimedToast();

  const isOwnReport = (report: AdminReport) => report.reportedUser.id === user?.id;

  function handleResolve(report: AdminReport, resolution: ReportResolution) {
    setSelected(null);
    resolve(
      { reportId: report.id, status: resolution },
      {
        onSuccess: () => showToast(RESOLUTION_SUCCESS_MESSAGE[resolution], 'success'),
        onError: (caught) => showToast(resolveReportErrorMessage(caught), 'danger'),
      }
    );
  }

  function handleBlock(report: AdminReport) {
    setSelected(null);
    setBlocking(report);
  }

  function handleHistory(report: AdminReport) {
    setSelected(null);
    setHistoryOf(report);
  }

  function closeHistory() {
    setSelected(historyOf);
    setHistoryOf(null);
  }

  function handleBlocked() {
    setBlocking(null);
    showToast(BLOCK_SUCCESS_MESSAGE, 'success');
  }

  function renderReports() {
    if (loading) return <ReportListSkeleton />;

    if (error) {
      return (
        <div className="py-16">
          <EmptyState
            icon={TriangleAlert}
            title="No pudimos cargar los reportes"
            text={error}
            action={<RetryButton onRetry={reload} />}
          />
        </div>
      );
    }

    if (reports.length === 0) {
      return (
        <div className="py-16">
          <EmptyState icon={ShieldCheck} {...EMPTY_STATE[status]} />
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        {status === 'OPEN' && (
          <p className="text-caption text-ink-46">
            <span className="lg:hidden">{MOBILE_HINT}</span>
            <span className="hidden lg:inline">{DESKTOP_HINT}</span>
          </p>
        )}

        <ul className="flex flex-col">
          {reports.map((report) => (
            <ReportRow
              key={report.id}
              report={report}
              isOwnReport={isOwnReport(report)}
              onOpen={setSelected}
              onResolve={handleResolve}
            />
          ))}
        </ul>
      </div>
    );
  }

  function renderContent() {
    if (!accessLoading && accessError) {
      return (
        <div className="py-16">
          <EmptyState icon={TriangleAlert} title="No pudimos abrir el panel" text={ACCESS_ERROR} />
        </div>
      );
    }

    if (!allowed) return <ReportListSkeleton />;

    return (
      <>
        <SegmentedControl
          label="Estado de los reportes"
          options={STATUS_OPTIONS}
          value={status}
          onChange={setStatus}
          className="lg:w-auto lg:self-center"
        />
        {renderReports()}
      </>
    );
  }

  return (
    <main className={PAGE}>
      <ScreenHeader overline="Moderación" title="Reportes" />

      {renderContent()}

      <ReportDetailSheet
        report={selected}
        isOwnReport={selected !== null && isOwnReport(selected)}
        onClose={() => setSelected(null)}
        onResolve={handleResolve}
        onBlock={handleBlock}
        onHistory={handleHistory}
      />

      {historyOf && (
        <ModerationHistoryDialog player={historyOf.reportedUser} onClose={closeHistory} />
      )}

      {blocking && (
        <BlockAccountDialog
          report={blocking}
          onClose={() => setBlocking(null)}
          onBlocked={handleBlocked}
        />
      )}

      {toast && (
        <div className="fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 lg:bottom-8">
          <Toast message={toast.message} tone={toast.tone} />
        </div>
      )}
    </main>
  );
}
