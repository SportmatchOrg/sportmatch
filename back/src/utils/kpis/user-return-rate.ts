import { toArgentinaDate, toDayIndex } from '../time/argentina-date';
import { percentage, type KpiValue } from './kpi-value';

export type ReturnRateInput = {
  windowStart: number;
  windowEnd: number;
  firstDataDay: number | null;
  users: { id: string; createdAt: Date }[];
  activeDays: Map<string, number[]>;
};

export const userReturnRate = ({
  windowStart,
  windowEnd,
  firstDataDay,
  users,
  activeDays,
}: ReturnRateInput): KpiValue => {
  if (firstDataDay === null) {
    return percentage(0, 0);
  }

  let observable = 0;
  let active = 0;

  for (const { id, createdAt } of users) {
    const signUpDay = toDayIndex(toArgentinaDate(createdAt));
    const firstDay = Math.max(windowStart, firstDataDay, signUpDay + 1);

    if (firstDay > windowEnd) {
      continue;
    }

    observable += windowEnd - firstDay + 1;
    active += new Set(
      (activeDays.get(id) ?? []).filter(
        (day) => day >= firstDay && day <= windowEnd,
      ),
    ).size;
  }

  return percentage(active, observable);
};
