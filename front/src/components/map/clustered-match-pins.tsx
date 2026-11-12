'use client';

import { MarkerClusterer, SuperClusterAlgorithm, type Cluster } from '@googlemaps/markerclusterer';
import { AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { MatchPin, PILL } from '@/components/map/match-pin';
import { USER_LOCATION_Z_INDEX } from '@/components/map/user-location-marker';
import { MatchRow } from '@/components/matches/match-row';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { boundsSizeAtZoom, TILE_SIZE, zoomToFit } from '@/lib/cluster-zoom';
import { groupMatchesByLocation, type MatchLocation } from '@/lib/match-locations';
import { cn } from '@/lib/utils';
import { SPORT_LABEL, type LocatedMatch } from '@/types/match';

type LocationMarker = google.maps.marker.AdvancedMarkerElement;

const PIN_Z_INDEX = USER_LOCATION_Z_INDEX + 1;

const MAX_CLUSTER_ZOOM = 22;

const PIN_SEPARATION_PX = 48;

const FIT_PADDING_PX = 64;

const COUNT_PILL = cn(PILL, 'min-w-9.5 cursor-pointer justify-center drop-shadow-map-pin');

function countLabel(count: number): string {
  return count > 99 ? '99+' : String(count);
}

function renderCount(position: google.maps.LatLng, count: number): LocationMarker {
  const capsule = document.createElement('span');
  capsule.className = COUNT_PILL;
  capsule.textContent = countLabel(count);

  return new google.maps.marker.AdvancedMarkerElement({
    position,
    content: capsule,
    title: `${count} partidos en esta zona`,
    zIndex: PIN_Z_INDEX + count,
    gmpClickable: true,
  });
}

function reachableMaxZoom(map: google.maps.Map): number {
  const mapType: google.maps.MapType | undefined = map.mapTypes.get(map.getMapTypeId() ?? '');

  return Math.min(mapType?.maxZoom ?? MAX_CLUSTER_ZOOM, MAX_CLUSTER_ZOOM);
}

function zoomIntoCluster(map: google.maps.Map, bounds: google.maps.LatLngBounds): boolean {
  const zoom = map.getZoom() ?? 0;
  const maxZoom = reachableMaxZoom(map);
  const spanAtMaxZoom = boundsSizeAtZoom(bounds, maxZoom);

  if (zoom >= maxZoom || Math.hypot(spanAtMaxZoom.width, spanAtMaxZoom.height) < PIN_SEPARATION_PX) {
    return false;
  }

  const viewport = map.getDiv().getBoundingClientRect();
  const fitZoom = zoomToFit(bounds, {
    width: Math.max(viewport.width - 2 * FIT_PADDING_PX, 1),
    height: Math.max(viewport.height - 2 * FIT_PADDING_PX, 1),
  });

  map.setCenter(bounds.getCenter());
  map.setZoom(Math.min(maxZoom, Math.max(zoom + 1, fitZoom)));

  return (map.getZoom() ?? 0) > zoom;
}

function LocationPin({
  location,
  register,
  onOpenList,
}: {
  location: MatchLocation;
  register: (id: string, marker: LocationMarker | null) => void;
  onOpenList: (matches: LocatedMatch[]) => void;
}) {
  const router = useRouter();
  const ref = useCallback(
    (marker: LocationMarker | null) => register(location.id, marker),
    [location.id, register],
  );
  const [first] = location.matches;
  const count = location.matches.length;
  const single = count === 1;

  return (
    <AdvancedMarker
      ref={ref}
      position={location.position}
      title={single ? `${SPORT_LABEL[first.sport.name]} · ${first.location}` : `${count} partidos en este lugar`}
      onClick={() => (single ? router.push(`/partidos/${first.id}`) : onOpenList(location.matches))}
      zIndex={single ? PIN_Z_INDEX : PIN_Z_INDEX + count}
    >
      {single ? (
        <MatchPin sport={first.sport.name} />
      ) : (
        <span className={COUNT_PILL}>{countLabel(count)}</span>
      )}
    </AdvancedMarker>
  );
}

export function ClusteredMatchPins({ matches }: { matches: LocatedMatch[] }) {
  const map = useMap();
  const clusterer = useRef<MarkerClusterer | null>(null);
  const locationByMarker = useRef(new Map<LocationMarker, MatchLocation>());
  const [markers, setMarkers] = useState<Record<string, LocationMarker>>({});
  const [listedIds, setListedIds] = useState<string[]>([]);
  const [listOpen, setListOpen] = useState(false);
  const locations = useMemo(() => groupMatchesByLocation(matches), [matches]);
  const listed = matches.filter((match) => listedIds.includes(match.id));

  const register = useCallback((id: string, marker: LocationMarker | null) => {
    setMarkers((current) => {
      if (current[id] === marker || (!marker && !current[id])) return current;
      const next = { ...current };
      if (marker) next[id] = marker;
      else delete next[id];
      return next;
    });
  }, []);

  const openList = useCallback((selected: LocatedMatch[]) => {
    setListedIds(selected.map((match) => match.id));
    setListOpen(true);
  }, []);

  useEffect(() => {
    if (!map) return;

    const matchesIn = (cluster: Cluster) =>
      cluster.markers.flatMap(
        (marker) => locationByMarker.current.get(marker as LocationMarker)?.matches ?? [],
      );

    const instance = new MarkerClusterer({
      map,
      algorithm: new SuperClusterAlgorithm({
        maxZoom: MAX_CLUSTER_ZOOM,
        radius: PIN_SEPARATION_PX,
        extent: TILE_SIZE,
      }),
      renderer: { render: (cluster) => renderCount(cluster.position, matchesIn(cluster).length) },
      onClusterClick: (_, cluster, clusterMap) => {
        if (!cluster.bounds || !zoomIntoCluster(clusterMap, cluster.bounds)) {
          openList(matchesIn(cluster));
        }
      },
    });
    clusterer.current = instance;
    return () => {
      instance.clearMarkers();
      instance.setMap(null);
      clusterer.current = null;
    };
  }, [map, openList]);

  useEffect(() => {
    const instance = clusterer.current;
    if (!instance) return;
    locationByMarker.current = new Map(
      locations.flatMap((location) => {
        const marker = markers[location.id];
        return marker ? [[marker, location] as const] : [];
      }),
    );
    instance.clearMarkers(true);
    instance.addMarkers([...locationByMarker.current.keys()], true);
    instance.render();
  }, [map, markers, locations]);

  return (
    <>
      {locations.map((location) => (
        <LocationPin
          key={location.id}
          location={location}
          register={register}
          onOpenList={openList}
        />
      ))}

      <BottomSheet
        open={listOpen && listed.length > 0}
        onClose={() => setListOpen(false)}
        title="Partidos en este lugar"
      >
        <ul className="flex flex-col gap-3">
          {listed.map((match) => (
            <li key={match.id}>
              <MatchRow match={match} layout="row" />
            </li>
          ))}
        </ul>
      </BottomSheet>
    </>
  );
}
