'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Ball } from '@/lib/types'

interface Props {
  balls: Ball[]
  innings: number
}

export function RunRateChart({ balls, innings }: Props) {
  const inningsBalls = balls.filter(b => b.innings === innings)

  const overMap: Record<number, number> = {}
  for (const ball of inningsBalls) {
    overMap[ball.over_num] = (overMap[ball.over_num] ?? 0) + ball.runs + ball.extras
  }

  const data = Object.entries(overMap).map(([over, runs]) => ({
    over: `Ov ${over}`,
    runs,
  }))

  if (data.length === 0) {
    return <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No overs completed</div>
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="over" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
            formatter={(value) => [`${value} runs`, 'Runs']}
          />
          <Bar dataKey="runs" fill="#16a34a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
