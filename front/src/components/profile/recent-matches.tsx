import { CalendarX } from 'lucide-react';
import Link from 'next/link';

import { MatchRow } from '@/components/partidos/match-row';
import { PROFILE_SECTION } from '@/components/profile/profile-layout';
import { cn } from '@/lib/utils';
import type { Partido } from '@/types/partido';

const MAX_CARDS = 4;

const SEE_ALL_HREF = '/mis-partidos';

const PANEL =
  'flex flex-col items-center gap-3 rounded-[20px] border border-glass-strong bg-glass px-6 py-10 text-center lg:rounded-[28px] lg:py-16';

type RecentMatchesProps = {
  partidos: Partido[];
  error: string | null;
};

export function RecentMatches({ partidos, error }: RecentMatchesProps) {
  return (
    <section className={cn(PROFILE_SECTION, 'pt-8 lg:pt-10')}>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-title lg:text-[28px]">Partidos recientes</h2>

        {partidos.length > 0 && !error && (
          <Link
            href={SEE_ALL_HREF}
            className="shrink-0 text-callout font-semibold text-brand transition hover:text-brand-bright"
          >
            Ver todos
          </Link>
        )}
      </div>

      <div className="pt-4">
        {error && (
          <div role="alert" className={PANEL}>
            <CalendarX className="size-8 text-danger" aria-hidden="true" />
            <p className="text-body text-ink-46">{error}</p>
          </div>
        )}

        {!error && partidos.length === 0 && (
          <div className={PANEL}>
            <CalendarX className="size-8 text-ink-46" aria-hidden="true" />
            <p className="text-body text-ink-46">Todavía no jugaste ningún partido</p>
          </div>
        )}

        {!error && partidos.length > 0 && (
          <div className="flex flex-col gap-3 lg:grid lg:grid-cols-4 lg:gap-4">
            {partidos.slice(0, MAX_CARDS).map((partido) => (
              <MatchRow key={partido.id} partido={partido} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
