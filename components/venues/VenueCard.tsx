import { MapPin, Star, Clock } from 'lucide-react'
import type { Venue } from '@/lib/types'

interface Props {
  venue: Venue
  onBook: (id: string) => void
  onView: (id: string) => void
}

const SPORT_EMOJI: Record<string, string> = {
  Cricket: '🏏',
  Football: '⚽',
  Badminton: '🏸',
  Basketball: '🏀',
  Volleyball: '🏐',
}

export function VenueCard({ venue, onBook, onView }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Image placeholder */}
      <div
        className="h-40 bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center cursor-pointer"
        onClick={() => onView(venue.id)}
      >
        {venue.images.length > 0 ? (
          <img src={venue.images[0]} alt={venue.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl">🏟️</span>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3
              className="font-semibold text-gray-900 cursor-pointer hover:text-green-700"
              onClick={() => onView(venue.id)}
            >
              {venue.name}
            </h3>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500 line-clamp-1">{venue.address}</span>
            </div>
          </div>
          {venue.distance_km != null && (
            <span className="shrink-0 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
              {venue.distance_km} km
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="font-medium">{venue.rating.toFixed(1)}</span>
            <span className="text-gray-400">({venue.total_ratings})</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>{venue.opening_time} – {venue.closing_time}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {venue.sports.map(sport => (
            <span key={sport} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
              {SPORT_EMOJI[sport] && <span aria-hidden="true">{SPORT_EMOJI[sport]} </span>}
              {sport}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-lg font-bold text-gray-900">₹{venue.price_per_hour}</span>
            <span className="text-xs text-gray-400">/hr</span>
          </div>
          <button
            onClick={() => onBook(venue.id)}
            className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  )
}
