export const SOUTH_AFRICA_CENTER: [number, number] = [24.991639, -28.816624];
export const SOUTH_AFRICA_ZOOM = 4.8;

export function getMapboxAccessToken() {
  return process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";
}
