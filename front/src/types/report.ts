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
