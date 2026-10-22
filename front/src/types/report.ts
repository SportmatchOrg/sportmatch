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
