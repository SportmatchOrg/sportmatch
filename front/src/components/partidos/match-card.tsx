'use client';

import { Calendar, ChevronRight, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';

import { DEPORTE_ICON } from '@/components/partidos/deporte-icon';
import { deportePhotoUrl } from '@/lib/deporte-photo';
import { formatMatchDay, formatMatchTime } from '@/lib/match-date';
import { cn } from '@/lib/utils';
import { DEPORTE_LABEL, type Partido } from '@/types/partido';

const LOW_SPOTS = 2;

export type MatchCardRole = 'host' | 'player';

const ROLE_LABEL: Record<MatchCardRole, string> = {
  host: 'Organizás',
  player: 'Confirmado',
};

const ROLE_CHIP: Record<MatchCardRole, string> = {
  host: 'bg-brand text-brand-ink',
  player: 'bg-success-tint text-success',
};

const CHIP = 'rounded-full px-3 py-1 text-caption font-semibold';

const GLASS_CHIP = 'bg-glass-solid text-white shadow-bevel backdrop-blur-chip';

function SpotsBadge({ libres, onPhoto = false }: { libres: number; onPhoto?: boolean }) {
  const low = libres <= LOW_SPOTS;

  const fill = onPhoto
    ? 'bg-glass-solid shadow-bevel backdrop-blur-chip'
    : low
      ? 'bg-danger-tint'
      : 'bg-success-tint';

  return (
    <span
      className={cn(
        'flex shrink-0 items-center gap-2',
        CHIP,
        fill,
        low ? 'text-danger' : 'text-success'
      )}
    >
      <span
        className={cn('size-2 rounded-full', low ? 'bg-danger' : 'bg-success')}
        aria-hidden="true"
      />
      {libres === 1 ? '1 lugar' : `${libres} lugares`}
    </span>
  );
}

type MatchCardProps = {
  partido: Partido;
  role: MatchCardRole;
  action?: ReactNode;
};

export function MatchCard({ partido, role, action }: MatchCardProps) {
  const [photoFailed, setPhotoFailed] = useState(false);

  const Icon = DEPORTE_ICON[partido.deporte.nombre];
  const photo = deportePhotoUrl(partido.deporte.nombre, partido.id);
  const libres = Math.max(0, partido.cupo - partido.anotados);
  const deporte = DEPORTE_LABEL[partido.deporte.nombre];

  return (
    <article className="relative overflow-hidden rounded-lg bg-glass shadow-bevel-lit transition active:scale-[var(--press-scale-card)] lg:flex lg:items-stretch">
      <Link
        href={`/partidos/${partido.id}`}
        aria-label={`Ver el partido de ${deporte} en ${partido.ubicacion}`}
        className="absolute inset-0 z-[1]"
      />

      <div className="relative aspect-[16/11] shrink-0 overflow-hidden bg-sunken lg:aspect-auto lg:w-[190px]">
        {photo && !photoFailed ? (
          <Image
            src={photo}
            alt=""
            fill
            sizes="(min-width: 1024px) 190px, 100vw"
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
            <span className={cn(CHIP, GLASS_CHIP)}>{deporte}</span>
            <span className={cn(CHIP, ROLE_CHIP[role])}>{ROLE_LABEL[role]}</span>
          </span>

          <SpotsBadge libres={libres} onPhoto />
        </div>

        <h3 className="absolute inset-x-4 bottom-4 text-headline font-bold text-white lg:hidden">
          {partido.ubicacion}
        </h3>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 lg:justify-center lg:p-5">
        <div className="hidden items-center justify-between gap-3 lg:flex">
          <span className="flex items-center gap-3">
            <span className="text-overline text-ink-46 uppercase">{deporte}</span>
            <span className={cn(CHIP, ROLE_CHIP[role])}>{ROLE_LABEL[role]}</span>
          </span>

          <SpotsBadge libres={libres} />
        </div>

        <h3 className="hidden truncate text-headline font-bold text-white lg:block">
          {partido.ubicacion}
        </h3>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex shrink-0 items-center gap-2 text-callout text-ink-64">
                <Calendar className="size-4 shrink-0 text-brand" aria-hidden="true" />
                {formatMatchDay(partido.fecha)} · {formatMatchTime(partido.fecha)}
              </span>

              <span className="flex min-w-0 shrink items-center gap-2 text-callout text-ink-64">
                <MapPin className="size-4 shrink-0 text-brand" aria-hidden="true" />
                <span className="truncate">{partido.ubicacion}</span>
              </span>

            </span>

            <span
              aria-hidden="true"
              className="flex shrink-0 items-center gap-1 text-callout font-semibold text-brand lg:hidden"
            >
              Ver más
              <ChevronRight className="size-4" />
            </span>
          </div>

          {action && (
            <div className="relative z-10 border-t border-glass-strong pt-3 lg:border-0 lg:pt-0">
              {action}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
