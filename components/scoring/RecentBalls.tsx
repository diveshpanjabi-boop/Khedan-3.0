import type { Ball } from '@/lib/types'

interface Props {
  balls: Ball[]
}

function ballLabel(ball: Ball): string {
  if (ball.wicket_type) return 'W'
  if (ball.extra_type === 'wide') return 'Wd'
  if (ball.extra_type === 'noball') return 'Nb'
  if (ball.runs === 0) return '·'
  return String(ball.runs)
}

function ballClass(ball: Ball): string {
  if (ball.wicket_type) return 'bg-red-100 text-red-700 font-bold'
  if (ball.runs === 6) return 'bg-purple-100 text-purple-700 font-bold'
  if (ball.runs === 4) return 'bg-green-100 text-green-700 font-bold'
  if (ball.extra_type) return 'bg-yellow-100 text-yellow-700'
  return 'bg-gray-100 text-gray-600'
}

export function RecentBalls({ balls }: Props) {
  const recent = balls.slice(-12)

  return (
    <div className="flex flex-wrap gap-1.5">
      {recent.map(ball => (
        <span
          key={ball.id}
          data-testid="ball-dot"
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${ballClass(ball)}`}
        >
          {ballLabel(ball)}
        </span>
      ))}
      {balls.length === 0 && (
        <span className="text-xs text-gray-400">No balls yet</span>
      )}
    </div>
  )
}
