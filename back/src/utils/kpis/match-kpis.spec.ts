import { teamCompletionRate, type KpiMatch } from './match-kpis';

const buildMatch = (
  capacity: number,
  participants: number,
  overrides: Partial<KpiMatch> = {},
): KpiMatch => ({
  id: `match-${capacity}-${participants}`,
  status: 'ACTIVE',
  date: new Date('2026-10-01T20:00:00Z'),
  createdAt: new Date('2026-09-25T20:00:00Z'),
  filledAt: null,
  capacity,
  organizerId: 'organizer',
  participants: Array.from({ length: participants }, (_, index) => ({
    userId: `player-${index}`,
  })),
  lateWithdrawals: [],
  noShowReports: [],
  ...overrides,
});

describe('teamCompletionRate', () => {
  it('counts the organizer as one of the players', () => {
    expect(teamCompletionRate([buildMatch(4, 3)]).value).toBe(100);
  });

  it('does not count a match missing one player as complete', () => {
    expect(teamCompletionRate([buildMatch(4, 2)]).value).toBe(0);
  });

  it('counts an over-filled match as complete', () => {
    expect(teamCompletionRate([buildMatch(4, 4)]).value).toBe(100);
  });

  it('ignores canceled matches', () => {
    const result = teamCompletionRate([
      buildMatch(4, 3),
      buildMatch(4, 0),
      buildMatch(2, 1, { status: 'CANCELED' }),
    ]);

    expect(result).toEqual({ value: 50, numerator: 1, denominator: 2 });
  });

  it('returns no data without active matches', () => {
    expect(teamCompletionRate([]).value).toBeNull();
  });
});
