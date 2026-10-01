"use client";

import {
  Calendar,
  CalendarCheck,
  ChevronLeft,
  Clock,
  MapPin,
  Search,
  SignalHigh,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState, type ComponentType, type SVGProps } from "react";

import { SPORT_ICON } from "@/components/matches/sport-icon";
import { OrganizerCard } from "@/components/matches/organizer-card";
import { MatchActions } from "@/components/matches/match-actions";
import { MatchPlayers } from "@/components/matches/match-players";
import { RatingSection } from "@/components/ratings/rating-section";
import { LoadingScreen } from "@/components/loading-screen";
import { EmptyState } from "@/components/ui/empty-state";
import { useMatch } from "@/hooks/use-match";
import { useCurrentUser } from "@/hooks/use-current-user";
import { sportPhotoUrl } from "@/lib/sport-photo";
import { formatMatchDay, formatMatchTime } from "@/lib/match-date";
import { cn } from "@/lib/utils";
import {
  SPORT_LABEL,
  LEVEL_LABEL,
  type MatchDetail,
} from "@/types/match";

const CHIP =
  "rounded-full bg-glass-solid px-4 py-2 text-caption font-semibold text-white shadow-bevel backdrop-blur-chip";

const PLAIN_ON_DESKTOP =
  "lg:bg-transparent lg:px-0 lg:py-0 lg:text-headline lg:font-bold lg:shadow-none lg:backdrop-blur-none";

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
  return players === 1 ? "1 jugó" : `${players} jugaron`;
}

function PartidoTitle({ match }: { match: MatchDetail }) {
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

export default function MatchDetailPage({
  params,
}: PageProps<"/partidos/[id]">) {
  const { id } = use(params);
  const router = useRouter();
  const { match, loading, notFound, error, reload } = useMatch(id);
  const { user } = useCurrentUser();
  const [photoFailed, setPhotoFailed] = useState(false);
  const [now] = useState(() => Date.now());

  if (loading) {
    return <LoadingScreen />;
  }

  if (notFound || !match) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-8">
        <EmptyState
          icon={Search}
          title={
            notFound
              ? "No encontramos este partido"
              : "No pudimos cargar el partido"
          }
          text={
            notFound
              ? "Puede que se haya cancelado o que el link esté mal."
              : (error ?? "Probá de nuevo en un momento.")
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

  const Icon = SPORT_ICON[match.sport.name];
  const photo = sportPhotoUrl(match.sport.name, match.id);
  const isOrganizer = user?.id === match.organizer.id;
  const played = new Date(match.date).getTime() <= now;

  return (
    <main className={cn("lg:pb-10", played ? "pb-10" : "pb-44")}>
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
                    {SPORT_LABEL[match.sport.name]}
                  </span>

                  <span
                    className={cn(
                      "flex items-center gap-2",
                      CHIP,
                      PLAIN_ON_DESKTOP,
                    )}
                  >
                    <SignalHigh
                      className="size-4 lg:hidden"
                      aria-hidden="true"
                    />
                    {LEVEL_LABEL[match.level]}
                  </span>
                </div>

                <h1 className="hidden text-display font-extrabold text-white lg:block">
                  {match.location}
                </h1>
              </div>
            </div>

            <div className="px-5 lg:hidden">
              <PartidoTitle match={match} />
            </div>

            <div className="px-5 lg:hidden">
              <OrganizerCard organizer={match.organizer} />
            </div>

            <div className="grid grid-cols-2 gap-3 px-5 lg:grid-cols-4 lg:px-0">
              <MetaTile
                icon={Calendar}
                label="Fecha"
                value={formatMatchDay(match.date)}
              />
              <MetaTile
                icon={Clock}
                label="Hora"
                value={formatMatchTime(match.date)}
              />
              <MetaTile
                icon={Users}
                label="Jugadores"
                value={
                  played
                    ? playersLabel(match.joinedCount + 1)
                    : `${match.joinedCount}/${match.capacity}`
                }
              />
              <MetaTile
                icon={SignalHigh}
                label="Nivel"
                value={LEVEL_LABEL[match.level]}
              />
            </div>

            {match.description && (
              <div className="flex flex-col gap-3 px-5 lg:px-0">
                <h2 className="text-overline text-ink-46 uppercase">
                  Sobre el partido
                </h2>
                <p className="text-body text-ink-64">{match.description}</p>
              </div>
            )}
          </div>

          <aside className="flex flex-col gap-4 px-5 lg:px-0">
            <div className="hidden lg:block">
              <OrganizerCard organizer={match.organizer} />
            </div>

            <MatchPlayers
              participants={match.participants}
              organizer={match.organizer}
              joinedCount={match.joinedCount}
              capacity={match.capacity}
              played={played}
            />

            {played ? (
              <div className="flex flex-col gap-4 rounded-md bg-glass p-4 shadow-bevel-lit">
                <span className="flex items-center gap-3">
                  <CalendarCheck
                    className="size-5 shrink-0 text-brand"
                    aria-hidden="true"
                  />
                  <span className="text-callout font-semibold text-white">
                    Este partido ya se jugó
                  </span>
                </span>

                <RatingSection matchId={match.id} played={played} />
              </div>
            ) : (
              <div className="hidden lg:block">
                <MatchActions
                  match={match}
                  isOrganizer={isOrganizer}
                  onDone={reload}
                />
              </div>
            )}
          </aside>
        </div>
      </div>

      {!played && (
        <div className="fixed inset-x-0 bottom-0 bg-linear-to-t from-base from-55% to-transparent px-5 pt-8 pb-28 lg:hidden">
          <MatchActions
            match={match}
            isOrganizer={isOrganizer}
            onDone={reload}
          />
        </div>
      )}
    </main>
  );
}
