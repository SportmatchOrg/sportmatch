'use client';

import { Calendar, ChevronRight, MapPin, Trophy, Type, Users } from 'lucide-react';
import Image from 'next/image';
import { useState, type ComponentType, type SVGProps } from 'react';

import { SPORT_ICON } from '@/components/matches/sport-icon';
import { UserAvatar } from '@/components/user-avatar';
import { sportPhotoUrl } from '@/lib/sport-photo';
import { formatMatchDay, formatMatchTime } from '@/lib/match-date';
import type { MatchForm } from '@/lib/match-form';
import { stepOfField } from '@/lib/match-wizard';
import { cn } from '@/lib/utils';
import { SPORT_LABEL, LEVEL_LABEL, type Sport } from '@/types/match';

const CHIP =
  'w-fit rounded-full bg-glass-solid px-3 py-1 text-caption font-semibold text-white shadow-bevel backdrop-blur-chip';

const ROW = 'flex items-center gap-3 rounded-md bg-glass px-4 py-3 shadow-bevel-lit';

const MISSING_ROW =
  'w-full text-left shadow-[inset_0_0_0_1px_var(--color-warning)] transition hover:bg-glass-strong';

const MISSING = 'Falta completar';

type SummaryRowProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  missing?: boolean;
  onEdit?: () => void;
};

function SummaryRow({ icon: Icon, label, value, missing = false, onEdit }: SummaryRowProps) {
  const content = (
    <>
      <Icon
        className={cn('size-[18px] shrink-0', missing ? 'text-warning' : 'text-brand')}
        aria-hidden="true"
      />

      <span className="flex min-w-0 flex-1 items-baseline justify-between gap-4">
        <span className="text-caption text-ink-46">{label}</span>
        <span
          className={cn('truncate text-callout font-bold', missing ? 'text-warning' : 'text-white')}
        >
          {missing ? MISSING : value}
        </span>
      </span>
    </>
  );

  if (!missing) return <div className={ROW}>{content}</div>;

  return (
    <button type="button" onClick={onEdit} className={cn(ROW, MISSING_ROW)}>
      {content}
      <ChevronRight className="size-[18px] shrink-0 text-ink-46" aria-hidden="true" />
    </button>
  );
}

type Host = {
  name: string;
  photoUrl: string | null;
};

type MatchSummaryProps = {
  form: MatchForm;
  sport?: Sport;
  organizer: Host | null;
  incompleteSteps?: number[];
  onEdit?: (step: number) => void;
};

export function MatchSummary({
  form,
  sport,
  organizer,
                               incompleteSteps = [],
  onEdit,
}: MatchSummaryProps) {
  const [photoFailed, setPhotoFailed] = useState(false);

  function missingProps(field: keyof MatchForm) {
    const step = stepOfField(field);

    return { missing: incompleteSteps.includes(step), onEdit: () => onEdit?.(step) };
  }

  const photo = sport ? sportPhotoUrl(sport.name, form.location) : null;
  const Icon = sport ? SPORT_ICON[sport.name] : null;
  const deporteLabel = sport ? SPORT_LABEL[sport.name] : '—';
  const nivelLabel = form.level ? LEVEL_LABEL[form.level] : '—';

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
            {form.title.trim() || `${deporteLabel} · ${nivelLabel}`}
          </h2>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {incompleteSteps.includes(stepOfField('sportId')) && (
          <SummaryRow icon={Trophy} label="Deporte" value={deporteLabel} {...missingProps('sportId')} />
        )}

        {form.title.trim() && <SummaryRow icon={Type} label="Título" value={form.title} />}

        <SummaryRow
          icon={MapPin}
          label="Lugar"
          value={form.location}
          {...missingProps('location')}
        />

        <SummaryRow
          icon={Calendar}
          label="Cuándo"
          value={form.date ? `${formatMatchDay(form.date)} · ${formatMatchTime(form.date)}` : '—'}
          {...missingProps('date')}
        />

        <SummaryRow
          icon={Users}
          label="Jugadores"
          value={`${form.capacity} · ${nivelLabel}`}
          {...missingProps('level')}
        />

        <div className={ROW}>
          {organizer && (
            <UserAvatar
              name={organizer.name}
              photoUrl={organizer.photoUrl}
              sizes="40px"
              className="size-10"
              initialsClassName="text-caption"
            />
          )}

          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-overline text-ink-46 uppercase">Anfitrión</span>
            <span className="truncate text-callout font-bold text-white">
              {organizer ? `Vos · ${organizer.name}` : '—'}
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}
