import type { ReactNode } from 'react';

import { MatchCard, type MatchCardRole } from '@/components/matches/match-card';
import type { Match } from '@/types/match';

type MyMatchesSectionProps = {
  title: string;
  subtitle: string;
  matches: Match[];
  role: MatchCardRole;
  empty: ReactNode;
  renderPanel?: (match: Match) => ReactNode;
  renderAction: (match: Match) => ReactNode;
};

export function MyMatchesSection({
  title,
  subtitle,
  matches,
  role,
  empty,
  renderPanel,
  renderAction,
}: MyMatchesSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="flex items-baseline gap-3">
          <h2 className="text-title font-bold text-white">{title}</h2>
          <span className="text-callout tabular-nums text-ink-46">{matches.length}</span>
        </span>

        <p className="text-callout text-ink-46 lg:hidden">{subtitle}</p>
      </div>

      {matches.length === 0 ? (
        <div className="py-8">{empty}</div>
      ) : (
        <div className="flex flex-col gap-4">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              role={role}
              panel={renderPanel?.(match)}
              action={renderAction(match)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
