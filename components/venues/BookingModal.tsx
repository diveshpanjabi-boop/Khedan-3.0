'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import type { Venue } from '@/lib/types'

interface Props {
  venue: Venue
  onClose: () => void
  onBooked: () => void
}

export function BookingModal({ venue, onClose, onBooked }: Props) {
  const [form, setForm] = useState({
    date: '',
    start_time: '',
    end_time: '',
    sport: venue.sports[0] || '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function calcPrice(): number {
    if (!form.start_time || !form.end_time) return 0
    const [sh, sm] = form.start_time.split(':').map(Number)
    const [eh, em] = form.end_time.split(':').map(Number)
    const hours = ((eh * 60 + em) - (sh * 60 + sm)) / 60
    return Math.max(0, hours) * venue.price_per_hour
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.date || !form.start_time || !form.end_time) return

    const price = calcPrice()
    if (price <= 0) {
      setError('End time must be after start time')
      return
    }

    setLoading(true)
    setError('')

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ venue_id: venue.id, ...form, total_price: price }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Booking failed')
      setLoading(false)
      return
    }

    onBooked()
    onClose()
  }

  const price = calcPrice()

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white rounded-t-3xl w-full max-w-lg mx-auto p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Book {venue.name}</h2>
            <p className="text-sm text-gray-500">₹{venue.price_per_hour}/hr</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {venue.sports.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sport</label>
              <div className="flex gap-2 flex-wrap">
                {venue.sports.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, sport: s }))}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      form.sport === s
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
              <input
                type="time"
                value={form.start_time}
                min={venue.opening_time}
                max={venue.closing_time}
                onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End time</label>
              <input
                type="time"
                value={form.end_time}
                min={form.start_time || venue.opening_time}
                max={venue.closing_time}
                onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              placeholder="Any special requirements..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          {price > 0 && (
            <div className="bg-green-50 rounded-xl p-3 flex justify-between items-center">
              <span className="text-sm text-gray-600">Total</span>
              <span className="text-lg font-bold text-green-700">₹{price.toFixed(0)}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !form.date || !form.start_time || !form.end_time || price <= 0}
            className="w-full bg-green-600 text-white rounded-xl py-3 font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Booking...' : `Confirm Booking${price > 0 ? ` — ₹${price.toFixed(0)}` : ''}`}
          </button>
        </form>
      </div>
    </div>
  )
}
