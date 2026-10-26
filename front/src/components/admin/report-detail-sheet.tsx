'use client';

import { ArrowRight, Ban } from 'lucide-react';
import Link from 'next/link';

import { RESOLUTION_ACTION, RESOLUTIONS } from '@/components/admin/report-resolutions';
import { SPORT_ICON } from '@/components/matches/sport-icon';
import { Badge } from '@/components/ui/badge';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { PillButton } from '@/components/ui/pill-button';
import { UserAvatar } from '@/components/user-avatar';
import { formatReceivedReports, formatResolvedBy } from '@/lib/admin-reports';
import { formatMatchDateTime } from '@/lib/match-date';
import { formatRelativeTime } from '@/lib/relative-time';
import { SPORT_LABEL, type PublicUser } from '@/types/match';
import { REPORT_REASON_LABEL, type AdminReport, type ReportResolution } from '@/types/report';

const PLAYER_LINK =
  'flex min-w-0 flex-1 items-center gap-2.5 rounded-sm focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none';

const MATCH_LINK =
  'flex items-center gap-2 self-start rounded-sm text-caption text-ink-64 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none';

const OWN_REPORT_NOTICE = 'Este reporte es en tu contra: lo tiene que resolver otro administrador.';

type ReportDetailSheetProps = {
  report: AdminReport | null;
  isOwnReport: boolean;
  onClose: () => void;
  onResolve: (report: AdminReport, status: ReportResolution) => void;
  onBlock: (report: AdminReport) => void;
};

function PlayerLink({ player, caption }: { player: PublicUser; caption: string }) {
  return (
    <Link
      href={`/usuarios/${player.id}`}
      aria-label={`Ver perfil de ${player.name}`}
      className={PLAYER_LINK}
    >
      <UserAvatar
        name={player.name}
        photoUrl={player.photoUrl}
        sizes="40px"
        className="size-10"
        initialsClassName="text-caption"
      />

      <span className="flex min-w-0 flex-col">
        <span className="truncate text-callout font-semibold text-white">{player.name}</span>
        <span className="truncate text-caption text-ink-46">{caption}</span>
      </span>
    </Link>
  );
}

function ReportMatchLink({ match }: { match: NonNullable<AdminReport['match']> }) {
  const Icon = SPORT_ICON[match.sport.name];

  return (
    <Link href={`/partidos/${match.id}`} className={MATCH_LINK}>
      <Icon className="size-4 shrink-0 text-brand" aria-hidden="true" />
      <span>
        {SPORT_LABEL[match.sport.name]} · {match.location} · {formatMatchDateTime(match.date)}
      </span>
    </Link>
  );
}

function ReportActions({
  report,
  onResolve,
  onBlock,
}: Pick<ReportDetailSheetProps, 'onResolve' | 'onBlock'> & { report: AdminReport }) {
  return (
    <div className="flex flex-col gap-2">
      {RESOLUTIONS.map((resolution) => {
        const { label, icon: Icon, buttonVariant } = RESOLUTION_ACTION[resolution];

        return (
          <PillButton
            key={resolution}
            variant={buttonVariant}
            size="md"
            onClick={() => onResolve(report, resolution)}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </PillButton>
        );
      })}

      <PillButton variant="dangerGhost" size="md" onClick={() => onBlock(report)}>
        <Ban className="size-4" aria-hidden="true" />
        Bloquear cuenta
      </PillButton>
    </div>
  );
}

function ReportFooter({
  report,
  isOwnReport,
  onResolve,
  onBlock,
}: Omit<ReportDetailSheetProps, 'onClose' | 'report'> & { report: AdminReport }) {
  const resolvedBy = formatResolvedBy(report);

  if (resolvedBy) return <p className="text-caption text-ink-46">{resolvedBy}</p>;

  if (isOwnReport) return <p className="text-caption text-ink-46">{OWN_REPORT_NOTICE}</p>;

  return <ReportActions report={report} onResolve={onResolve} onBlock={onBlock} />;
}

export function ReportDetailSheet({
  report,
  isOwnReport,
  onClose,
  onResolve,
  onBlock,
}: ReportDetailSheetProps) {
  return (
    <BottomSheet
      open={report !== null}
      onClose={onClose}
      title={report ? REPORT_REASON_LABEL[report.reason] : ''}
    >
      {report && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="warning">{formatReceivedReports(report.reportedUser.reportCount)}</Badge>
            <time dateTime={report.createdAt} className="ml-auto text-caption text-ink-46">
              {formatRelativeTime(report.createdAt)}
            </time>
          </div>

          <div className="flex items-center gap-3">
            <PlayerLink player={report.reporter} caption="Reportó" />
            <ArrowRight className="size-4 shrink-0 text-ink-46" aria-hidden="true" />
            <PlayerLink player={report.reportedUser} caption="Reportado" />
          </div>

          {report.comment && (
            <p className="rounded-sm bg-glass-thin px-3 py-2.5 text-callout text-ink-80">
              “{report.comment}”
            </p>
          )}

          {report.match && <ReportMatchLink match={report.match} />}

          <ReportFooter
            report={report}
            isOwnReport={isOwnReport}
            onResolve={onResolve}
            onBlock={onBlock}
          />
        </div>
      )}
    </BottomSheet>
  );
}
