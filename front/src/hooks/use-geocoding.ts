'use client';

import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { useCallback, useEffect, useRef } from 'react';

import { DEFAULT_MAP_CENTER } from '@/lib/map-center';

export type PlaceSuggestion = { id: string; title: string; subtitle: string };
export type Place = { label: string; latitude: number; longitude: number };
export type SearchOrigin = { latitude: number; longitude: number };

const SEARCH_RADIUS_METERS = 50_000;
export const MIN_PLACE_SEARCH_LENGTH = 3;
const MAX_SUGGESTIONS = 5;
const SEARCH_DELAY = 300;

// `origin` is where the player is: suggestions near it come first. Without it, the default center is used.
export function useGeocoding(origin?: SearchOrigin | null): {
  ready: boolean;
  searchPlaces(query: string): Promise<PlaceSuggestion[]>;
  getPlace(suggestion: PlaceSuggestion): Promise<Place>;
  getAddress(lat: number, lng: number): Promise<string>;
} {
  const placesLibrary = useMapsLibrary('places');
  const geocodingLibrary = useMapsLibrary('geocoding');
  const sessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const predictions = useRef(new Map<string, google.maps.places.PlacePrediction>());
  const searchRevision = useRef(0);
  const searchCenter = useRef(DEFAULT_MAP_CENTER);

  useEffect(() => {
    searchCenter.current = origin
      ? { lat: origin.latitude, lng: origin.longitude }
      : DEFAULT_MAP_CENTER;
  }, [origin]);

  useEffect(() => () => {
    searchRevision.current += 1;
  }, []);

  const searchPlaces = useCallback(
    async (query: string): Promise<PlaceSuggestion[]> => {
      const revision = ++searchRevision.current;
      const input = query.trim();

      if (!input) {
        sessionToken.current = null;
        predictions.current.clear();
        return [];
      }

      if (!placesLibrary) return [];

      sessionToken.current ??= new placesLibrary.AutocompleteSessionToken();
      if (input.length < MIN_PLACE_SEARCH_LENGTH) return [];

      const token = sessionToken.current;
      await new Promise<void>((resolve) => setTimeout(resolve, SEARCH_DELAY));
      if (revision !== searchRevision.current || sessionToken.current !== token) return [];

      const { suggestions } =
        await placesLibrary.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input,
          includedRegionCodes: ['ar'],
          language: 'es',
          locationBias: { center: searchCenter.current, radius: SEARCH_RADIUS_METERS },
          sessionToken: token,
        });

      if (revision !== searchRevision.current || sessionToken.current !== token) return [];

      return suggestions
        .flatMap(({ placePrediction }) => {
          if (!placePrediction) return [];
          predictions.current.set(placePrediction.placeId, placePrediction);

          return [{
            id: placePrediction.placeId,
            title: placePrediction.mainText?.toString() ?? placePrediction.text.toString(),
            subtitle: placePrediction.secondaryText?.toString() ?? '',
          }];
        })
        .slice(0, MAX_SUGGESTIONS);
    },
    [placesLibrary],
  );

  const getPlace = useCallback(async (suggestion: PlaceSuggestion): Promise<Place> => {
    searchRevision.current += 1;
    const prediction = predictions.current.get(suggestion.id);
    if (!prediction) throw new Error('Place suggestion is no longer available');
    const token = sessionToken.current;

    try {
      const place = prediction.toPlace();
      await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location'] });

      if (!place.location) throw new Error('Selected place has no coordinates');

      const label = [place.displayName, place.formattedAddress]
        .filter(Boolean)
        .join(', ');

      return {
        label,
        latitude: place.location.lat(),
        longitude: place.location.lng(),
      };
    } finally {
      if (sessionToken.current === token) {
        sessionToken.current = null;
        predictions.current.clear();
      }
    }
  }, []);

  const getAddress = useCallback(async (lat: number, lng: number): Promise<string> => {
    if (!geocodingLibrary) throw new Error('Geocoding library is not available');

    const { results } = await new geocodingLibrary.Geocoder().geocode({
      location: { lat, lng },
    });
    const address = results[0]?.formatted_address;
    if (!address) throw new Error('No address found for the selected location');

    return address;
  }, [geocodingLibrary]);

  return { ready: Boolean(placesLibrary), searchPlaces, getPlace, getAddress };
}
