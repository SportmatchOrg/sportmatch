const REPORTS_TO_CONFIRM = 2;

type NoShowReport = {
  reporterId: string;
  reportedUserId: string;
  createdAt: Date;
};

const isConfirmed = (reporters: Set<string>, organizerId: string): boolean =>
  reporters.has(organizerId) || reporters.size >= REPORTS_TO_CONFIRM;

export const confirmedNoShows = (
  reports: NoShowReport[],
  organizerId: string,
): Map<string, Date> => {
  const reportersByUser = new Map<string, Set<string>>();
  const confirmedAt = new Map<string, Date>();
  const inOrder = [...reports].sort(
    (first, second) => first.createdAt.getTime() - second.createdAt.getTime(),
  );

  for (const { reporterId, reportedUserId, createdAt } of inOrder) {
    if (confirmedAt.has(reportedUserId)) {
      continue;
    }

    const reporters = reportersByUser.get(reportedUserId) ?? new Set<string>();

    reporters.add(reporterId);
    reportersByUser.set(reportedUserId, reporters);

    if (isConfirmed(reporters, organizerId)) {
      confirmedAt.set(reportedUserId, createdAt);
    }
  }

  return confirmedAt;
};
