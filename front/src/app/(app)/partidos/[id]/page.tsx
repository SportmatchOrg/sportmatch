'use client';

import { Calendar, ChevronLeft, Clock, MapPin, Search, SignalHigh, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useState, type ComponentType, type SVGProps } from 'react';

import { DEPORTE_ICON } from '@/components/partidos/deporte-icon';
import { PartidoActions } from '@/components/partidos/partido-actions';
import { PartidoPlayers } from '@/components/partidos/partido-players';
import { LoadingScreen } from '@/components/loading-screen';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { UserAvatar } from '@/components/user-avatar';
import { usePartido } from '@/hooks/use-partido';
import { useCurrentUser } from '@/hooks/use-current-user';
import { deportePhotoUrl } from '@/lib/deporte-photo';
import { formatMatchDay, formatMatchTime } from '@/lib/match-date';
import { cn } from '@/lib/utils';
import { DEPORTE_LABEL, NIVEL_LABEL, type PartidoDetalle } from '@/types/partido';

const CHIP =
  'rounded-full bg-glass-solid px-4 py-2 text-caption font-semibold text-white shadow-bevel backdrop-blur-chip';

const PLAIN_ON_DESKTOP =
  'lg:bg-transparent lg:px-0 lg:py-0 lg:text-headline lg:font-bold lg:shadow-none lg:backdrop-blur-none';

function MetaTile({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md bg-glass p-3 shadow-bevel-lit">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-glass-strong text-brand">
        <Icon className="size-[18px]" aria-hidden="true" />
      </span>

      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-overline text-ink-46 uppercase">{label}</span>
        <span className="text-callout font-bold text-white">{value}</span>
      </span>
    </div>
  );
}

function PartidoTitle({ partido }: { partido: PartidoDetalle }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-title font-bold text-white">{partido.ubicacion}</h1>
      <span className="flex items-center gap-2 text-callout text-ink-64">
        <MapPin className="size-4" aria-hidden="true" />
        {DEPORTE_LABEL[partido.deporte.nombre]} · {NIVEL_LABEL[partido.nivel]}
      </span>
    </div>
  );
}

