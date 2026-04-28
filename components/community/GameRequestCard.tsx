import { Calendar, MapPin, Users } from 'lucide-react'
import type { GameRequest } from '@/lib/types'

interface Props {
  request: GameRequest
  currentUserId: string | null
  joinedRequestIds?: string[]
  onJoin: (id: string) => void
  onManage: (id: string) => void
}

const SPORT_EMOJI: Record<string, string> = {
  Cricket: '🏏',
  Football: '⚽',
  Badminton: '🏸',
  Basketball: '🏀',
}

export function GameRequestCard({ request, currentUserId, joinedRequestIds = [], onJoin, onManage }: Props) {
  const spotsLeft = Math.max(0, request.total_spots - request.filled_spots)
  const isAuthor = Boolean(currentUserId) && request.author_id === currentUserId
  const hasJoined = Boolean(currentUserId) && joinedRequestIds.includes(request.id)
  const isFull = request.status === 'full' || spotsLeft === 0
  const isCancelled = request.status === 'cancelled'

  const datetime = new Date(request.datetime)
  const isValidDate = !isNaN(datetime.getTime())
  const dateStr = isValidDate ? datetime.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : '—'
  const timeStr = isValidDate ? datetime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{SPORT_EMOJI[request.sport] ?? '🎮'}</span>
          <div>
            <span className="font-semibold text-gray-900">{request.sport}</span>
            {isCancelled && (
              <span className="ml-2 text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Cancelled</span>
            )}
            {!isCancelled && isFull && (
              <span className="ml-2 text-xs font-medium bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Full</span>
            )}
          </div>
        </div>
        {!isCancelled && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{spotsLeft} spots left</span>
          </div>
        )}
      </div>

      <div className="space-y-1 text-sm text-gray-600">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-gray-400" />
          <span>{request.venue_name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span>{dateStr} · {timeStr}</span>
        </div>
      </div>

      {request.description && (
        <p className="text-sm text-gray-500 leading-relaxed">{request.description}</p>
      )}

      <div className="pt-1">
        {isCancelled ? (
          <button disabled className="w-full bg-gray-50 text-gray-400 rounded-xl py-2.5 text-sm font-medium cursor-default">
            Cancelled
          </button>
        ) : isAuthor ? (
          <button
            onClick={() => onManage(request.id)}
            className="w-full bg-gray-100 text-gray-700 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Manage
          </button>
        ) : hasJoined ? (
          <button disabled className="w-full bg-green-50 text-green-600 rounded-xl py-2.5 text-sm font-medium cursor-default">
            Pending approval
          </button>
        ) : isFull ? (
          <button disabled className="w-full bg-gray-50 text-gray-400 rounded-xl py-2.5 text-sm font-medium cursor-default">
            No spots available
          </button>
        ) : (
          <button
            onClick={() => onJoin(request.id)}
            className="w-full bg-green-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Request to Join
          </button>
        )}
      </div>
    </div>
  )
}
