'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import { useCity } from '@/lib/hooks/useCity'

const CATEGORIES = [
  { id: 'general', label: 'General 💬' },
  { id: 'match', label: 'Match Talk 🏏' },
  { id: 'find_players', label: 'Find Players 🔍' },
  { id: 'tips', label: 'Tips 💡' },
  { id: 'tournament', label: 'Tournaments 🏆' },
]

interface Props {
  onClose: () => void
  onCreated: () => void
}

export function ForumPostModal({ onClose, onCreated }: Props) {
  const { city } = useCity()
  const [form, setForm] = useState({ title: '', content: '', category: 'general' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) return

    setLoading(true)
    const res = await fetch('/api/forum/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, city }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Failed to post')
      setLoading(false)
      return
    }

    onCreated()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white rounded-t-3xl w-full max-w-lg mx-auto p-6 space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">New Post</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setForm(f => ({ ...f, category: cat.id }))}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  form.category === cat.id
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
            required
          />

          <textarea
            placeholder="What's on your mind?"
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            required
          />

          <button
            type="submit"
            disabled={loading || !form.title.trim() || !form.content.trim()}
            className="w-full bg-green-600 text-white rounded-xl py-3 font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </form>
      </div>
    </div>
  )
}
