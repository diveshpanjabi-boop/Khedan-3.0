import type { Venue } from '@/lib/types'

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth radius in km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

export function sortByDistance(venues: Venue[], userLat: number, userLng: number): Venue[] {
  return venues
    .map(v => ({
      ...v,
      distance_km: v.lat != null && v.lng != null
        ? Math.round(haversineKm(userLat, userLng, v.lat, v.lng) * 10) / 10
        : undefined,
    }))
    .sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999))
}
