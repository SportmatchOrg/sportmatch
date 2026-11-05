'use client';

import { MarkerClusterer, SuperClusterAlgorithm, type Renderer } from '@googlemaps/markerclusterer';
import { AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { MatchPin, PILL } from '@/components/map/match-pin';
import { USER_LOCATION_Z_INDEX } from '@/components/map/user-location-marker';
import { cn } from '@/lib/utils';
import { SPORT_LABEL, type LocatedMatch } from '@/types/match';

type MatchMarker = google.maps.marker.AdvancedMarkerElement;

const PIN_Z_INDEX = USER_LOCATION_Z_INDEX + 1;

const renderer: Renderer = {
  render({ count, position }) {
    const capsule = document.createElement('span');
    capsule.className = cn(PILL, 'min-w-9.5 cursor-pointer justify-center drop-shadow-map-pin');
    capsule.textContent = count > 99 ? '99+' : String(count);

    return new google.maps.marker.AdvancedMarkerElement({
      position,
      content: capsule,
      title: `${count} partidos en esta zona`,
      zIndex: PIN_Z_INDEX + count,
      gmpClickable: true,
    });
  },
};

function MatchMarker({
  match,
  register,
}: {
  match: LocatedMatch;
  register: (id: string, marker: MatchMarker | null) => void;
}) {
  const router = useRouter();
  const ref = useCallback(
    (marker: MatchMarker | null) => register(match.id, marker),
    [match.id, register],
  );

  return (
    <AdvancedMarker
      ref={ref}
      position={{ lat: match.latitude, lng: match.longitude }}
      title={`${SPORT_LABEL[match.sport.name]} · ${match.location}`}
      onClick={() => router.push(`/partidos/${match.id}`)}
      zIndex={PIN_Z_INDEX}
    >
      <MatchPin sport={match.sport.name} />
    </AdvancedMarker>
  );
}

export function ClusteredMatchPins({ matches }: { matches: LocatedMatch[] }) {
  const map = useMap();
  const clusterer = useRef<MarkerClusterer | null>(null);
  const [markers, setMarkers] = useState<Record<string, MatchMarker>>({});

  const register = useCallback((id: string, marker: MatchMarker | null) => {
    setMarkers((current) => {
      if (current[id] === marker || (!marker && !current[id])) return current;
      const next = { ...current };
      if (marker) next[id] = marker;
      else delete next[id];
      return next;
    });
  }, []);

  useEffect(() => {
    if (!map) return;
    const instance = new MarkerClusterer({
      map,
      renderer,
      algorithm: new SuperClusterAlgorithm({ maxZoom: 22 }),
    });
    clusterer.current = instance;
    return () => {
      instance.clearMarkers();
      instance.setMap(null);
      clusterer.current = null;
    };
  }, [map]);

  useEffect(() => {
    const instance = clusterer.current;
    if (!instance) return;
    instance.clearMarkers(true);
    instance.addMarkers(Object.values(markers), true);
    instance.render();
  }, [map, markers]);

  return matches.map((match) => (
    <MatchMarker
      key={`${match.id}:${match.latitude}:${match.longitude}`}
      match={match}
      register={register}
    />
  ));
}
