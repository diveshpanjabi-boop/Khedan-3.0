import { describe, it, expect } from 'vitest'
import { haversineKm, sortByDistance } from '@/lib/utils/geo'
import type { Venue } from '@/lib/types'

describe('haversineKm', () => {
  it('returns 0 for same coordinates', () => {
    expect(haversineKm(19.076, 72.877, 19.076, 72.877)).toBeCloseTo(0, 2)
  })

  it('returns ~1.1km between two close Mumbai points', () => {
    // Dadar to Shivaji Park is ~1.1km
    const dist = haversineKm(19.0176, 72.8418, 19.0228, 72.8371)
    expect(dist).toBeGreaterThan(0.5)
    expect(dist).toBeLessThan(2)
  })

  it('returns ~1148km between Mumbai and Delhi', () => {
    const dist = haversineKm(19.076, 72.877, 28.613, 77.209)
    expect(dist).toBeGreaterThan(1100)
    expect(dist).toBeLessThan(1200)
  })
})

describe('sortByDistance', () => {
  const makeVenue = (id: string, lat: number, lng: number): Venue => ({
    id, owner_id: 'u1', name: id, city: 'Mumbai', address: '', lat, lng,
    sports: [], amenities: [], price_per_hour: 100, images: [],
    contact_phone: null, contact_email: null, opening_time: '06:00',
    closing_time: '22:00', rating: 0, total_ratings: 0, is_active: true, created_at: '',
  })

  it('sorts venues by distance from user location', () => {
    const userLat = 19.076
    const userLng = 72.877
    const near = makeVenue('near', 19.080, 72.880)
    const far = makeVenue('far', 19.200, 73.000)
    const sorted = sortByDistance([far, near], userLat, userLng)
    expect(sorted[0].id).toBe('near')
    expect(sorted[0].distance_km).toBeDefined()
    expect(sorted[0].distance_km!).toBeLessThan(sorted[1].distance_km!)
  })
})
