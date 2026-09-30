'use client';

import { useEffect, useState } from 'react';

export type UserLocation = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

export type LocationStatus = 'pending' | 'granted' | 'denied';

type UserLocationState = {
  location: UserLocation | null;
  status: LocationStatus;
};

const INITIAL_STATE: UserLocationState = { location: null, status: 'pending' };

const UNSUPPORTED_STATE: UserLocationState = { location: null, status: 'denied' };

const WATCH_OPTIONS: PositionOptions = { enableHighAccuracy: true, maximumAge: 10_000 };

export function useUserLocation(): UserLocationState {
  const [state, setState] = useState<UserLocationState>(INITIAL_STATE);
  const supported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  useEffect(() => {
    if (!supported) return;

    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) =>
        setState({
          location: {
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy,
          },
          status: 'granted',
        }),
      () => setState((current) => (current.location ? current : { location: null, status: 'denied' })),
      WATCH_OPTIONS
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [supported]);

  return supported ? state : UNSUPPORTED_STATE;
}
