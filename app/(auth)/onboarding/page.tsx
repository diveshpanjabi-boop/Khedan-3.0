'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CityPicker } from '@/components/ui/CityPicker'
import { useCity } from '@/lib/hooks/useCity'

export default function OnboardingPage() {
  const router = useRouter()
  const { city } = useCity()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !city) return
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { error } = await supabase.from('profiles').upsert({ id: user.id, name: name.trim(), city })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/community')
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="text-4xl mb-2">👋</div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome to Khedan!</h1>
        <p className="text-gray-500 text-sm mt-1">Tell us about yourself</p>
      </div>
      {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
          <input type="text" placeholder="e.g. Rahul Sharma" value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your city</label>
          <CityPicker />
        </div>
        <button type="submit" disabled={loading || !name.trim() || !city} className="w-full bg-green-600 text-white rounded-xl py-3 font-medium hover:bg-green-700 transition-colors disabled:opacity-50">{loading ? 'Saving...' : 'Get Started'}</button>
      </form>
    </div>
  )
}
