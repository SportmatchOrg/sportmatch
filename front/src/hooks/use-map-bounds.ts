'use client';

import { useMap } from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';

import type { MatchesQuery } from '@/types/match';

export type MapBounds = Required<Pick<MatchesQuery, 'north' | 'south' | 'east' | 'west'>>;

const DEBOUNCE_MS = 300;

const PRECISION = 1_000;

const WHOLE_WORLD = { west: -180, east: 180 };

function roundUp(value: number): number {
  return Math.ceil(value * PRECISION) / PRECISION;
}

function roundDown(value: number): number {
  return Math.floor(value * PRECISION) / PRECISION;
}

function toMapBounds(bounds: google.maps.LatLngBounds): MapBounds {
  const northEast = bounds.getNorthEast();
  const southWest = bounds.getSouthWest();
  const west = roundDown(southWest.lng());
  const east = roundUp(northEast.lng());

  return {
    north: roundUp(northEast.lat()),
    south: roundDown(southWest.lat()),
    ...(west < east ? { west, east } : WHOLE_WORLD),
  };
}

export function useMapBounds(): MapBounds | null {
  const map = useMap();
  const [bounds, setBounds] = useState<MapBounds | null>(null);

  useEffect(() => {
    if (!map) return;

    let timer: ReturnType<typeof setTimeout> | undefined;

    const listener = map.addListener('idle', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const visible = map.getBounds();
        if (visible) setBounds(toMapBounds(visible));
      }, DEBOUNCE_MS);
    });

    return () => {
      clearTimeout(timer);
      listener.remove();
    };
  }, [map]);

  return bounds;
}
