import type { DeporteNombre } from '@/types/partido';

const DEPORTE_PHOTOS: Record<DeporteNombre, string[]> = {
  FUTBOL: ['/deportes/football-match.jpg', '/deportes/football-bw.jpg'],
  BASQUET: [
    '/deportes/basketball-aerial.jpg',
    '/deportes/basketball-bw.jpg',
    '/deportes/streetball-bw.jpg',
  ],
  TENIS: ['/deportes/tennis-clay.jpg', '/deportes/tennis-net.jpg'],
  PADEL: ['/deportes/padel-bw.jpg'],
  RUNNING: ['/deportes/runnig-bw.jpg'],
};

function hash(value: string): number {
  let result = 0;

  for (let i = 0; i < value.length; i += 1) {
    result = (result * 31 + value.charCodeAt(i)) % 1_000_003;
  }

  return result;
}

export function deportePhotoUrl(nombre: DeporteNombre, seed: string): string | null {
  const photos = DEPORTE_PHOTOS[nombre];

  if (!photos.length) return null;

  return photos[hash(seed) % photos.length];
}
