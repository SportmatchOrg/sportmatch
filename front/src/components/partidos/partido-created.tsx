'use client';

import { CalendarCheck, MapPin, Users } from 'lucide-react';

import { DEPORTE_LABEL, NIVEL_LABEL, type Deporte, type Partido } from '@/types/partido';

const DATE_FORMAT = new Intl.DateTimeFormat('es-AR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});

type PartidoCreatedProps = {
  partido: Partido;
  deportes: Deporte[];
  onCreateAnother: () => void;
};

export function PartidoCreated({ partido, deportes, onCreateAnother }: PartidoCreatedProps) {
  const deporte = deportes.find((candidato) => candidato.id === partido.deporteId);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-title">¡Partido creado!</h1>
        <p className="text-body text-white/46">Ya pueden sumarse otros jugadores.</p>
      </div>

      <dl className="flex flex-col gap-4 rounded-[20px] bg-glass p-5 shadow-bevel">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-caption text-white/46">Deporte</dt>
          <dd className="text-body text-white">
            {deporte ? DEPORTE_LABEL[deporte.nombre] : '—'} · {NIVEL_LABEL[partido.nivel]}
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-4">
          <dt className="flex items-center gap-1.5 text-caption text-white/46">
            <CalendarCheck className="size-4 shrink-0" aria-hidden="true" />
            Cuándo
          </dt>
          <dd className="text-right text-body text-white">
            {DATE_FORMAT.format(new Date(partido.fecha))}
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-4">
          <dt className="flex items-center gap-1.5 text-caption text-white/46">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            Dónde
          </dt>
          <dd className="text-right text-body text-white">{partido.ubicacion}</dd>
        </div>

        <div className="flex items-baseline justify-between gap-4">
          <dt className="flex items-center gap-1.5 text-caption text-white/46">
            <Users className="size-4 shrink-0" aria-hidden="true" />
            Cupo
          </dt>
          <dd className="text-body text-white">{partido.cupo} jugadores</dd>
        </div>

        {partido.descripcion && (
          <div className="flex flex-col gap-1 border-t border-glass-strong pt-4">
            <dt className="text-caption text-white/46">Descripción</dt>
            <dd className="text-body text-white">{partido.descripcion}</dd>
          </div>
        )}
      </dl>

      <button
        type="button"
        onClick={onCreateAnother}
        className="rounded-full bg-brand px-6 py-3 text-callout text-midnight transition hover:bg-brand-bright"
      >
        Crear otro
      </button>
    </section>
  );
}
