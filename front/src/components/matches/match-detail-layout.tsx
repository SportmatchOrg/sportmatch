'use client';

import { Calendar, ChevronLeft, Clock, MapPin, Search, SignalHigh, Users } from 'lucide-react';
import Image from 'next/image';
import { useState, type ComponentType, type ReactNode, type SVGProps } from 'react';

import { OrganizerCard } from '@/components/matches/organizer-card';
import { SPORT_ICON } from '@/components/matches/sport-icon';
import { EmptyState } from '@/components/ui/empty-state';
import { formatPlayers } from '@/lib/match-capacity';
import { formatMatchDay, formatMatchTime } from '@/lib/match-date';
import { sportPhotoUrl } from '@/lib/sport-photo';
import { cn } from '@/lib/utils';
import { LEVEL_LABEL, SPORT_LABEL, type Level, type Sport } from '@/types/match';

const PAGE = 'flex justify-center lg:px-8 lg:pt-6';

const COLUMNS = 'grid w-full max-w-[1400px] gap-6 lg:grid-cols-[1fr_380px]';

const BOTTOM_BAR =
  'fixed inset-x-0 bottom-0 bg-linear-to-t from-base from-55% to-transparent px-5 pt-8 lg:hidden';

const CHIP =
  'rounded-full bg-glass-solid px-4 py-2 text-caption font-semibold text-white shadow-bevel backdrop-blur-chip';

const PLAIN_ON_DESKTOP =
  'lg:bg-transparent lg:px-0 lg:py-0 lg:text-headline lg:font-bold lg:shadow-none lg:backdrop-blur-none';

export const HERO_BUTTON =
  'flex size-11 items-center justify-center rounded-full bg-glass-solid text-white shadow-bevel backdrop-blur-chip transition hover:bg-glass-strong';

type MatchSummary = {
  id: string;
  photoUrl: string | null;
  sport: Sport;
  level: Level;
  location: string;
  date: string;
  joinedCount: number;
  capacity: number;
  organizer: { id?: string; name: string; photoUrl: string | null };
  description?: string | null;
};

type MatchHeroProps = {
  match: MatchSummary;
  onBack?: () => void;
  action?: ReactNode;
};

function MatchHero({ match, onBack, action }: MatchHeroProps) {
  const [photoFailed, setPhotoFailed] = useState(false);

  const Icon = SPORT_ICON[match.sport.name];
  const photo = match.photoUrl ?? sportPhotoUrl(match.sport.name, match.id);

  return (
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

      {onBack && (
        <button
          type="button"
          aria-label="Volver"
          onClick={onBack}
          className={cn('absolute top-5 left-5', HERO_BUTTON)}
        >
          <ChevronLeft className="size-6" aria-hidden="true" />
        </button>
      )}

      {action && <div className="absolute top-5 right-5">{action}</div>}

      <div className="absolute inset-x-5 bottom-5 flex flex-col gap-4 lg:inset-x-8 lg:bottom-8">
        <div className="flex flex-wrap items-center gap-3 lg:gap-6">
          <span className={cn(CHIP, PLAIN_ON_DESKTOP)}>
            {SPORT_LABEL[match.sport.name]}
          </span>

          <span className={cn('flex items-center gap-2', CHIP, PLAIN_ON_DESKTOP)}>
            <SignalHigh className="size-4 lg:hidden" aria-hidden="true" />
            {LEVEL_LABEL[match.level]}
          </span>
        </div>

        <h1 className="hidden text-display font-extrabold text-white lg:block">
          {match.location}
        </h1>
      </div>
    </div>
  );
}

function MatchTitle({ match }: { match: MatchSummary }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-title font-bold text-white">{match.location}</h1>
      <span className="flex items-center gap-2 text-callout text-ink-64">
        <MapPin className="size-4" aria-hidden="true" />
        {SPORT_LABEL[match.sport.name]} · {LEVEL_LABEL[match.level]}
      </span>
    </div>
  );
}

type MetaTileProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
};

function MetaTile({ icon: Icon, label, value }: MetaTileProps) {
  return (
    <div className="flex flex-col gap-3 rounded-md bg-glass p-4 shadow-bevel-lit lg:flex-row lg:items-center lg:p-3">
      <span className="flex shrink-0 items-center rounded-sm text-brand lg:size-10 lg:justify-center lg:bg-glass-strong">
        <Icon className="size-[18px]" aria-hidden="true" />
      </span>

      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-caption text-ink-46 lg:text-overline lg:uppercase">
          {label}
        </span>
        <span className="text-callout font-bold text-white">{value}</span>
      </span>
    </div>
  );
}

function playersLabel(players: number): string {
  return players === 1 ? '1 jugó' : `${players} jugaron`;
}

function MatchFacts({ match, played }: { match: MatchSummary; played: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-3 px-5 lg:grid-cols-4 lg:px-0">
      <MetaTile icon={Calendar} label="Fecha" value={formatMatchDay(match.date)} />
      <MetaTile icon={Clock} label="Hora" value={formatMatchTime(match.date)} />
      <MetaTile
        icon={Users}
        label="Jugadores"
        value={
          played
            ? playersLabel(match.joinedCount)
            : formatPlayers(match.joinedCount, match.capacity)
        }
      />
      <MetaTile icon={SignalHigh} label="Nivel" value={LEVEL_LABEL[match.level]} />
    </div>
  );
}

type MatchNotFoundProps = {
  notFound: boolean;
  error: string | null;
  action: ReactNode;
  className?: string;
};

export function MatchNotFound({ notFound, error, action, className }: MatchNotFoundProps) {
  return (
    <main className={cn('flex items-center justify-center px-8', className)}>
      <EmptyState
        icon={Search}
        title={notFound ? 'No encontramos este partido' : 'No pudimos cargar el partido'}
        text={
          notFound
            ? 'Puede que se haya cancelado o que el link esté mal.'
            : (error ?? 'Probá de nuevo en un momento.')
        }
        action={action}
      />
    </main>
  );
}

type MatchDetailLayoutProps = {
  match: MatchSummary;
  played: boolean;
  onBack?: () => void;
  heroAction?: ReactNode;
  aside?: ReactNode;
  bottomBar?: ReactNode;
  withTabBar?: boolean;
};

export function MatchDetailLayout({
  match,
  played,
  onBack,
  heroAction,
  aside,
  bottomBar,
  withTabBar = false,
}: MatchDetailLayoutProps) {
  return (
    <main className={cn('lg:pb-10', bottomBar ? 'pb-44' : 'pb-10')}>
      <div className={PAGE}>
        <div className={COLUMNS}>
          <div className="flex flex-col gap-6">
            <MatchHero match={match} onBack={onBack} action={heroAction} />

            <div className="px-5 lg:hidden">
              <MatchTitle match={match} />
            </div>

            <div className="px-5 lg:hidden">
              <OrganizerCard organizer={match.organizer} />
            </div>

            <MatchFacts match={match} played={played} />

            {match.description && (
              <div className="flex flex-col gap-3 px-5 lg:px-0">
                <h2 className="text-overline text-ink-46 uppercase">Sobre el partido</h2>
                <p className="text-body text-ink-64">{match.description}</p>
              </div>
            )}
          </div>

          <aside className="flex flex-col gap-4 px-5 lg:px-0">
            <div className="hidden lg:block">
              <OrganizerCard organizer={match.organizer} />
            </div>

            {aside}
          </aside>
        </div>
      </div>

      {bottomBar && (
        <div
          className={cn(
            BOTTOM_BAR,
            withTabBar ? 'pb-28' : 'pb-[max(24px,env(safe-area-inset-bottom))]'
          )}
        >
          {bottomBar}
        </div>
      )}
    </main>
  );
}
