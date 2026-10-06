import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import type { KpiResultStatus } from '../generated/prisma/client';
import type { KpiValue } from '../utils/kpis/kpi-value';
import {
  lateWithdrawalRate,
  matchCancellationRate,
  matchesPerActiveUser,
  noShowRate,
  teamCompletionRate,
  timeToFull,
} from '../utils/kpis/match-kpis';
import { userReturnRate } from '../utils/kpis/user-return-rate';
import { RATING_WINDOW_MS } from '../utils/ratings/rating-window';
import {
  addDays,
  fromDayIndex,
  startOfArgentinaDay,
  toArgentinaDate,
  toDayIndex,
} from '../utils/time/argentina-date';
import { MS_PER_DAY } from '../utils/time/milliseconds';
import { KPIS, type KpiId } from './kpi-catalog';
import { KpisRepository } from './kpis.repository';

const WINDOW_DAYS = 30;
const DECIMALS = 100;

const QUERY_FAILED = 'QUERY_FAILED';
const CALCULATION_FAILED = 'CALCULATION_FAILED';
const INVALID_VALUE = 'INVALID_VALUE';

type Kpi = (typeof KPIS)[number];

type KpiResult = {
  kpiId: KpiId;
  kind: Kpi['kind'];
  unit: Kpi['unit'];
  value: number | null;
  status: KpiResultStatus;
  numerator: number | null;
  denominator: number | null;
  errorCode: string | null;
};

const round = (value: number): number =>
  Math.round(value * DECIMALS) / DECIMALS;

const isRealDay = (day: string): boolean => {
  const dayIndex = toDayIndex(day);

  return !Number.isNaN(dayIndex) && fromDayIndex(dayIndex) === day;
};

const toErrorCode = (reason: unknown): string =>
  reason instanceof Error && reason.name.startsWith('PrismaClient')
    ? QUERY_FAILED
    : CALCULATION_FAILED;

@Injectable()
export class KpisService {
  private readonly logger = new Logger(KpisService.name);

  constructor(private readonly kpisRepository: KpisRepository) {}

  async createSnapshot(requestedDate?: string) {
    const now = new Date();
    const date = this.resolveDate(requestedDate, now);
    const settled = await this.calculate(date, now);
    const results = KPIS.map((kpi, index) =>
      this.toResult(kpi, settled[index]),
    );

    const run = await this.kpisRepository.createRun(
      new Date(date),
      results.map(
        ({ kpiId, value, status, numerator, denominator, errorCode }) => ({
          kpiId,
          value,
          status,
          numerator,
          denominator,
          errorCode,
        }),
      ),
    );

    return {
      runId: run.id,
      date,
      results: results.map(
        ({ kpiId, kind, unit, value, status, numerator, denominator }) => ({
          kpiId,
          kind,
          unit,
          value,
          status,
          numerator,
          denominator,
        }),
      ),
    };
  }

  private resolveDate(requestedDate: string | undefined, now: Date): string {
    const yesterday = addDays(toArgentinaDate(now), -1);

    if (requestedDate === undefined) {
      return yesterday;
    }

    if (!isRealDay(requestedDate)) {
      throw new BadRequestException('date must be a real calendar day');
    }

    if (requestedDate > yesterday) {
      throw new BadRequestException(
        'date cannot be later than yesterday in Buenos Aires',
      );
    }

    return requestedDate;
  }

  private calculate(date: string, now: Date) {
    const firstDay = addDays(date, 1 - WINDOW_DAYS);
    const from = startOfArgentinaDay(firstDay);
    const to = startOfArgentinaDay(addDays(date, 1));

    const cohort = this.kpisRepository.findMatchesBetween(from, to);
    const closedMatches = this.findClosedMatches(from, to, now);
    const returnRate = this.calculateReturnRate(firstDay, date, to);

    const calculations: Record<KpiId, () => Promise<KpiValue>> = {
      team_completion_rate: async () => teamCompletionRate(await cohort),
      time_to_full: async () => timeToFull(await cohort),
      user_return_rate: () => returnRate,
      no_show_rate: async () => noShowRate(await closedMatches),
      matches_per_active_user: async () =>
        matchesPerActiveUser(await cohort, now),
      match_cancellation_rate: async () => matchCancellationRate(await cohort),
      late_withdrawal_rate: async () => lateWithdrawalRate(await cohort),
    };

    return Promise.allSettled(KPIS.map(({ id }) => calculations[id]()));
  }

  private findClosedMatches(from: Date, to: Date, now: Date) {
    const closedBefore = Math.min(to.getTime(), now.getTime());

    return this.kpisRepository.findMatchesBetween(
      new Date(from.getTime() - RATING_WINDOW_MS),
      new Date(closedBefore - RATING_WINDOW_MS),
    );
  }

  private async calculateReturnRate(
    firstDay: string,
    lastDay: string,
    to: Date,
  ) {
    const [users, activity, firstActivityDay] = await Promise.all([
      this.kpisRepository.findUsersCreatedBefore(to),
      this.kpisRepository.findActivityBetween(
        new Date(firstDay),
        new Date(lastDay),
      ),
      this.kpisRepository.findFirstActivityDay(),
    ]);

    const activeDays = new Map<string, number[]>();

    for (const { userId, activityDate } of activity) {
      const days = activeDays.get(userId) ?? [];

      days.push(activityDate.getTime() / MS_PER_DAY);
      activeDays.set(userId, days);
    }

    return userReturnRate({
      windowStart: toDayIndex(firstDay),
      windowEnd: toDayIndex(lastDay),
      firstDataDay: firstActivityDay
        ? firstActivityDay.getTime() / MS_PER_DAY
        : null,
      users,
      activeDays,
    });
  }

  private toResult(
    kpi: Kpi,
    settled: PromiseSettledResult<KpiValue>,
  ): KpiResult {
    const base = { kpiId: kpi.id, kind: kpi.kind, unit: kpi.unit };
    const failed = (errorCode: string): KpiResult => {
      this.logger.error(`KPI ${kpi.id} failed with ${errorCode}`);

      return {
        ...base,
        value: null,
        status: 'ERROR',
        numerator: null,
        denominator: null,
        errorCode,
      };
    };

    if (settled.status === 'rejected') {
      return failed(toErrorCode(settled.reason));
    }

    const { value, numerator, denominator } = settled.value;

    if (value === null) {
      return {
        ...base,
        value,
        status: 'NO_DATA',
        numerator,
        denominator,
        errorCode: null,
      };
    }

    if (!Number.isFinite(value)) {
      return failed(INVALID_VALUE);
    }

    return {
      ...base,
      value: round(value),
      status: 'READY',
      numerator,
      denominator,
      errorCode: null,
    };
  }
}
