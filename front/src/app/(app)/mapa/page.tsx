'use client';

import { AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { FunnelX, LocateFixed, MapPinOff, TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { BaseMap } from '@/components/map/base-map';
import { FitBounds } from '@/components/map/fit-bounds';
import { MapFilterChips } from '@/components/map/map-filter-chips';
import { MapFiltersSheet } from '@/components/map/map-filters-sheet';
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
import { PillButton } from '@/components/ui/pill-button';
import { RetryButton } from '@/components/ui/retry-button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMatches } from '@/hooks/use-matches';
import { useUserLocation, type UserLocation } from '@/hooks/use-user-location';
import { DEFAULT_MAP_CENTER } from '@/lib/map-center';
import {
  EMPTY_MAP_FILTERS,
  hasActiveFilters,
  toMatchesQuery,
  type MapFilters,
} from '@/lib/map-filters';
import { SPORT_LABEL, type Match } from '@/types/match';

const DEFAULT_ZOOM = 12;

const USER_ZOOM = 15;

const PIN_Z_INDEX = USER_LOCATION_Z_INDEX + 1;

const SCREEN =
  'flex h-[calc(100dvh-(--spacing(28)))] w-full lg:h-[calc(100dvh-(--spacing(20)))]';

const SIDE_LIST =
  'hidden w-md shrink-0 flex-col gap-4 overflow-y-auto border-r border-glass-strong bg-raised px-6 py-6 lg:flex';

const PANEL =
  'absolute inset-x-5 top-36 z-10 mx-auto max-w-sm rounded-lg bg-glass-solid py-8 shadow-float-glass backdrop-blur-card lg:top-6';

const MOBILE_CHIPS = '-mx-4 -my-1 overflow-x-auto px-4 py-1 [scrollbar-width:none]';

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
  const { location } = useUserLocation();
  const [filters, setFilters] = useState<MapFilters>(EMPTY_MAP_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const query = useMemo(() => toMatchesQuery(filters), [filters]);
  const { matches, loading, error, reload } = useMatches(query);
  const centeredOnUser = useRef(false);
  const searchProps = { onOpenFilters: () => setFiltersOpen(true), origin: location };

  const located = useMemo(() => matches.filter(isLocated), [matches]);
  const points = useMemo(() => located.map(position), [located]);

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

  function renderChips(className: string) {
    return (
      <MapFilterChips
        filters={filters}
        onChange={setFilters}
        location={location}
        className={className}
      />
    );
  }

  function renderList() {
    if (loading) {
      return (
        <>
          <Skeleton className="h-7 w-40 rounded-md" />
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-[100px] shrink-0 rounded-md" />
          ))}
        </>
      );
    }

    if (located.length === 0) return null;

    return (
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
    );
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

    if (located.length === 0 && hasActiveFilters(filters)) {
      return (
        <MapPanel>
          <EmptyState
            icon={FunnelX}
            title="No hay partidos con estos filtros"
            text="Probá con otro día, nivel o deporte."
            action={
              <PillButton variant="glass" size="md" onClick={() => setFilters(EMPTY_MAP_FILTERS)}>
                Limpiar filtros
              </PillButton>
            }
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
      <aside aria-label="Partidos en el mapa" className={SIDE_LIST}>
        <MapSearchBar {...searchProps} />
        {renderChips('flex-wrap')}
        {renderList()}
      </aside>

      <div className="relative min-w-0 flex-1">
        <BaseMap defaultCenter={DEFAULT_MAP_CENTER} defaultZoom={DEFAULT_ZOOM} className="size-full">
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

        <MapHeader {...searchProps}>{renderChips(MOBILE_CHIPS)}</MapHeader>

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

      <MapFiltersSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onChange={setFilters}
        resultCount={located.length}
      />
    </main>
  );
}
