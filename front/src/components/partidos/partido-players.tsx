import { AvatarStack } from '@/components/partidos/avatar-stack';
import { UserAvatar } from '@/components/user-avatar';
import { cn } from '@/lib/utils';
import type { PublicUser } from '@/types/partido';

const LOW_SPOTS = 2;
const EMPTY_MESSAGE = 'Todavía no se anotó nadie';

type PartidoPlayersProps = {
  organizador: PublicUser;
  participantes: PublicUser[];
  anotados: number;
  cupo: number;
};

export function PartidoPlayers({
  organizador,
  participantes,
  anotados,
  cupo,
}: PartidoPlayersProps) {
  const libres = Math.max(0, cupo - anotados);

  return (
    <section className="flex flex-col gap-4 rounded-md bg-glass p-5 shadow-bevel-lit lg:rounded-lg">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-overline text-ink-46 uppercase">Quién juega</h2>

        <span
          className={cn(
            'text-callout font-bold',
            libres <= LOW_SPOTS ? 'text-danger' : 'text-brand'
          )}
        >
          {anotados}/{cupo}
        </span>
      </header>

      <div className="lg:hidden">
        {participantes.length ? (
          <AvatarStack usuarios={participantes} />
        ) : (
          <p className="text-callout text-ink-46">{EMPTY_MESSAGE}</p>
        )}
      </div>

      <ul className="hidden flex-col gap-3 lg:flex">
        <li className="flex items-center gap-3">
          <UserAvatar
            name={organizador.nombre}
            photoUrl={organizador.fotoUrl}
            sizes="36px"
            className="size-9"
            initialsClassName="text-caption"
          />
          <span className="flex-1 text-callout text-white">{organizador.nombre}</span>
          <span className="text-caption text-ink-46">Organiza</span>
        </li>

        {participantes.map((usuario) => (
          <li key={usuario.id} className="flex items-center gap-3">
            <UserAvatar
              name={usuario.nombre}
              photoUrl={usuario.fotoUrl}
              sizes="36px"
              className="size-9"
              initialsClassName="text-caption"
            />
            <span className="flex-1 text-callout text-white">{usuario.nombre}</span>
          </li>
        ))}

        {!participantes.length && (
          <li className="text-callout text-ink-46">{EMPTY_MESSAGE}</li>
        )}
      </ul>
    </section>
  );
}
