'use client';

import { useEffect, useState } from 'react';

import { useUserLocation, type UserLocation } from '@/hooks/use-user-location';
import type { NearbyOrigin } from '@/lib/map-filters';

const LOCATION_TIMEOUT_MS = 3_000;

const PRECISION = 100;

type DiscoverOrigin = { ready: boolean; origin: NearbyOrigin | null };

const WAITING: DiscoverOrigin = { ready: false, origin: null };

const NO_LOCATION: DiscoverOrigin = { ready: true, origin: null };

function round(value: number): number {
  return Math.round(value * PRECISION) / PRECISION;
}

function toOrigin({ latitude, longitude }: UserLocation): NearbyOrigin {
  return { latitude: round(latitude), longitude: round(longitude) };
}

export function useDiscoverOrigin(): DiscoverOrigin {
  const { location, status } = useUserLocation();
  const [timedOut, setTimedOut] = useState(false);
  const [decided, setDecided] = useState<DiscoverOrigin | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), LOCATION_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, []);

  if (!decided && location) {
    setDecided({ ready: true, origin: toOrigin(location) });
  } else if (!decided && (status === 'denied' || timedOut)) {
    setDecided(NO_LOCATION);
  }

  return decided ?? WAITING;
}