export default function PartidoDetallePage({ params }: PageProps<'/partidos/[id]'>) {
  const { id } = use(params);
  const router = useRouter();
  const { partido, loading, notFound, error, reload } = usePartido(id);
  const { user } = useCurrentUser();
  const [photoFailed, setPhotoFailed] = useState(false);

  if (loading) {
    return <LoadingScreen />;
  }

  if (notFound || !partido) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-8">
        <EmptyState
          icon={Search}
          title={notFound ? 'No encontramos este partido' : 'No pudimos cargar el partido'}
          text={
            notFound
              ? 'Puede que se haya cancelado o que el link esté mal.'
              : (error ?? 'Probá de nuevo en un momento.')
          }
          action={
            <Link
              href="/buscar"
              className="rounded-full bg-brand px-6 py-3 text-callout font-semibold text-brand-ink"
            >
              Ver otros partidos
            </Link>
          }
        />
      </main>
    );
  }

  const Icon = DEPORTE_ICON[partido.deporte.nombre];
  const photo = deportePhotoUrl(partido.deporte.nombre, partido.id);
  const libres = Math.max(0, partido.cupo - partido.anotados);
  const isOrganizer = user?.id === partido.organizador.id;

  return (
    <main className="pb-44 lg:pb-10">
      <div className="flex justify-center lg:px-8 lg:pt-6">
        <div className="grid w-full max-w-[1400px] gap-6 lg:grid-cols-[1fr_380px]">
          <div className="flex flex-col gap-6">
            <div className="relative h-[42vh] min-h-[280px] w-full overflow-hidden bg-sunken lg:h-[460px] lg:rounded-lg">
              {!photo || photoFailed ? (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Icon className="size-32 text-ink-16" aria-hidden="true" />
                </span>
              ) : (
                <Image
                  src={photo}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 960px, 100vw"
                  priority
                  onError={() => setPhotoFailed(true)}
                  className="object-cover"
                />
              )}

              <span className="absolute inset-0 bg-linear-to-t from-scrim via-scrim-soft to-transparent" />

              <span className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-base via-base/70 to-transparent lg:hidden" />

              <button
                type="button"
                aria-label="Volver"
                onClick={() => router.back()}
                className="absolute top-5 left-5 flex size-11 items-center justify-center rounded-full bg-glass-solid text-white shadow-bevel backdrop-blur-chip transition hover:bg-glass-strong"
              >
                <ChevronLeft className="size-6" aria-hidden="true" />
              </button>

              <div className="absolute inset-x-5 bottom-5 flex flex-col gap-4 lg:inset-x-8 lg:bottom-8">
                <div className="flex flex-wrap items-center gap-3 lg:gap-6">
                  <span className={cn(CHIP, PLAIN_ON_DESKTOP)}>
                    {DEPORTE_LABEL[partido.deporte.nombre]}
                  </span>

                  <span className={cn('flex items-center gap-2', CHIP, PLAIN_ON_DESKTOP)}>
                    <SignalHigh className="size-4 lg:hidden" aria-hidden="true" />
                    {NIVEL_LABEL[partido.nivel]}
                  </span>

                  <span className="flex items-center gap-2 rounded-full bg-success-tint px-4 py-2 text-caption font-semibold text-success ring-1 ring-success/40 backdrop-blur-chip lg:text-callout">
                    <span className="size-2 rounded-full bg-success" aria-hidden="true" />
                    {libres === 1 ? '1 lugar' : `${libres} lugares`}
                  </span>
                </div>

                <h1 className="hidden text-display font-extrabold text-white lg:block">
                  {partido.ubicacion}
                </h1>
              </div>
            </div>

            <div className="px-5 lg:hidden">
              <PartidoTitle partido={partido} />
            </div>

            <div className="grid grid-cols-2 gap-3 px-5 lg:grid-cols-4 lg:px-0">
              <MetaTile icon={Calendar} label="Día" value={formatMatchDay(partido.fecha)} />
              <MetaTile icon={Clock} label="Hora" value={formatMatchTime(partido.fecha)} />
              <MetaTile
                icon={Users}
                label="Jugadores"
                value={`${partido.anotados}/${partido.cupo}`}
              />
              <MetaTile icon={SignalHigh} label="Nivel" value={NIVEL_LABEL[partido.nivel]} />
            </div>

            {partido.descripcion && (
              <div className="flex flex-col gap-3 px-5 lg:px-0">
                <h2 className="text-overline text-ink-46 uppercase">Sobre el partido</h2>
                <p className="text-body text-ink-64">{partido.descripcion}</p>
              </div>
            )}
          </div>

          <aside className="flex flex-col gap-4 px-5 lg:px-0">
            <div className="flex items-center gap-4 rounded-md bg-glass p-4 shadow-bevel-lit lg:rounded-lg">
              <UserAvatar
                name={partido.organizador.nombre}
                photoUrl={partido.organizador.fotoUrl}
                sizes="56px"
                className="size-14 ring-2 ring-brand"
                initialsClassName="text-callout"
              />

              <span className="flex flex-1 flex-col gap-0.5">
                <span className="text-overline text-ink-46 uppercase">Organiza</span>
                <span className="text-headline font-bold text-white">
                  {partido.organizador.nombre}
                </span>
              </span>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger
                    type="button"
                    aria-disabled="true"
                    className="shrink-0 rounded-full bg-glass-strong px-5 py-3 text-callout font-semibold text-white shadow-bevel-lit aria-disabled:cursor-not-allowed"
                  >
                    Ver perfil
                  </TooltipTrigger>
                  <TooltipContent>Próximamente</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <PartidoPlayers
              organizador={partido.organizador}
              participantes={partido.participantes}
              anotados={partido.anotados}
              cupo={partido.cupo}
            />

            <div className="hidden lg:block">
              <PartidoActions partido={partido} isOrganizer={isOrganizer} onDone={reload} />
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 bg-linear-to-t from-base from-55% to-transparent px-5 pt-8 pb-28 lg:hidden">
        <PartidoActions partido={partido} isOrganizer={isOrganizer} onDone={reload} />
      </div>
    </main>
  );
}
