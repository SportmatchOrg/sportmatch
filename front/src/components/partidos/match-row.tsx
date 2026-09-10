'use client';

import { Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { DEPORTE_ICON } from '@/components/partidos/deporte-icon';
import { SpotsBadge } from '@/components/partidos/spots-badge';
import { deportePhotoUrl } from '@/lib/deporte-photo';
import { formatMatchDay, formatMatchTime } from '@/lib/match-date';
import { DEPORTE_LABEL, NIVEL_LABEL, type Partido } from '@/types/partido';

const CARD =
  'flex h-[100px] gap-[14px] overflow-hidden rounded-md bg-glass shadow-bevel backdrop-blur-card transition hover:bg-glass-strong active:scale-[var(--press-scale-card)] lg:h-[300px] lg:flex-col lg:gap-0 lg:rounded-lg lg:shadow-card-glass';

const TITLE = 'truncate text-subhead text-white';

const META = 'flex items-center gap-2 text-caption text-ink-64';

export function MatchRow({ partido }: { partido: Partido }) {
  const [photoFailed, setPhotoFailed] = useState(false);

  const Icon = DEPORTE_ICON[partido.deporte.nombre];
  const photo = deportePhotoUrl(partido.deporte.nombre, partido.id);
  const libres = Math.max(0, partido.cupo - partido.anotados);
  const deporte = DEPORTE_LABEL[partido.deporte.nombre];

  return (
    <Link href={`/partidos/${partido.id}`} className={CARD}>
      <span className="relative h-full w-24 shrink-0 overflow-hidden bg-sunken lg:h-[180px] lg:w-full">
        {photo && !photoFailed ? (
          <Image
            src={photo}
            alt=""
            fill
            sizes="(min-width: 1024px) 332px, 96px"
            onError={() => setPhotoFailed(true)}
            className="object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center">
            <Icon className="size-10 text-ink-16 lg:size-16" aria-hidden="true" />
          </span>
        )}

        <span className="absolute inset-0 hidden bg-linear-to-t from-scrim-strong via-scrim-soft to-transparent lg:block" />

        <span className="absolute top-4 right-4 hidden lg:block">
          <SpotsBadge libres={libres} />
        </span>

        <span className="absolute inset-x-4 bottom-4 hidden truncate text-overline text-white uppercase lg:block">
          {deporte} · {NIVEL_LABEL[partido.nivel]}
        </span>
      </span>

      <span className="flex min-w-0 flex-1 items-center gap-3 pr-4 lg:items-start lg:p-4">
        <span className="flex min-w-0 flex-1 flex-col gap-1 lg:gap-1.5">
          <span className="text-overline text-ink-46 uppercase lg:hidden">{deporte}</span>

          <span className={TITLE}>{partido.ubicacion}</span>

          <span className={META}>
            <Clock className="size-4 shrink-0 text-brand" aria-hidden="true" />
            {formatMatchDay(partido.fecha)} · {formatMatchTime(partido.fecha)}
          </span>
        </span>

        <span className="lg:hidden">
          <SpotsBadge libres={libres} />
        </span>
      </span>
    </Link>
  );
}
