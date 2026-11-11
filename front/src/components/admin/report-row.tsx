'use client';

import { ChevronRight } from 'lucide-react';

import { RESOLUTION_ACTION } from '@/components/admin/report-resolutions';
import { SwipeRow, type SwipeAction } from '@/components/ui/swipe-row';
import { UserAvatar } from '@/components/user-avatar';
import { formatReceivedReports, formatResolvedBy } from '@/lib/admin-reports';
import { formatRelativeTime } from '@/lib/relative-time';
import { REPORT_REASON_LABEL, type AdminReport, type ReportResolution } from '@/types/report';

const ROW =
  'flex w-full items-center gap-3 rounded-md bg-sheet px-4 py-3 text-left shadow-bevel transition outline-none hover:brightness-125 focus-visible:ring-2 focus-visible:ring-brand active:scale-[var(--press-scale-card)]';

const ROW_SPACING = 'pb-2';

type ReportRowProps = {
  report: AdminReport;
  isOwnReport: boolean;
  onOpen: (report: AdminReport) => void;
  onResolve: (report: AdminReport, status: ReportResolution) => void;
};

function rowNote(report: AdminReport, isOwnReport: boolean): string {
  const resolvedBy = formatResolvedBy(report);

  if (resolvedBy) return resolvedBy;

  const context = isOwnReport ? 'En tu contra' : formatReceivedReports(report.reportedUser.reportCount);

  return `${context} · por ${report.reporter.name}`;
}

function swipeAction(
  report: AdminReport,
  resolution: ReportResolution,
  onResolve: ReportRowProps['onResolve']
): SwipeAction {
  const { label, icon, swipeTone } = RESOLUTION_ACTION[resolution];

  return { label, icon, tone: swipeTone, onCommit: () => onResolve(report, resolution) };
}

export function ReportRow({ report, isOwnReport, onOpen, onResolve }: ReportRowProps) {
  const { reportedUser } = report;

  const content = (
    <button type="button" onClick={() => onOpen(report)} className={ROW}>
      <UserAvatar
        name={reportedUser.name}
        photoUrl={reportedUser.photoUrl}
        sizes="44px"
        className="size-11"
        initialsClassName="text-caption"
      />

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-baseline gap-2">
          <span className="truncate text-callout font-semibold text-white">
            {reportedUser.name}
          </span>
          <time dateTime={report.createdAt} className="ml-auto shrink-0 text-caption text-ink-46">
            {formatRelativeTime(report.createdAt)}
          </time>
        </span>
        <span className="truncate text-caption font-semibold text-danger">
          {REPORT_REASON_LABEL[report.reason]}
        </span>
        <span className="truncate text-caption text-ink-46">{rowNote(report, isOwnReport)}</span>
      </span>

      <ChevronRight className="size-4.5 shrink-0 text-ink-46" aria-hidden="true" />
    </button>
  );

  if (report.status !== 'OPEN' || isOwnReport) {
    return <li className={ROW_SPACING}>{content}</li>;
  }

  return (
    <li>
      <SwipeRow
        className={ROW_SPACING}
        startAction={swipeAction(report, 'REVIEWED', onResolve)}
        endAction={swipeAction(report, 'DISMISSED', onResolve)}
      >
        {content}
      </SwipeRow>
    </li>
  );
}
