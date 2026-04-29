'use client'
import { useState, useCallback } from 'react'
import { Share2 } from 'lucide-react'
import { useRealtime } from '@/lib/hooks/useRealtime'
import { createClient } from '@/lib/supabase/client'
import { Scorecard } from '@/components/scoring/Scorecard'
import { RunRateChart } from '@/components/scoring/RunRateChart'
import { PartnershipChart } from '@/components/scoring/PartnershipChart'
import { RecentBalls } from '@/components/scoring/RecentBalls'
import { deriveInningsState, formatOvers } from '@/lib/scoring'
import type { Ball, Match, Player } from '@/lib/types'

type Tab = 'scorecard' | 'analytics' | 'timeline'

interface Props {
  matchId: string
  match: Match
  initialBalls: Ball[]
  players: Player[]
}

export function LiveClient({ matchId, match, initialBalls, players }: Props) {
  const [balls, setBalls] = useState<Ball[]>(initialBalls)
  const [tab, setTab] = useState<Tab>('scorecard')
  const innings = 1

  const refreshBalls = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('balls')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at')
    if (data) setBalls(data as Ball[])
  }, [matchId])

  useRealtime('balls', matchId, refreshBalls, 'match_id')

  const state = deriveInningsState(balls.filter(b => b.innings === innings))
  const team1Players = players.filter(p => p.team_id === match.team1_id)
  const team2Players = players.filter(p => p.team_id === match.team2_id)

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: `${match.team1?.name} vs ${match.team2?.name}`, url })
    } else {
      await navigator.clipboard.writeText(url)
      alert('Link copied!')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto">
      {/* Match header */}
      <div className="bg-green-700 text-white px-4 py-6 text-center">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs bg-green-600 px-2 py-0.5 rounded-full">
            {match.status === 'live' ? '🔴 LIVE' : match.status.toUpperCase()}
          </span>
          <button onClick={handleShare} className="p-1.5 bg-green-600 rounded-full">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
        <p className="text-green-200 text-sm">{match.team1?.name} vs {match.team2?.name}</p>
        <div className="text-5xl font-bold mt-2">{state.runs}/{state.wickets}</div>
        <p className="text-green-200 text-sm mt-1">
          {formatOvers(state.legalBalls)} ov · RR {state.runRate}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-100">
        {(['scorecard', 'analytics', 'timeline'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-xs font-medium capitalize border-b-2 transition-colors ${
              tab === t ? 'border-green-600 text-green-600' : 'border-transparent text-gray-400'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === 'scorecard' && (
          <Scorecard
            balls={balls}
            innings={innings}
            battingPlayers={team1Players}
            bowlingPlayers={team2Players}
          />
        )}

        {tab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Run Rate by Over</h3>
              <RunRateChart balls={balls} innings={innings} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Score Progression</h3>
              <PartnershipChart balls={balls} innings={innings} />
            </div>
          </div>
        )}

        {tab === 'timeline' && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Ball by Ball</h3>
            <RecentBalls balls={balls.filter(b => b.innings === innings)} />
          </div>
        )}
      </div>
    </div>
  )
}
