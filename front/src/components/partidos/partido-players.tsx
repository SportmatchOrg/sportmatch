import { AvatarStack } from '@/components/partidos/avatar-stack';
import { cn } from '@/lib/utils';
import type { PublicUser } from '@/types/partido';

const LOW_SPOTS = 2;
const EMPTY_MESSAGE = 'Todavía no se anotó nadie';

type PartidoPlayersProps = {
  participantes: PublicUser[];
  anotados: number;
  cupo: number;
};

export function PartidoPlayers({ participantes, anotados, cupo }: PartidoPlayersProps) {
  const libres = Math.max(0, cupo - anotados);
  const low = libres <= LOW_SPOTS;

  return (
    <section className="flex flex-col gap-5">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-headline font-bold text-white">Quién juega</h2>

        <span
          className={cn(
            'flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-callout font-semibold ring-1',
            low
              ? 'bg-danger-tint text-danger ring-danger/40'
              : 'bg-success-tint text-success ring-success/40'
          )}
        >
          <span
            className={cn('size-2 rounded-full', low ? 'bg-danger' : 'bg-success')}
            aria-hidden="true"
          />
          {libres === 1 ? '1 lugar libre' : `${libres} lugares libres`}
        </span>
      </header>

      {participantes.length ? (
        <AvatarStack usuarios={participantes} />
      ) : (
        <p className="text-callout text-ink-46">{EMPTY_MESSAGE}</p>
      )}
    </section>
  );
}
