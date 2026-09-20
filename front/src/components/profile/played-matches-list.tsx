import { CalendarX } from 'lucide-react';

import { MatchRow } from '@/components/partidos/match-row';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import type { Match } from '@/types/match';

const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const GRID = 'flex flex-col gap-3 lg:grid lg:grid-cols-3 lg:gap-4';

type MonthGroup = {
  key: string;
  label: string;
  matches: Match[];
};

function groupByMonth(matches: Match[]): MonthGroup[] {
  const groups: MonthGroup[] = [];

  for (const match of matches) {
    const date = new Date(match.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const last = groups.at(-1);

    if (last?.key === key) {
      last.matches.push(match);
      continue;
    }

    groups.push({
      key,
      label: `${MONTHS[date.getMonth()]} ${date.getFullYear()}`,
      matches: [match],
    });
  }

  return groups;
}

export function PlayedMatchesSkeleton() {
  return (
    <div className={GRID}>
      {[0, 1, 2, 3].map((index) => (
        <Skeleton key={index} className="h-[100px] rounded-md lg:h-[300px] lg:rounded-lg" />
      ))}
    </div>
  );
}

type PlayedMatchesListProps = {
  matches: Match[];
  emptyTitle: string;
};

export function PlayedMatchesList({ matches, emptyTitle }: PlayedMatchesListProps) {
  if (matches.length === 0) {
    return (
      <EmptyState
        icon={CalendarX}
        title={emptyTitle}
        text="Los partidos aparecen acá cuando terminan."
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {groupByMonth(matches).map((group) => (
        <section key={group.key} className="flex flex-col gap-4">
          <h2 className="text-overline text-ink-46 uppercase">{group.label}</h2>

          <div className={GRID}>
            {group.matches.map((match) => (
              <MatchRow key={match.id} match={match} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
