import type { LocatedMatch } from '@/types/match';

export type MatchLocation = {
  id: string;
  position: google.maps.LatLngLiteral;
  matches: LocatedMatch[];
};

export function groupMatchesByLocation(matches: LocatedMatch[]): MatchLocation[] {
  const groups = new Map<string, LocatedMatch[]>();

  for (const match of matches) {
    const key = `${match.latitude},${match.longitude}`;
    groups.set(key, [...(groups.get(key) ?? []), match]);
  }

  return [...groups.entries()].map(([key, located]) => ({
    id: `${key}:${located.map((match) => match.id).join(',')}`,
    position: { lat: located[0].latitude, lng: located[0].longitude },
    matches: located,
  }));
}
