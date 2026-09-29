'use client';

import { AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { LocateFixed, MapPinOff, TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, type ReactNode } from 'react';

import { BaseMap } from '@/components/map/base-map';
import { FitBounds } from '@/components/map/fit-bounds';
import { MapHeader } from '@/components/map/map-header';
import { MapSearchBar } from '@/components/map/map-search-bar';
import { MatchPin } from '@/components/map/match-pin';
import {
  USER_LOCATION_Z_INDEX,
  UserLocationMarker,
} from '@/components/map/user-location-marker';
import { MatchRow } from '@/components/matches/match-row';
import { EmptyState } from '@/components/ui/empty-state';
import { IconButton } from '@/components/ui/icon-button';
import { RetryButton } from '@/components/ui/retry-button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMatches } from '@/hooks/use-matches';
import { useUserLocation, type UserLocation } from '@/hooks/use-user-location';
import { SPORT_LABEL, type Match } from '@/types/match';

const DEFAULT_CENTER = { lat: -34.6037, lng: -58.3816 };
const DEFAULT_ZOOM = 12;

const USER_ZOOM = 15;

const PIN_Z_INDEX = USER_LOCATION_Z_INDEX + 1;

const SCREEN =
  'flex h-[calc(100dvh-(--spacing(28)))] w-full lg:h-[calc(100dvh-(--spacing(20)))]';

const SIDE_LIST =
  'hidden w-md shrink-0 flex-col gap-4 overflow-y-auto border-r border-glass-strong bg-raised px-6 py-6 lg:flex';

const PANEL =
  'absolute inset-x-5 top-24 z-10 mx-auto max-w-sm rounded-lg bg-glass-solid py-8 shadow-float-glass backdrop-blur-card lg:top-6';

type LocatedMatch = Match & { latitude: number; longitude: number };

function isLocated(match: Match): match is LocatedMatch {
  return match.latitude !== null && match.longitude !== null;
}

function position(match: LocatedMatch): google.maps.LatLngLiteral {
  return { lat: match.latitude, lng: match.longitude };
}

function userPosition(location: UserLocation): google.maps.LatLngLiteral {
  return { lat: location.latitude, lng: location.longitude };
}

function MapPanel({ children }: { children: ReactNode }) {
  return <div className={PANEL}>{children}</div>;
}

export default function MapPage() {
  const router = useRouter();
  const map = useMap();
  const { matches, loading, error, reload } = useMatches();
  const { location } = useUserLocation();
  const centeredOnUser = useRef(false);

  const located = useMemo(() => matches.filter(isLocated), [matches]);
  const points = useMemo(() => located.map(position), [located]);
  const showList = loading || located.length > 0;

  useEffect(() => {
    if (!map || !location || centeredOnUser.current) return;

    centeredOnUser.current = true;
    map.setCenter(userPosition(location));
    map.setZoom(USER_ZOOM);
  }, [map, location]);

  function recenter() {
    if (!map || !location) return;

    map.panTo(userPosition(location));
    map.setZoom(USER_ZOOM);
  }

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
          <MapSearchBar />

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
              zIndex={PIN_Z_INDEX}
            >
              <MatchPin sport={match.sport.name} />
            </AdvancedMarker>
          ))}

          {location ? <UserLocationMarker location={location} /> : <FitBounds points={points} />}
        </BaseMap>

        <MapHeader />

        {location && (
          <IconButton
            label="Centrar en mi ubicación"
            onClick={recenter}
            className="absolute right-4 bottom-10 z-10"
          >
            <LocateFixed className="size-5" aria-hidden="true" />
          </IconButton>
        )}

        {renderOverlay()}
      </div>
    </main>
  );
}
