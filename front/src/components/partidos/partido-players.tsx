import { AvatarStack } from '@/components/partidos/avatar-stack';
import { cn } from '@/lib/utils';
import type { PublicUser } from '@/types/match';

const LOW_SPOTS = 2;
const EMPTY_MESSAGE = 'Todavía no se anotó nadie';

type PartidoPlayersProps = {
  participants: PublicUser[];
  organizer: PublicUser;
  joinedCount: number;
  capacity: number;
  played?: boolean;
};

export function PartidoPlayers({
  participants,
  organizer,
  joinedCount,
  capacity,
  played = false,
}: PartidoPlayersProps) {
  const freeSpots = Math.max(0, capacity - joinedCount);
  const low = freeSpots <= LOW_SPOTS;
  const users = played
    ? [organizer, ...participants.filter(({ id }) => id !== organizer.id)]
    : participants;

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
            {freeSpots === 1 ? '1 lugar libre' : `${freeSpots} lugares libres`}
          </span>
        )}
      </header>

      {users.length ? (
        <AvatarStack users={users} />
      ) : (
        <p className="text-callout text-ink-46">{EMPTY_MESSAGE}</p>
      )}
    </section>
  );
}
