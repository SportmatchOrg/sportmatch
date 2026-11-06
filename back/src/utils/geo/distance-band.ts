const BAND_LIMITS_KM = [5, 20];

export const distanceBand = (km: number): number => {
  const band = BAND_LIMITS_KM.findIndex((limit) => km <= limit);

  return band === -1 ? BAND_LIMITS_KM.length : band;
};
