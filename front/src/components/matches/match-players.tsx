import { Flag } from 'lucide-react';
import Link from 'next/link';

import { AvatarStack } from '@/components/matches/avatar-stack';
import { ReportDialog } from '@/components/reports/report-dialog';
import { UserAvatar } from '@/components/user-avatar';
import { cn } from '@/lib/utils';
import type { PublicUser } from '@/types/match';

const LOW_SPOTS = 2;

const REPORT_BUTTON =
  'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-caption font-semibold text-ink-64 transition outline-none hover:bg-glass hover:text-white focus-visible:ring-2 focus-visible:ring-brand';

const PLAYER_LINK =
  'flex min-w-0 flex-1 items-center gap-3 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-brand';

type MatchPlayersProps = {
  participants: PublicUser[];
  organizer: PublicUser;
  joinedCount: number;
  capacity: number;
  played?: boolean;
  report?: { matchId: string; currentUserId: string };
};

function playerRole(user: PublicUser, organizerId: string, currentUserId: string): string | null {
  if (user.id === currentUserId) return 'Vos';
  if (user.id === organizerId) return 'Organizó';

  return null;
}

export function MatchPlayers({
  participants,
  organizer,
  joinedCount,
  capacity,
  played = false,
  report,
}: MatchPlayersProps) {
  const freeSpots = Math.max(0, capacity - joinedCount);
  const low = freeSpots <= LOW_SPOTS;
  const users = [
    organizer,
    ...participants.filter(({ id }) => id !== organizer.id),
  ];

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

      {report ? (
        <ul className="flex flex-col gap-3">
          {users.map((user) => {
            const role = playerRole(user, organizer.id, report.currentUserId);

            return (
              <li key={user.id} className="flex items-center gap-3">
                <Link href={`/usuarios/${user.id}`} className={PLAYER_LINK}>
                  <UserAvatar
                    name={user.name}
                    photoUrl={user.photoUrl}
                    sizes="44px"
                    className="size-11"
                    initialsClassName="text-caption"
                  />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-callout font-semibold text-white">
                      {user.name}
                    </span>
                    {role && <span className="text-caption text-ink-46">{role}</span>}
                  </span>
                </Link>

                {user.id !== report.currentUserId && (
                  <ReportDialog
                    reportedUser={user}
                    matchId={report.matchId}
                    trigger={
                      <button
                        type="button"
                        aria-label={`Reportar a ${user.name}`}
                        className={REPORT_BUTTON}
                      >
                        <Flag className="size-4" aria-hidden="true" />
                        Reportar
                      </button>
                    }
                  />
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <AvatarStack users={users} />
      )}
    </section>
  );
}
