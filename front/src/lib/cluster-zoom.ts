export const TILE_SIZE = 256;

type Size = { width: number; height: number };

function worldPoint({ lat, lng }: google.maps.LatLngLiteral): { x: number; y: number } {
  const sin = Math.sin((lat * Math.PI) / 180);

  return {
    x: ((lng + 180) / 360) * TILE_SIZE,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * TILE_SIZE,
  };
}

export function boundsSizeAtZoom(bounds: google.maps.LatLngBounds, zoom: number): Size {
  const northEast = worldPoint(bounds.getNorthEast().toJSON());
  const southWest = worldPoint(bounds.getSouthWest().toJSON());
  const scale = 2 ** zoom;

  return {
    width: Math.abs(northEast.x - southWest.x) * scale,
    height: Math.abs(southWest.y - northEast.y) * scale,
  };
}

export function zoomToFit(bounds: google.maps.LatLngBounds, viewport: Size): number {
  const { width, height } = boundsSizeAtZoom(bounds, 0);

  return Math.floor(Math.log2(Math.min(viewport.width / width, viewport.height / height)));
}
