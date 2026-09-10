import type { ReactNode } from 'react';

import { MatchCard, type MatchCardRole } from '@/components/partidos/match-card';
import type { Partido } from '@/types/partido';

type MisPartidosSectionProps = {
  title: string;
  subtitle: string;
  partidos: Partido[];
  role: MatchCardRole;
  empty: ReactNode;
  renderPanel?: (partido: Partido) => ReactNode;
  renderAction: (partido: Partido) => ReactNode;
};

export function MisPartidosSection({
  title,
  subtitle,
  partidos,
  role,
  empty,
  renderPanel,
  renderAction,
}: MisPartidosSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="flex items-baseline gap-3">
          <h2 className="text-title font-bold text-white">{title}</h2>
          <span className="text-callout tabular-nums text-ink-46">{partidos.length}</span>
        </span>

        <p className="text-callout text-ink-46 lg:hidden">{subtitle}</p>
      </div>

      {partidos.length === 0 ? (
        <div className="py-8">{empty}</div>
      ) : (
        <div className="flex flex-col gap-4">
          {partidos.map((partido) => (
            <MatchCard
              key={partido.id}
              partido={partido}
              role={role}
              panel={renderPanel?.(partido)}
              action={renderAction(partido)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
