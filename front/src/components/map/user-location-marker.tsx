'use client';

import { AdvancedMarker, AdvancedMarkerAnchorPoint, Circle } from '@vis.gl/react-google-maps';
import { useMemo } from 'react';

import type { UserLocation } from '@/hooks/use-user-location';

const MAX_ACCURACY_METERS = 1000;

export const USER_LOCATION_Z_INDEX = 0;

const DOT =
  'relative isolate block size-4.5 rounded-full border-3 border-ink-100 bg-brand shadow-float before:absolute before:inset-0 before:-z-10 before:animate-user-aura before:rounded-full before:bg-brand';

function readColorToken(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function UserLocationMarker({ location }: { location: UserLocation }) {
  const brand = useMemo(() => readColorToken('--color-brand'), []);
  const position = { lat: location.latitude, lng: location.longitude };

  return (
    <>
      {location.accuracy <= MAX_ACCURACY_METERS && (
        <Circle
          center={position}
          radius={location.accuracy}
          fillColor={brand}
          fillOpacity={0.12}
          strokeColor={brand}
          strokeOpacity={0.4}
          strokeWeight={1}
          clickable={false}
        />
      )}

      <AdvancedMarker
        position={position}
        anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
        clickable={false}
        zIndex={USER_LOCATION_Z_INDEX}
      >
        <span className={DOT} />
      </AdvancedMarker>
    </>
  );
}
