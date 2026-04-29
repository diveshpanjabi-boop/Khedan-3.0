import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Venue } from '@/lib/types'
import { MapPin, Phone, Mail, Clock, Star } from 'lucide-react'

export default async function VenueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('venues')
    .select('*')
    .eq('id', id)
    .single()

  if (!data) notFound()
  const venue = data as Venue

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Hero image */}
      <div className="h-56 bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">
        {venue.images.length > 0 ? (
          <img src={venue.images[0]} alt={venue.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-7xl">🏟️</span>
        )}
      </div>

      <div className="p-4 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{venue.name}</h1>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="font-medium text-gray-700">{venue.rating.toFixed(1)}</span>
            <span className="text-gray-400 text-sm">({venue.total_ratings} ratings)</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <span className="text-sm text-gray-700">{venue.address}, {venue.city}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-sm text-gray-700">{venue.opening_time} – {venue.closing_time}</span>
          </div>
          {venue.contact_phone && (
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
              <a href={`tel:${venue.contact_phone}`} className="text-sm text-green-600">{venue.contact_phone}</a>
            </div>
          )}
          {venue.contact_email && (
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <a href={`mailto:${venue.contact_email}`} className="text-sm text-green-600">{venue.contact_email}</a>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Sports Available</h2>
          <div className="flex flex-wrap gap-2">
            {venue.sports.map(s => (
              <span key={s} className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>

        {venue.amenities.length > 0 && (
          <div className="bg-white rounded-2xl p-4">
            <h2 className="font-semibold text-gray-900 mb-3">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {venue.amenities.map(a => (
                <span key={a} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="fixed bottom-20 left-0 right-0 px-4 max-w-lg mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-2xl font-bold text-gray-900">₹{venue.price_per_hour}</span>
              <span className="text-sm text-gray-400">/hr</span>
            </div>
            <a
              href={`/venues?book=${venue.id}`}
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
            >
              Book Now
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
