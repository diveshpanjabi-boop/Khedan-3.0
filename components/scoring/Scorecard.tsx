import type { Ball, Player } from '@/lib/types'
import { deriveBatsmanStats, deriveBowlerStats, deriveInningsState, formatOvers } from '@/lib/scoring'

interface Props {
  balls: Ball[]
  innings: number
  battingPlayers: Player[]
  bowlingPlayers: Player[]
}

export function Scorecard({ balls, innings, battingPlayers, bowlingPlayers }: Props) {
  const inningsBalls = balls.filter(b => b.innings === innings)
  const state = deriveInningsState(inningsBalls)

  const batsmanIds = [...new Set(inningsBalls.map(b => b.batsman_id))]
  const bowlerIds = [...new Set(inningsBalls.map(b => b.bowler_id))]

  return (
    <div className="space-y-4">
      {/* Score summary */}
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900">{state.runs}/{state.wickets}</div>
        <div className="text-sm text-gray-500">{formatOvers(state.legalBalls)} ov · RR {state.runRate}</div>
      </div>

      {/* Batting */}
      <div className="bg-white rounded-2xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 grid grid-cols-5 text-xs font-medium text-gray-500 uppercase">
          <span className="col-span-2">Batter</span>
          <span className="text-right">R</span>
          <span className="text-right">B</span>
          <span className="text-right">SR</span>
        </div>
        {batsmanIds.map(id => {
          const stats = deriveBatsmanStats(inningsBalls, id)
          const player = battingPlayers.find(p => p.id === id)
          return (
            <div key={id} className="px-4 py-3 grid grid-cols-5 text-sm border-t border-gray-50">
              <div className="col-span-2">
                <p className="font-medium text-gray-900">{player?.name ?? id.slice(0, 8)}</p>
                {stats.isOut && <p className="text-xs text-gray-400">{stats.wicketType}</p>}
              </div>
              <span className="text-right font-semibold">{stats.runs}</span>
              <span className="text-right text-gray-500">{stats.balls}</span>
              <span className="text-right text-gray-500">{stats.strikeRate}</span>
            </div>
          )
        })}
      </div>

      {/* Bowling */}
      <div className="bg-white rounded-2xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 grid grid-cols-5 text-xs font-medium text-gray-500 uppercase">
          <span className="col-span-2">Bowler</span>
          <span className="text-right">O</span>
          <span className="text-right">R</span>
          <span className="text-right">W</span>
        </div>
        {bowlerIds.map(id => {
          const stats = deriveBowlerStats(inningsBalls, id)
          const player = bowlingPlayers.find(p => p.id === id)
          return (
            <div key={id} className="px-4 py-3 grid grid-cols-5 text-sm border-t border-gray-50">
              <span className="col-span-2 font-medium text-gray-900">{player?.name ?? id.slice(0, 8)}</span>
              <span className="text-right text-gray-500">{stats.overs}</span>
              <span className="text-right text-gray-500">{stats.runs}</span>
              <span className="text-right font-semibold">{stats.wickets}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
