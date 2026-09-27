const REPORTS_TO_CONFIRM = 2;

type NoShowReport = {
  reporterId: string;
  reportedUserId: string;
};

export const confirmedNoShowIds = (
  reports: NoShowReport[],
  organizerId: string,
): string[] => {
  const reportersByUser = new Map<string, Set<string>>();

  for (const { reporterId, reportedUserId } of reports) {
    const reporters = reportersByUser.get(reportedUserId) ?? new Set<string>();

    reporters.add(reporterId);
    reportersByUser.set(reportedUserId, reporters);
  }

  return [...reportersByUser]
    .filter(
      ([, reporters]) =>
        reporters.has(organizerId) || reporters.size >= REPORTS_TO_CONFIRM,
    )
    .map(([reportedUserId]) => reportedUserId);
};
