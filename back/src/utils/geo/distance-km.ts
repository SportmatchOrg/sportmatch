const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export function distanceKm(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): number {
  const latDelta = toRadians(toLat - fromLat);
  const lngDelta = toRadians(toLng - fromLng);
  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.sin(lngDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}
