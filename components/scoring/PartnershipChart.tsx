'use client'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Ball } from '@/lib/types'

interface Props {
  balls: Ball[]
  innings: number
}

export function PartnershipChart({ balls, innings }: Props) {
  const inningsBalls = balls.filter(b => b.innings === innings)

  let cumulative = 0
  const data = inningsBalls
    .filter(b => b.extra_type !== 'wide' && b.extra_type !== 'noball')
    .map((ball, idx) => {
      cumulative += ball.runs + ball.extras
      return {
        ball: idx + 1,
        score: cumulative,
        wicket: ball.wicket_type ? cumulative : null,
      }
    })

  if (data.length === 0) {
    return <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No balls bowled</div>
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="ball" tick={{ fontSize: 10 }} label={{ value: 'Ball', position: 'insideBottom', offset: -2, fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <Area type="monotone" dataKey="score" stroke="#16a34a" fill="url(#scoreGradient)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
