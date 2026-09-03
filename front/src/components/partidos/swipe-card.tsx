'use client';

import { Calendar, SignalHigh } from 'lucide-react';
import Image from 'next/image';
import { useState, type CSSProperties, type PointerEventHandler } from 'react';

import { DEPORTE_ICON } from '@/components/partidos/deporte-icon';
import { deportePhotoUrl } from '@/lib/deporte-photo';
import { formatMatchDay, formatMatchTime } from '@/lib/match-date';
import { cn } from '@/lib/utils';
import { DEPORTE_LABEL, NIVEL_LABEL, type Partido } from '@/types/partido';

export type SwipeDecision = 'yes' | 'no';

const DECISION_LABEL: Record<SwipeDecision, string> = {
  yes: 'Me sumo',
  no: 'Paso',
};

const DECISION_STYLE: Record<SwipeDecision, string> = {
  yes: 'left-5 -rotate-12 border-swipe-yes text-swipe-yes',
  no: 'right-5 rotate-12 border-swipe-no text-swipe-no',
};

const CHIP = 'rounded-full bg-glass-solid px-4 py-2.5 text-callout font-semibold text-white shadow-bevel backdrop-blur-chip';

function SpotsPill({ libres }: { libres: number }) {
  return (
    <span className="flex items-center gap-2 rounded-full bg-glass-solid px-3.5 py-2 text-callout font-semibold text-success shadow-bevel backdrop-blur-chip">
      <span className="size-2 rounded-full bg-success" aria-hidden="true" />
      {libres === 1 ? '1 lugar' : `${libres} lugares`}
    </span>
  );
}

type SwipeCardProps = {
  partido: Partido;
  decision: SwipeDecision | null;
  interactive: boolean;
  className?: string;
  style?: CSSProperties;
  onPointerDown?: PointerEventHandler<HTMLDivElement>;
  onPointerMove?: PointerEventHandler<HTMLDivElement>;
  onPointerUp?: PointerEventHandler<HTMLDivElement>;
  onPointerCancel?: PointerEventHandler<HTMLDivElement>;
};

export function SwipeCard({
  partido,
  decision,
  interactive,
  className,
  style,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: SwipeCardProps) {
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const Icon = DEPORTE_ICON[partido.deporte.nombre];
  const photo = deportePhotoUrl(partido.deporte.nombre, partido.id);
  const libres = Math.max(0, partido.cupo - partido.anotados);
  const deporte = DEPORTE_LABEL[partido.deporte.nombre];
  const nivel = NIVEL_LABEL[partido.nivel];

  return (
    <div
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      className={cn(
        'absolute inset-0 overflow-hidden rounded-lg bg-sunken shadow-card select-none',
        className
      )}
    >
      {!photo || failedPhoto === photo ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <Icon className="size-32 text-ink-16" aria-hidden="true" />
        </span>
      ) : (
        <Image
          src={photo}
          alt=""
          fill
          sizes="(min-width: 1024px) 470px, 100vw"
          priority={interactive}
          onError={() => setFailedPhoto(photo)}
          className="object-cover"
        />
      )}

      <span className="absolute inset-0 bg-linear-to-t from-scrim-strong via-scrim-soft to-transparent" />

      <div className="absolute inset-x-5 top-5 flex items-start justify-between gap-3 lg:items-center">
        <span className={cn('flex items-center gap-2', CHIP, 'lg:bg-transparent lg:px-0 lg:py-0 lg:shadow-none lg:backdrop-blur-none')}>
          <Icon className="size-4 lg:hidden" aria-hidden="true" />
          {deporte}
          <span className="hidden lg:inline">· {nivel}</span>
        </span>

        <span className={cn('flex items-center gap-2 lg:hidden', CHIP)}>
          <SignalHigh className="size-4" aria-hidden="true" />
          {nivel}
        </span>

        <span className="hidden lg:block">
          <SpotsPill libres={libres} />
        </span>
      </div>

      {decision && (
        <span
          className={cn(
            'absolute top-24 rounded-sm border-[3px] px-4 py-2 text-headline font-bold uppercase',
            DECISION_STYLE[decision]
          )}
        >
          {DECISION_LABEL[decision]}
        </span>
      )}

      <div
        className="absolute inset-x-4 bottom-4 flex flex-col items-start gap-4 rounded-md bg-glass-solid p-5 shadow-bevel backdrop-blur-card lg:inset-x-6 lg:bottom-6 lg:gap-3 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none"
      >
        <span className="text-title font-bold text-white">{partido.ubicacion}</span>

        <span className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 rounded-full bg-glass px-3.5 py-2 text-callout font-semibold text-ink-80 shadow-bevel lg:rounded-none lg:bg-transparent lg:px-0 lg:py-0 lg:shadow-none">
            <Calendar className="size-4 text-ink-64 lg:text-brand" aria-hidden="true" />
            {formatMatchDay(partido.fecha)} · {formatMatchTime(partido.fecha)}
          </span>

          <span className="lg:hidden">
            <SpotsPill libres={libres} />
          </span>
        </span>
      </div>
    </div>
  );
}
