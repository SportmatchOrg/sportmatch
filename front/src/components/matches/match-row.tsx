'use client';

import { Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { SPORT_ICON } from '@/components/matches/sport-icon';
import { SpotsBadge } from '@/components/matches/spots-badge';
import { sportPhotoUrl } from '@/lib/sport-photo';
import { formatMatchDay, formatMatchTime } from '@/lib/match-date';
import { cn } from '@/lib/utils';
import { SPORT_LABEL, LEVEL_LABEL, type Match } from '@/types/match';

const CARD =
  'flex h-[100px] gap-[14px] overflow-hidden rounded-md border border-glass-strong bg-glass shadow-bevel backdrop-blur-card transition hover:bg-glass-strong active:scale-[var(--press-scale-card)]';

const CARD_TILE = 'lg:h-[300px] lg:flex-col lg:gap-0 lg:rounded-lg lg:shadow-card-glass';

const TITLE = 'truncate text-subhead text-white';

const META = 'flex items-center gap-2 text-caption text-ink-64';

const RATING_CHIP =
  'shrink-0 rounded-full bg-warning-tint px-2 py-0.5 text-overline text-warning uppercase';

type MatchRowProps = {
  match: Match;
  layout?: 'responsive' | 'row';
};

export function MatchRow({ match, layout = 'responsive' }: MatchRowProps) {
  const [photoFailed, setPhotoFailed] = useState(false);

  const tile = layout === 'responsive';
  const Icon = SPORT_ICON[match.sport.name];
  const photo = sportPhotoUrl(match.sport.name, match.id);
  const freeSpots = Math.max(0, match.capacity - match.joinedCount);
  const played = new Date(match.date) < new Date();
  const sport = SPORT_LABEL[match.sport.name];

  return (
    <Link href={`/partidos/${match.id}`} className={cn(CARD, tile && CARD_TILE)}>
      <span
        className={cn(
          'relative h-full w-24 shrink-0 overflow-hidden bg-sunken',
          tile && 'lg:h-[180px] lg:w-full'
        )}
      >
        {photo && !photoFailed ? (
          <Image
            src={photo}
            alt=""
            fill
            sizes={tile ? '(min-width: 1024px) 332px, 96px' : '96px'}
            onError={() => setPhotoFailed(true)}
            className="object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center">
            <Icon className={cn('size-10 text-ink-16', tile && 'lg:size-16')} aria-hidden="true" />
          </span>
        )}

        {tile && (
          <>
            <span className="absolute inset-0 hidden bg-linear-to-t from-scrim-strong via-scrim-soft to-transparent lg:block" />

            {!played && (
              <span className="absolute top-4 right-4 hidden lg:block">
                <SpotsBadge freeSpots={freeSpots} />
              </span>
            )}

            <span className="absolute inset-x-4 bottom-4 hidden items-center gap-2 lg:flex">
              <span className="truncate text-overline text-white uppercase">
                {sport} · {LEVEL_LABEL[match.level]}
              </span>
              {match.ratingPending && <span className={RATING_CHIP}>Calificar</span>}
            </span>
          </>
        )}
      </span>

      <span
        className={cn(
          'flex min-w-0 flex-1 items-center gap-3 pr-4',
          tile && 'lg:items-start lg:p-4'
        )}
      >
        <span className={cn('flex min-w-0 flex-1 flex-col gap-1', tile && 'lg:gap-1.5')}>
          <span className={cn('flex items-center gap-2', tile && 'lg:hidden')}>
            <span className="truncate text-overline text-ink-46 uppercase">{sport}</span>
            {match.ratingPending && <span className={RATING_CHIP}>Calificar</span>}
          </span>

          <span className={TITLE}>{match.location}</span>

          <span className={META}>
            <Clock className="size-4 shrink-0 text-brand" aria-hidden="true" />
            {formatMatchDay(match.date)} · {formatMatchTime(match.date)}
          </span>
        </span>

        {!played && (
          <span className={cn(tile && 'lg:hidden')}>
            <SpotsBadge freeSpots={freeSpots} />
          </span>
        )}
      </span>
    </Link>
  );
}
