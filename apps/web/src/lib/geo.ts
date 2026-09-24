export interface LatLng {
  lat: number;
  lng: number;
}

/** Centro de referência padrão enquanto não há geolocalização do usuário. */
export const DEFAULT_CENTER: LatLng = { lat: -23.5505, lng: -46.6333 };

const EARTH_RADIUS_KM = 6371;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Distância em km entre dois pontos (haversine). */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}
