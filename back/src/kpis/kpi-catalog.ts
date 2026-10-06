type KpiDefinition = {
  id: string;
  kind: 'business';
  unit: string;
  description: string;
};

export const KPIS = [
  {
    id: 'team_completion_rate',
    kind: 'business',
    unit: '%',
    description: 'Matches that filled every spot, out of the matches played',
  },
  {
    id: 'time_to_full',
    kind: 'business',
    unit: 'h',
    description: 'Median hours from creating a match to filling it',
  },
  {
    id: 'user_return_rate',
    kind: 'business',
    unit: '%',
    description: 'Days users came back, out of the days they could have',
  },
  {
    id: 'no_show_rate',
    kind: 'business',
    unit: '%',
    description: 'Confirmed no-shows, out of the players expected',
  },
  {
    id: 'matches_per_active_user',
    kind: 'business',
    unit: '{match}/{user}',
    description: 'Matches attended per user who attended at least one',
  },
  {
    id: 'match_cancellation_rate',
    kind: 'business',
    unit: '%',
    description: 'Canceled matches, out of all the matches',
  },
  {
    id: 'late_withdrawal_rate',
    kind: 'business',
    unit: '%',
    description: 'Players who left late, out of the players who had joined',
  },
] as const satisfies readonly KpiDefinition[];

export type KpiId = (typeof KPIS)[number]['id'];
