'use client';

import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { MapPinOff, TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, type ReactNode } from 'react';

import { BaseMap } from '@/components/map/base-map';
import { FitBounds } from '@/components/map/fit-bounds';
import { MatchPin } from '@/components/map/match-pin';
import { MatchRow } from '@/components/matches/match-row';
import { EmptyState } from '@/components/ui/empty-state';
import { RetryButton } from '@/components/ui/retry-button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMatches } from '@/hooks/use-matches';
import { SPORT_LABEL, type Match } from '@/types/match';

const DEFAULT_CENTER = { lat: -34.6037, lng: -58.3816 };
const DEFAULT_ZOOM = 12;

const SCREEN =
  'flex h-[calc(100dvh-(--spacing(28)))] w-full lg:h-[calc(100dvh-(--spacing(20)))]';

const SIDE_LIST =
  'hidden w-md shrink-0 flex-col gap-4 overflow-y-auto border-r border-glass-strong bg-raised px-6 py-6 lg:flex';

const PANEL =
  'absolute inset-x-5 top-6 z-10 mx-auto max-w-sm rounded-lg bg-glass-solid py-8 shadow-float-glass backdrop-blur-card';

type LocatedMatch = Match & { latitude: number; longitude: number };

function isLocated(match: Match): match is LocatedMatch {
  return match.latitude !== null && match.longitude !== null;
}

function position(match: LocatedMatch): google.maps.LatLngLiteral {
  return { lat: match.latitude, lng: match.longitude };
}

function MapPanel({ children }: { children: ReactNode }) {
  return <div className={PANEL}>{children}</div>;
}

export default function MapPage() {
  const router = useRouter();
  const { matches, loading, error, reload } = useMatches();

  const located = useMemo(() => matches.filter(isLocated), [matches]);
  const points = useMemo(() => located.map(position), [located]);
  const showList = loading || located.length > 0;

  function renderOverlay() {
    if (loading) {
      return (
        <>
          <Skeleton className="absolute top-1/4 left-1/5 h-9.5 w-24 rounded-full" />
          <Skeleton className="absolute top-1/2 left-3/5 h-9.5 w-28 rounded-full" />
          <Skeleton className="absolute top-2/3 left-1/3 h-9.5 w-24 rounded-full" />
        </>
      );
    }

    if (error) {
      return (
        <MapPanel>
          <EmptyState
            icon={TriangleAlert}
            title="No pudimos cargar los partidos"
            text={error}
            action={<RetryButton onRetry={reload} />}
          />
        </MapPanel>
      );
    }

    if (located.length === 0) {
      return (
        <MapPanel>
          <EmptyState
            icon={MapPinOff}
            title="No hay partidos cerca por ahora"
            text="Cuando se publique un partido con lugar, lo vas a ver en el mapa."
          />
        </MapPanel>
      );
    }

    return null;
  }

  return (
    <main className={SCREEN}>
      {showList && (
        <aside aria-label="Partidos en el mapa" className={SIDE_LIST}>
          {loading ? (
            <>
              <Skeleton className="h-7 w-40 rounded-md" />
              {[0, 1, 2, 3].map((index) => (
                <Skeleton key={index} className="h-[100px] shrink-0 rounded-md" />
              ))}
            </>
          ) : (
            <>
              <h1 className="text-headline font-bold text-white">
                {located.length === 1 ? '1 partido' : `${located.length} partidos`}
              </h1>
              <ul className="flex flex-col gap-3">
                {located.map((match) => (
                  <li key={match.id}>
                    <MatchRow match={match} layout="row" />
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>
      )}

      <div className="relative min-w-0 flex-1">
        <BaseMap defaultCenter={DEFAULT_CENTER} defaultZoom={DEFAULT_ZOOM} className="size-full">
          {located.map((match) => (
            <AdvancedMarker
              key={match.id}
              position={position(match)}
              title={`${SPORT_LABEL[match.sport.name]} · ${match.location}`}
              onClick={() => router.push(`/partidos/${match.id}`)}
            >
              <MatchPin sport={match.sport.name} />
            </AdvancedMarker>
          ))}

          <FitBounds points={points} />
        </BaseMap>

        {renderOverlay()}
      </div>
    </main>
  );
}
