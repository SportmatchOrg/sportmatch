'use client';

import { Ban, Check, LockOpen, ShieldCheck, X, type LucideIcon } from 'lucide-react';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { iconButtonClassName } from '@/components/ui/icon-button';
import { RetryButton } from '@/components/ui/retry-button';
import { Skeleton } from '@/components/ui/skeleton';
import { useModerationHistory } from '@/hooks/use-moderation-history';
import { formatModeratedBy } from '@/lib/admin-reports';
import { formatRelativeTime } from '@/lib/relative-time';
import { cn } from '@/lib/utils';
import type { PublicUser } from '@/types/match';
import {
  MODERATION_ACTION_LABEL,
  type ModerationAction,
  type ModerationActionType,
} from '@/types/report';

const CONTENT = 'max-h-[calc(100dvh-2rem)] overflow-y-auto';

const ROW = 'flex items-center gap-3 rounded-md bg-glass px-4 py-3 shadow-bevel';

const ACTION_ICON = 'flex size-9 shrink-0 items-center justify-center rounded-full';

const NEUTRAL_TONE = 'bg-glass-strong text-ink-64';

const SKELETON_ROWS = 3;

const ACTION_STYLE: Record<ModerationActionType, { icon: LucideIcon; tone: string }> = {
  REPORT_REVIEWED: { icon: Check, tone: 'bg-brand-tint text-brand' },
  REPORT_DISMISSED: { icon: X, tone: NEUTRAL_TONE },
  USER_BLOCKED: { icon: Ban, tone: 'bg-danger-tint text-danger' },
  USER_UNBLOCKED: { icon: LockOpen, tone: NEUTRAL_TONE },
};

type ModerationHistoryDialogProps = {
  player: PublicUser;
  onClose: () => void;
};

function ActionRow({ action }: { action: ModerationAction }) {
  const { icon: Icon, tone } = ACTION_STYLE[action.type];

  return (
    <li className={ROW}>
      <span className={cn(ACTION_ICON, tone)}>
        <Icon className="size-4" aria-hidden="true" />
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-callout font-semibold text-white">
          {MODERATION_ACTION_LABEL[action.type]}
        </span>
        <span className="truncate text-caption text-ink-46">{formatModeratedBy(action)}</span>
      </span>

      <time dateTime={action.createdAt} className="shrink-0 text-caption text-ink-46">
        {formatRelativeTime(action.createdAt)}
      </time>
    </li>
  );
}

function HistorySkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando historial" className="flex flex-col gap-2">
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <Skeleton key={index} className="h-[62px] rounded-md" />
      ))}
    </div>
  );
}

export function ModerationHistoryDialog({ player, onClose }: ModerationHistoryDialogProps) {
  const { actions, loading, error, reload } = useModerationHistory(player.id);

  function renderHistory() {
    if (loading) return <HistorySkeleton />;

    if (error) {
      return (
        <div className="flex flex-col items-start gap-3">
          <p role="alert" className="text-callout text-danger">
            {error}
          </p>
          <RetryButton onRetry={reload} />
        </div>
      );
    }

    if (actions.length === 0) {
      return (
        <div className="py-4">
          <EmptyState
            icon={ShieldCheck}
            title="Sin antecedentes"
            text={`Ningún administrador tomó acciones sobre ${player.name}.`}
          />
        </div>
      );
    }

    return (
      <ol className="flex flex-col gap-2">
        {actions.map((action) => (
          <ActionRow key={action.id} action={action} />
        ))}
      </ol>
    );
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={CONTENT}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-2">
            <DialogTitle>Historial de moderación</DialogTitle>
            <DialogDescription>{player.name}</DialogDescription>
          </div>

          <DialogClose aria-label="Cerrar" className={iconButtonClassName('soft', 'sm')}>
            <X className="size-5" aria-hidden="true" />
          </DialogClose>
        </div>

        {renderHistory()}
      </DialogContent>
    </Dialog>
  );
}
