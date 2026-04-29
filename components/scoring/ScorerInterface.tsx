'use client'
import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import type { Ball, Player } from '@/lib/types'
import { deriveInningsState, formatOvers, deriveBatsmanStats, deriveBowlerStats } from '@/lib/scoring'
import { RecentBalls } from './RecentBalls'

const RUN_BUTTONS = [0, 1, 2, 3, 4, 6]
const WICKET_TYPES = ['Bowled', 'Caught', 'Run Out', 'Stumped', 'LBW', 'Hit Wicket']
const EXTRA_TYPES = [
  { label: 'Wide', value: 'wide' },
  { label: 'No Ball', value: 'noball' },
  { label: 'Bye', value: 'bye' },
  { label: 'Leg Bye', value: 'legbye' },
]

interface Props {
  matchId: string
  innings: number
  balls: Ball[]
  players: Player[]
  strikerId: string
  nonStrikerId: string
  bowlerId: string
  onBallRecorded: () => void
  onUndo: () => void
}

export function ScorerInterface({
  matchId, innings, balls, players, strikerId, nonStrikerId, bowlerId,
  onBallRecorded, onUndo,
}: Props) {
  const [showWicketModal, setShowWicketModal] = useState(false)
  const [showExtrasModal, setShowExtrasModal] = useState(false)
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [customRuns, setCustomRuns] = useState('')
  const [loading, setLoading] = useState(false)

  const inningsBalls = balls.filter(b => b.innings === innings)
  const state = deriveInningsState(inningsBalls)
  const legalInOver = state.legalBalls % 6
  const currentOver = Math.floor(state.legalBalls / 6) + 1
  const striker = players.find(p => p.id === strikerId)
  const nonStriker = players.find(p => p.id === nonStrikerId)
  const bowler = players.find(p => p.id === bowlerId)
  const strikerStats = deriveBatsmanStats(inningsBalls, strikerId)
  const bowlerStats = deriveBowlerStats(inningsBalls, bowlerId)

  async function recordBall(payload: {
    runs?: number; extras?: number; extra_type?: string;
    wicket_type?: string; dismissed_player_id?: string
  }) {
    setLoading(true)
    const isLegal = !['wide', 'noball'].includes(payload.extra_type ?? '')
    const nextBallNum = legalInOver + 1
    const isOverComplete = isLegal && nextBallNum === 6

    const runs = payload.runs ?? 0
    const swapStrike = isLegal && runs % 2 !== 0

    await fetch(`/api/matches/${matchId}/ball`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        innings,
        over_num: currentOver,
        ball_num: nextBallNum,
        batsman_id: strikerId,
        bowler_id: bowlerId,
        runs,
        extras: payload.extras ?? 0,
        extra_type: payload.extra_type ?? null,
        wicket_type: payload.wicket_type ?? null,
        dismissed_player_id: payload.dismissed_player_id ?? null,
        new_striker_id: swapStrike || isOverComplete ? nonStrikerId : undefined,
        new_non_striker_id: swapStrike || isOverComplete ? strikerId : undefined,
      }),
    })
    setLoading(false)
    onBallRecorded()
  }

  return (
    <div className="space-y-4">
      {/* Score header */}
      <div className="bg-green-700 text-white rounded-2xl p-4">
        <div className="text-4xl font-bold text-center">
          {state.runs}/{state.wickets}
        </div>
        <div className="text-center text-green-200 text-sm mt-1">
          {formatOvers(state.legalBalls)} ov · RR {state.runRate}
        </div>
      </div>

      {/* Current players */}
      <div className="bg-white rounded-2xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-900">
            🏏 {striker?.name ?? '—'} * — {strikerStats.runs} ({strikerStats.balls})
          </span>
          <span className="text-gray-500">{strikerStats.fours}×4 {strikerStats.sixes}×6</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>{nonStriker?.name ?? '—'}</span>
        </div>
        <div className="border-t pt-2 flex justify-between text-sm">
          <span className="text-gray-600">⚾ {bowler?.name ?? '—'}</span>
          <span className="text-gray-500">{bowlerStats.overs}-{bowlerStats.runs}-{bowlerStats.wickets}</span>
        </div>
      </div>

      {/* Recent balls */}
      <div className="bg-white rounded-2xl p-4">
        <p className="text-xs text-gray-400 mb-2">This over</p>
        <RecentBalls balls={inningsBalls.filter(b => b.over_num === currentOver)} />
      </div>

      {/* Run buttons */}
      <div className="grid grid-cols-3 gap-3">
        {RUN_BUTTONS.map(runs => (
          <button
            key={runs}
            onClick={() => recordBall({ runs })}
            disabled={loading}
            className={`py-5 rounded-2xl text-2xl font-bold transition-colors disabled:opacity-50 ${
              runs === 4 ? 'bg-green-100 text-green-700 hover:bg-green-200' :
              runs === 6 ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' :
              'bg-white text-gray-800 hover:bg-gray-50 shadow-sm border border-gray-100'
            }`}
          >
            {runs}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setShowCustomModal(true)}
          className="py-3 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100"
        >
          Custom
        </button>
        <button
          onClick={() => setShowWicketModal(true)}
          className="py-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100"
        >
          Wicket 🔴
        </button>
        <button
          onClick={() => setShowExtrasModal(true)}
          className="py-3 bg-yellow-50 text-yellow-700 rounded-xl text-sm font-medium hover:bg-yellow-100"
        >
          Extras
        </button>
      </div>

      {/* Undo */}
      <button
        onClick={onUndo}
        disabled={loading || balls.length === 0}
        className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 disabled:opacity-40"
      >
        <RotateCcw className="w-4 h-4" /> Undo Last Ball
      </button>

      {/* Wicket modal */}
      {showWicketModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-w-lg mx-auto p-6">
            <h3 className="font-bold text-lg mb-4 text-gray-900">How was the wicket?</h3>
            <div className="grid grid-cols-2 gap-3">
              {WICKET_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => {
                    recordBall({ runs: 0, wicket_type: type.toLowerCase().replace(' ', ''), dismissed_player_id: strikerId })
                    setShowWicketModal(false)
                  }}
                  className="py-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium hover:bg-red-100"
                >
                  {type}
                </button>
              ))}
            </div>
            <button onClick={() => setShowWicketModal(false)} className="w-full mt-3 py-2 text-gray-500 text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Extras modal */}
      {showExtrasModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-w-lg mx-auto p-6">
            <h3 className="font-bold text-lg mb-4 text-gray-900">Extra type?</h3>
            <div className="grid grid-cols-2 gap-3">
              {EXTRA_TYPES.map(extra => (
                <button
                  key={extra.value}
                  onClick={() => {
                    recordBall({ runs: 0, extras: 1, extra_type: extra.value })
                    setShowExtrasModal(false)
                  }}
                  className="py-3 bg-yellow-50 text-yellow-700 rounded-xl text-sm font-medium hover:bg-yellow-100"
                >
                  {extra.label}
                </button>
              ))}
            </div>
            <button onClick={() => setShowExtrasModal(false)} className="w-full mt-3 py-2 text-gray-500 text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Custom runs modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-w-lg mx-auto p-6">
            <h3 className="font-bold text-lg mb-4 text-gray-900">Custom runs</h3>
            <input
              type="number"
              min={0}
              max={99}
              value={customRuns}
              onChange={e => setCustomRuns(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-green-500"
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowCustomModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium">
                Cancel
              </button>
              <button
                onClick={() => {
                  const runs = parseInt(customRuns)
                  if (!isNaN(runs) && runs >= 0) {
                    recordBall({ runs })
                    setShowCustomModal(false)
                    setCustomRuns('')
                  }
                }}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl text-sm font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
