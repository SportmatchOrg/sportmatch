import type { SportName } from '@/types/match';

const SPORT_PHOTOS: Record<SportName, string[]> = {
  FUTBOL: ['/deportes/football-match.jpg', '/deportes/football-bw.jpg'],
  BASQUET: [
    '/deportes/basketball-aerial.jpg',
    '/deportes/basketball-bw.jpg',
    '/deportes/streetball-bw.jpg',
  ],
  TENIS: ['/deportes/tennis-clay.jpg', '/deportes/tennis-net.jpg'],
  PADEL: ['/deportes/padel-bw.jpg'],
  RUNNING: ['/deportes/running-bw.jpg'],
};

function hash(value: string): number {
  let result = 0;

  for (let i = 0; i < value.length; i += 1) {
    result = (result * 31 + value.charCodeAt(i)) % 1_000_003;
  }

  return result;
}

export function sportPhotoUrl(name: SportName, seed: string): string | null {
  const photos = SPORT_PHOTOS[name];

  if (!photos?.length) return null;

  return photos[hash(seed) % photos.length];
}
