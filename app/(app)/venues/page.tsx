'use client'
import { useState, useEffect, useMemo } from 'react'
import { Loader } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { sortByDistance } from '@/lib/utils/geo'
import { useCity } from '@/lib/hooks/useCity'
import { VenueCard } from '@/components/venues/VenueCard'
import { VenueFilters } from '@/components/venues/VenueFilters'
import { BookingModal } from '@/components/venues/BookingModal'
import { CityPicker } from '@/components/ui/CityPicker'
import type { Venue } from '@/lib/types'

type LocationState = 'requesting' | 'granted' | 'denied' | 'idle'

export default function VenuesPage() {
  const { city } = useCity()
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [locationState, setLocationState] = useState<LocationState>('idle')
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedSport, setSelectedSport] = useState('All')
  const [maxPrice, setMaxPrice] = useState(Infinity)
  const [bookingVenue, setBookingVenue] = useState<Venue | null>(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  // Request GPS on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationState('denied')
      return
    }
    setLocationState('requesting')
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocationState('granted')
      },
      () => setLocationState('denied'),
      { timeout: 8000 }
    )
  }, [])

  // Fetch venues when city is known
  useEffect(() => {
    if (!city) {
      setLoading(false)
      return
    }
    async function load() {
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('venues')
        .select('*')
        .eq('city', city)
        .eq('is_active', true)
        .order('rating', { ascending: false })
      setVenues((data as Venue[]) || [])
      setLoading(false)
    }
    load()
  }, [city])

  const filteredAndSorted = useMemo(() => {
    let result = venues

    if (selectedSport !== 'All') {
      result = result.filter(v => v.sports.includes(selectedSport))
    }

    if (maxPrice !== Infinity) {
      result = result.filter(v => v.price_per_hour <= maxPrice)
    }

    if (userCoords && locationState === 'granted') {
      result = sortByDistance(result, userCoords.lat, userCoords.lng)
    }

    return result
  }, [venues, selectedSport, maxPrice, userCoords, locationState])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold text-gray-900">Nearby Venues</h1>
          <CityPicker />
        </div>

        {locationState === 'requesting' && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Loader className="w-3 h-3 animate-spin" />
            Getting your location...
          </div>
        )}
        {locationState === 'granted' && (
          <p className="text-xs text-green-600">📍 Sorted by distance from you</p>
        )}
        {locationState === 'denied' && !city && (
          <p className="text-xs text-gray-500">Location not available — pick your city below</p>
        )}
      </div>

      {/* City picker fallback when GPS denied and no city set */}
      {locationState === 'denied' && !city && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-4">
          <p className="text-sm font-medium text-amber-800 mb-2">Choose your city to see venues</p>
          <CityPicker />
        </div>
      )}

      <VenueFilters
        selectedSport={selectedSport}
        selectedMaxPrice={maxPrice}
        onSportChange={setSelectedSport}
        onPriceChange={setMaxPrice}
      />

      {bookingSuccess && (
        <div className="mx-4 mt-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl p-3">
          ✅ Booking request sent! The venue owner will confirm shortly.
        </div>
      )}

      <div className="p-4 space-y-4">
        {loading && (
          <div className="text-center py-12 text-gray-400">Loading venues...</div>
        )}

        {!loading && !city && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📍</div>
            <p className="text-gray-500 text-sm">Select a city to see venues</p>
          </div>
        )}

        {!loading && city && filteredAndSorted.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🏟️</div>
            <p className="text-gray-500 text-sm">No venues found in {city}</p>
            <p className="text-gray-400 text-xs mt-1">Try changing the filters</p>
          </div>
        )}

        {!loading && filteredAndSorted.map(venue => (
          <VenueCard
            key={venue.id}
            venue={venue}
            onBook={id => setBookingVenue(venues.find(v => v.id === id) ?? null)}
            onView={id => { window.location.href = `/venues/${id}` }}
          />
        ))}
      </div>

      {bookingVenue && (
        <BookingModal
          venue={bookingVenue}
          onClose={() => setBookingVenue(null)}
          onBooked={() => {
            setBookingVenue(null)
            setBookingSuccess(true)
            setTimeout(() => setBookingSuccess(false), 5000)
          }}
        />
      )}
    </div>
  )
}
