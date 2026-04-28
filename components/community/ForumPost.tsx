import { Heart, MessageCircle, Pin } from 'lucide-react'
import type { ForumPost as ForumPostType } from '@/lib/types'

const CATEGORY_COLORS: Record<string, string> = {
  general: 'bg-gray-100 text-gray-600',
  match: 'bg-blue-50 text-blue-600',
  find_players: 'bg-green-50 text-green-600',
  tips: 'bg-yellow-50 text-yellow-600',
  tournament: 'bg-purple-50 text-purple-600',
}

interface Props {
  post: ForumPostType
  currentUserId: string | null
  onLike: (id: string) => void
  onOpen: (id: string) => void
}

export function ForumPost({ post, currentUserId, onLike, onOpen }: Props) {
  const liked = Boolean(currentUserId) && post.likes.includes(currentUserId!)
  const timeAgo = formatTimeAgo(post.created_at)

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-2 cursor-pointer active:bg-gray-50"
      onClick={() => onOpen(post.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {post.is_pinned && (
            <span className="flex items-center gap-1 text-xs text-orange-500 font-medium">
              <Pin className="w-3 h-3" /> Pinned
            </span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[post.category] ?? CATEGORY_COLORS.general}`}>
            {post.category.replace('_', ' ')}
          </span>
        </div>
        <span className="text-xs text-gray-400 shrink-0">{timeAgo}</span>
      </div>

      <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{post.title}</h3>
      <p className="text-sm text-gray-500 line-clamp-2">{post.content}</p>

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-gray-400">{post.author?.name ?? 'Unknown'}</span>
        <div className="flex items-center gap-3">
          <button
            onClick={e => { e.stopPropagation(); onLike(post.id) }}
            className={`flex items-center gap-1 text-xs font-medium transition-colors ${
              liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
            {post.likes.length}
          </button>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <MessageCircle className="w-4 h-4" />
            {post.comments_count ?? 0}
          </div>
        </div>
      </div>
    </div>
  )
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
