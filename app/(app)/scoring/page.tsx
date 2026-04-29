'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCity } from '@/lib/hooks/useCity'
import type { Match } from '@/lib/types'

type Tab = 'live' | 'my' | 'stats'

export default function ScoringPage() {
  const { city } = useCity()
  const [tab, setTab] = useState<Tab>('live')
  const [liveMatches, setLiveMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!city) {
      setLoading(false)
      return
    }
    async function load() {
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('matches')
        .select('*, team1:teams!team1_id(name, color), team2:teams!team2_id(name, color)')
        .eq('city', city)
        .eq('status', 'live')
        .order('created_at', { ascending: false })
      setLiveMatches((data as Match[]) || [])
      setLoading(false)
    }
    load()
  }, [city])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-bold text-gray-900">Scoring</h1>
        <Link
          href="/scoring/new"
          className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-full text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> New Match
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-100">
        {([['live', 'Live'], ['my', 'My Matches'], ['stats', 'Leaderboard']] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-xs font-medium border-b-2 transition-colors ${
              tab === t ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-3">
        {loading && <p className="text-center text-gray-400 text-sm py-8">Loading...</p>}

        {!loading && tab === 'live' && liveMatches.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🏏</div>
            <p className="text-gray-500 text-sm">No live matches in {city ?? 'your city'}</p>
          </div>
        )}

        {tab === 'live' && liveMatches.map(match => (
          <Link key={match.id} href={`/live/${match.id}`}>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">🔴 LIVE</span>
                <span className="text-xs text-gray-400">{match.overs} ov</span>
              </div>
              <p className="font-semibold text-gray-900">{match.team1?.name} vs {match.team2?.name}</p>
              <p className="text-sm text-green-600 mt-0.5">Tap to view live scorecard →</p>
            </div>
          </Link>
        ))}

        {tab === 'stats' && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-gray-500 text-sm">Leaderboards coming soon</p>
          </div>
        )}
      </div>
    </div>
  )
}
