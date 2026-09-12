import { AvatarStack } from '@/components/partidos/avatar-stack';
import { cn } from '@/lib/utils';
import type { PublicUser } from '@/types/partido';

const LOW_SPOTS = 2;
const EMPTY_MESSAGE = 'Todavía no se anotó nadie';

type PartidoPlayersProps = {
  participantes: PublicUser[];
  organizador: PublicUser;
  anotados: number;
  cupo: number;
  played?: boolean;
};

export function PartidoPlayers({
  participantes,
  organizador,
  anotados,
  cupo,
  played = false,
}: PartidoPlayersProps) {
  const libres = Math.max(0, cupo - anotados);
  const low = libres <= LOW_SPOTS;
  const usuarios = played
    ? [organizador, ...participantes.filter(({ id }) => id !== organizador.id)]
    : participantes;

  return (
    <section className="flex flex-col gap-5">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-headline font-bold text-white">
          {played ? 'Quién jugó' : 'Quién juega'}
        </h2>

        {!played && (
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
        )}
      </header>

      {usuarios.length ? (
        <AvatarStack usuarios={usuarios} />
      ) : (
        <p className="text-callout text-ink-46">{EMPTY_MESSAGE}</p>
      )}
    </section>
  );
}
