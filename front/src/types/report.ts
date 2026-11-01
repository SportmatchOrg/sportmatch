import type { BlockDuration } from '@/lib/account-block';
import type { PublicUser, Sport } from '@/types/match';

export type ReportReason = 'AGGRESSIVE_BEHAVIOR' | 'OFFENSIVE_LANGUAGE' | 'FAKE_PROFILE' | 'OTHER';

export const REPORT_REASONS: ReportReason[] = [
  'AGGRESSIVE_BEHAVIOR',
  'OFFENSIVE_LANGUAGE',
  'FAKE_PROFILE',
  'OTHER',
];

export const REPORT_REASON_LABEL: Record<ReportReason, string> = {
  AGGRESSIVE_BEHAVIOR: 'Comportamiento agresivo',
  OFFENSIVE_LANGUAGE: 'Lenguaje ofensivo',
  FAKE_PROFILE: 'Perfil falso',
  OTHER: 'Otro',
};

export const REPORT_COMMENT_MAX = 500;

export type NewReport = {
  reportedUserId: string;
  reason: ReportReason;
  comment?: string;
  matchId?: string;
};

export type ReportStatus = 'OPEN' | 'REVIEWED' | 'DISMISSED';

export type ReportResolution = Exclude<ReportStatus, 'OPEN'>;

export const REPORT_STATUSES: ReportStatus[] = ['OPEN', 'REVIEWED', 'DISMISSED'];

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  OPEN: 'Abiertos',
  REVIEWED: 'Revisados',
  DISMISSED: 'Descartados',
};

export const REPORT_RESOLVED_BY_LABEL: Record<ReportResolution, string> = {
  REVIEWED: 'Revisado por',
  DISMISSED: 'Descartado por',
};

export type ReportedUser = PublicUser & { reportCount: number };

export type ReportMatch = {
  id: string;
  date: string;
  location: string;
  sport: Sport;
};

export type AdminReport = {
  id: string;
  reason: ReportReason;
  comment: string | null;
  status: ReportStatus;
  createdAt: string;
  reviewedAt: string | null;
  reporter: PublicUser;
  reportedUser: ReportedUser;
  reviewedBy: PublicUser | null;
  match: ReportMatch | null;
};

export type ModerationActionType =
  | 'REPORT_REVIEWED'
  | 'REPORT_DISMISSED'
  | 'USER_BLOCKED'
  | 'USER_UNBLOCKED';

export const MODERATION_ACTION_LABEL: Record<ModerationActionType, string> = {
  REPORT_REVIEWED: 'Reporte revisado',
  REPORT_DISMISSED: 'Reporte descartado',
  USER_BLOCKED: 'Cuenta bloqueada',
  USER_UNBLOCKED: 'Cuenta desbloqueada',
};

export type ModerationAction = {
  id: string;
  type: ModerationActionType;
  reportId: string | null;
  detail: { duration: BlockDuration } | null;
  createdAt: string;
  admin: PublicUser;
};
