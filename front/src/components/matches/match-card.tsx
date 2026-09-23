'use client';

import { ChevronRight, Clock, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';

import { SportChip } from '@/components/matches/sport-chip';
import { SPORT_ICON } from '@/components/matches/sport-icon';
import { SpotsBadge } from '@/components/matches/spots-badge';
import { sportPhotoUrl } from '@/lib/sport-photo';
import { formatMatchDay, formatMatchTime } from '@/lib/match-date';
import { cn } from '@/lib/utils';
import { SPORT_LABEL, type Match } from '@/types/match';

export type MatchCardRole = 'host' | 'player';

const ROLE_LABEL: Record<MatchCardRole, string> = {
  host: 'Organizás',
  player: 'Confirmado',
};

const ROLE_CHIP: Record<MatchCardRole, string> = {
  host: 'bg-brand text-brand-ink',
  player: 'bg-success-tint text-success',
};

const PENDING_REQUEST_CHIP = 'bg-warning-tint text-warning';

const CHIP = 'rounded-full px-3 py-1 text-caption font-semibold';

type MatchCardProps = {
  match: Match;
  role: MatchCardRole;
  panel?: ReactNode;
  action?: ReactNode;
};

export function MatchCard({ match, role, panel, action }: MatchCardProps) {
  const [photoFailed, setPhotoFailed] = useState(false);

  const Icon = SPORT_ICON[match.sport.name];
  const photo = sportPhotoUrl(match.sport.name, match.id);
  const freeSpots = Math.max(0, match.capacity - match.joinedCount);
  const sport = SPORT_LABEL[match.sport.name];
  const pendingRequest = role === 'player' && match.myJoinRequest === 'PENDING';
  const roleLabel = pendingRequest ? 'Pendiente' : ROLE_LABEL[role];
  const roleChip = pendingRequest ? PENDING_REQUEST_CHIP : ROLE_CHIP[role];

  return (
    <article className="relative overflow-hidden rounded-lg bg-glass shadow-bevel-lit transition active:scale-[var(--press-scale-card)] lg:rounded-md">
      <Link
        href={`/partidos/${match.id}`}
        aria-label={`Ver el partido de ${sport} en ${match.location}`}
        className="absolute inset-0 z-[1]"
      />

      <div className="lg:flex lg:min-h-[126px] lg:items-stretch">
        <div
          className={cn(
            'relative shrink-0 overflow-hidden bg-sunken lg:aspect-auto lg:w-[132px]',
            role === 'host' ? 'aspect-video' : 'aspect-[16/11]'
          )}
        >
          {photo && !photoFailed ? (
            <Image
              src={photo}
              alt=""
              fill
              sizes="(min-width: 1024px) 132px, 100vw"
              onError={() => setPhotoFailed(true)}
              className="object-cover"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center">
              <Icon className="size-16 text-ink-16" aria-hidden="true" />
            </span>
          )}

          <span className="absolute inset-0 bg-linear-to-t from-scrim-strong via-scrim-soft to-transparent lg:hidden" />

          <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-2 lg:hidden">
            <span className="flex flex-wrap gap-2">
              <SportChip name={match.sport.name} />
              <span className={cn(CHIP, roleChip)}>{roleLabel}</span>
            </span>

            {role === 'player' && <SpotsBadge freeSpots={freeSpots} onPhoto />}
          </div>

          <h3 className="absolute inset-x-4 bottom-4 truncate text-subhead text-white lg:hidden">
            {match.location}
          </h3>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 lg:justify-center lg:gap-2">
          <div className="hidden shrink-0 items-center justify-between gap-3 lg:flex">
            <span className="text-overline text-ink-46 uppercase">{sport}</span>

            {role === 'player' && <SpotsBadge freeSpots={freeSpots} />}
          </div>

          <h3 className="hidden shrink-0 truncate text-subhead text-white lg:block">
            {match.location}
          </h3>

          <div className="flex min-w-0 items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex shrink-0 items-center gap-2 text-callout text-ink-64">
                <Clock className="size-4 shrink-0 text-brand" aria-hidden="true" />
                {formatMatchDay(match.date)} · {formatMatchTime(match.date)}
              </span>

              <span className="flex min-w-0 shrink items-center gap-2 text-callout text-ink-64">
                <MapPin className="size-4 shrink-0 text-brand" aria-hidden="true" />
                <span className="truncate">{match.location}</span>
              </span>
            </span>

            {role === 'player' && (
              <span
                aria-hidden="true"
                className="flex shrink-0 items-center gap-1 text-callout font-semibold text-brand lg:hidden"
              >
                Ver más
                <ChevronRight className="size-4" />
              </span>
            )}
          </div>
        </div>
      </div>

      {panel && (
        <div className="relative z-10 border-t border-glass-strong p-4">{panel}</div>
      )}

      {action && (
        <div
          className={cn(
            'relative z-10 border-t border-glass-strong px-4',
            role === 'host' ? 'py-2' : 'py-4'
          )}
        >
          {action}
        </div>
      )}
    </article>
  );
}
