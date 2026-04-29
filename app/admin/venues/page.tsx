'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Venue } from '@/lib/types'

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('venues')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      setVenues((data as Venue[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  async function toggleActive(venueId: string, currentlyActive: boolean) {
    setActing(venueId)
    await fetch(`/api/admin/venues/${venueId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !currentlyActive }),
    })
    setVenues(prev => prev.map(v => v.id === venueId ? { ...v, is_active: !currentlyActive } : v))
    setActing(null)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Venues</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-5 px-4 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase border-b">
          <span className="col-span-2">Venue</span>
          <span>City</span>
          <span>Price/hr</span>
          <span>Status</span>
        </div>

        {loading && <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>}

        {!loading && venues.map(venue => (
          <div key={venue.id} className="grid grid-cols-5 px-4 py-3 border-b border-gray-50 last:border-0 items-center text-sm">
            <div className="col-span-2">
              <p className="font-medium text-gray-900">{venue.name}</p>
              <p className="text-xs text-gray-400">{venue.sports.join(', ')}</p>
            </div>
            <span className="text-gray-600">{venue.city}</span>
            <span className="text-gray-600">₹{venue.price_per_hour}</span>
            <button
              onClick={() => toggleActive(venue.id, venue.is_active)}
              disabled={acting === venue.id}
              className={`text-xs font-medium px-2 py-1 rounded-lg w-fit transition-colors disabled:opacity-50 ${
                venue.is_active
                  ? 'bg-green-50 text-green-700 hover:bg-green-100'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {venue.is_active ? 'Active' : 'Disabled'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
