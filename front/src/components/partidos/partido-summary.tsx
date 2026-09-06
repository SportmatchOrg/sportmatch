'use client';

import { Calendar, MapPin, Type, Users } from 'lucide-react';
import Image from 'next/image';
import { useState, type ComponentType, type SVGProps } from 'react';

import { DEPORTE_ICON } from '@/components/partidos/deporte-icon';
import { UserAvatar } from '@/components/user-avatar';
import { deportePhotoUrl } from '@/lib/deporte-photo';
import { formatMatchDay, formatMatchTime } from '@/lib/match-date';
import type { PartidoForm } from '@/lib/partido-form';
import { DEPORTE_LABEL, NIVEL_LABEL, type Deporte } from '@/types/partido';

const CHIP =
  'w-fit rounded-full bg-glass-solid px-3 py-1 text-caption font-semibold text-white shadow-bevel backdrop-blur-chip';

const ROW = 'flex items-center gap-3 rounded-md bg-glass px-4 py-3 shadow-bevel-lit';

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
}) {
  return (
    <div className={ROW}>
      <Icon className="size-[18px] shrink-0 text-brand" aria-hidden="true" />

      <span className="flex min-w-0 flex-1 items-baseline justify-between gap-4">
        <span className="text-caption text-ink-46">{label}</span>
        <span className="truncate text-callout font-bold text-white">{value}</span>
      </span>
    </div>
  );
}

type Anfitrion = {
  nombre: string;
  fotoUrl: string | null;
};

type PartidoSummaryProps = {
  form: PartidoForm;
  deporte?: Deporte;
  organizador: Anfitrion | null;
};

export function PartidoSummary({ form, deporte, organizador }: PartidoSummaryProps) {
  const [photoFailed, setPhotoFailed] = useState(false);

  const photo = deporte ? deportePhotoUrl(deporte.nombre, form.ubicacion) : null;
  const Icon = deporte ? DEPORTE_ICON[deporte.nombre] : null;
  const deporteLabel = deporte ? DEPORTE_LABEL[deporte.nombre] : '—';
  const nivelLabel = form.nivel ? NIVEL_LABEL[form.nivel] : '—';

  return (
    <section className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-4">
      <div className="relative h-[180px] overflow-hidden rounded-lg bg-sunken lg:h-auto lg:min-h-[280px]">
        {photo && !photoFailed ? (
          <Image
            src={photo}
            alt=""
            fill
            sizes="(min-width: 1024px) 480px, 100vw"
            onError={() => setPhotoFailed(true)}
            className="object-cover"
          />
        ) : (
          Icon && (
            <span className="absolute inset-0 flex items-center justify-center">
              <Icon className="size-20 text-ink-16" aria-hidden="true" />
            </span>
          )
        )}

        <span className="absolute inset-0 bg-linear-to-t from-scrim-strong via-scrim-soft to-transparent" />

        <div className="absolute inset-x-4 bottom-4 flex flex-col gap-2">
          <span className={CHIP}>{deporteLabel}</span>

          <h2 className="text-headline font-bold text-white">
            {form.titulo.trim() || `${deporteLabel} · ${nivelLabel}`}
          </h2>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {form.titulo.trim() && <SummaryRow icon={Type} label="Título" value={form.titulo} />}

        <SummaryRow icon={MapPin} label="Lugar" value={form.ubicacion} />

        <SummaryRow
          icon={Calendar}
          label="Cuándo"
          value={form.fecha ? `${formatMatchDay(form.fecha)} · ${formatMatchTime(form.fecha)}` : '—'}
        />

        <SummaryRow icon={Users} label="Jugadores" value={`${form.cupo} · ${nivelLabel}`} />

        <div className={ROW}>
          {organizador && (
            <UserAvatar
              name={organizador.nombre}
              photoUrl={organizador.fotoUrl}
              sizes="40px"
              className="size-10"
              initialsClassName="text-caption"
            />
          )}

          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-overline text-ink-46 uppercase">Anfitrión</span>
            <span className="truncate text-callout font-bold text-white">
              {organizador ? `Vos · ${organizador.nombre}` : '—'}
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}
