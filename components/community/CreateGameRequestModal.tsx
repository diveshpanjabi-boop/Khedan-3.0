'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import { useCity } from '@/lib/hooks/useCity'

const SPORTS = ['Cricket', 'Football', 'Badminton', 'Basketball', 'Volleyball']
const QUICK_SPOTS = [7, 11, 15, 22]

interface Props {
  onClose: () => void
  onCreated: () => void
}

export function CreateGameRequestModal({ onClose, onCreated }: Props) {
  const { city } = useCity()
  const [form, setForm] = useState({
    sport: 'Cricket',
    venue_name: '',
    datetime: '',
    total_spots: 11,
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.venue_name || !form.datetime) return

    setLoading(true)
    setError('')

    const res = await fetch('/api/game-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, city }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Failed to create')
      setLoading(false)
      return
    }

    onCreated()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white rounded-t-3xl w-full max-w-lg mx-auto p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Post a Game</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sport</label>
            <div className="flex flex-wrap gap-2">
              {SPORTS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, sport: s }))}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    form.sport === s
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue / Ground name</label>
            <input
              type="text"
              placeholder="e.g. Shivaji Park, local ground..."
              value={form.venue_name}
              onChange={e => setForm(f => ({ ...f, venue_name: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
            <input
              type="datetime-local"
              value={form.datetime}
              onChange={e => setForm(f => ({ ...f, datetime: e.target.value }))}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total players needed: <span className="text-green-600 font-bold">{form.total_spots}</span>
            </label>
            <div className="flex gap-2 mb-2">
              {QUICK_SPOTS.map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, total_spots: n }))}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    form.total_spots === n
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <input
              type="number"
              min={2}
              max={50}
              value={form.total_spots}
              onChange={e => setForm(f => ({ ...f, total_spots: Number(e.target.value) }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea
              placeholder="Any rules, what to bring, skill level..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !form.venue_name || !form.datetime}
            className="w-full bg-green-600 text-white rounded-xl py-3 font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post Game Request'}
          </button>
        </form>
      </div>
    </div>
  )
}
